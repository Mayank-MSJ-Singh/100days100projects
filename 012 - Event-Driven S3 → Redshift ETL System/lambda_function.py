import boto3
import pandas as pd
import io
from urllib.parse import unquote_plus
import os

s3 = boto3.client('s3')

RAW_PREFIX = "raw/"
PROCESSED_PREFIX = "processed/"
FAILED_PREFIX = "failed/"

REQUIRED_COLUMNS = ['id', 'ts', 'value']

def read_csv_from_s3(bucket, key):
    response = s3.get_object(Bucket=bucket, Key=key)
    content = response['Body'].read().decode('utf-8')
    df = pd.read_csv(io.StringIO(content))
    return df

def write_csv_to_s3(bucket, key, df):
    print(f"[DEBUG] Writing DataFrame to s3://{bucket}/{key} with shape {df.shape}")
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    s3.put_object(Bucket=bucket, Key=key, Body=csv_buffer.getvalue())


def lambda_handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = unquote_plus(record['s3']['object']['key'])
        try:
            df = read_csv_from_s3(bucket, key)

            if not set(REQUIRED_COLUMNS).issubset(df.columns):
                raise ValueError(f"Missing required columns in {key}. Found columns: {df.columns.tolist()}")

            df['ts'] = pd.to_datetime(df['ts'], errors='coerce')
            df = df.dropna(subset=REQUIRED_COLUMNS)

            processed_key = key.replace(RAW_PREFIX, PROCESSED_PREFIX)

            write_csv_to_s3(bucket, processed_key, df)

            # Delete original raw file
            s3.delete_object(Bucket=bucket, Key=key)

        except Exception as e:
            failed_key = key.replace(RAW_PREFIX, FAILED_PREFIX)
            try:
                # Copy before deleting
                obj = s3.get_object(Bucket=bucket, Key=key)
                content = obj['Body'].read()
                s3.put_object(Bucket=bucket, Key=failed_key, Body=content)
                s3.delete_object(Bucket=bucket, Key=key)
            except Exception as inner_e:
                print(f"[CRITICAL] Failed to move file to failed/: {str(inner_e)}")
            raise
