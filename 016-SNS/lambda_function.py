import json
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('016-sns')


def lambda_handler(event, context):
    print("Received event:", json.dumps(event))

    for record in event['Records']:
        message = json.loads(record['Sns']['Message'])
        s3_info = message['Records'][0]['s3']
        bucket = s3_info['bucket']['name']
        file_key = s3_info['object']['key']

        table.put_item(Item={
            'id': file_key + '-' + str(datetime.now().timestamp()),
            'bucket': bucket,
            'file_key': file_key,
            'timestamp': str(datetime.now())
        })

    return {"status": "logged"}
