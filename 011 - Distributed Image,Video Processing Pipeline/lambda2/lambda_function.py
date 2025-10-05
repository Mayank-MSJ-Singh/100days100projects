import json
import boto3
import os
from io import BytesIO
from PIL import Image

s3 = boto3.client('s3')
PROCESSED_BUCKET = os.environ.get('PROCESSED_BUCKET')  # Set in Lambda environment variables

def lambda_handler(event, context):
    for record in event['Records']:
        body = json.loads(record['body'])
        bucket = body['bucket']
        key = body['key']
        operation = body.get('operation', 'resize')

        # Download file from S3
        s3_object = s3.get_object(Bucket=bucket, Key=key)
        file_content = s3_object['Body'].read()

        # Example processing: resize image
        img = Image.open(BytesIO(file_content))
        img = img.resize((256, 256))  # Resize to 256x256

        # Save processed image to bytes
        output_buffer = BytesIO()
        img.save(output_buffer, format='JPEG')
        output_buffer.seek(0)

        # Upload to processed bucket
        processed_key = f"processed/{key}"
        s3.put_object(
            Bucket=PROCESSED_BUCKET,
            Key=processed_key,
            Body=output_buffer,
            ContentType='image/jpeg'
        )

    return {
        'statusCode': 200,
        'body': json.dumps('Processing complete')
    }
