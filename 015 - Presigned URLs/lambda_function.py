import json
import boto3
import os

s3 = boto3.client('s3')
BUCKET_NAME = os.environ.get('STORAGE_BUCKET', '014-storage')

# Default CORS headers
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "http://014-presigned-url.s3-website.us-east-2.amazonaws.com",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Content-Type": "application/json"
}

def lambda_handler(event, context):
    # Handle preflight OPTIONS request
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "CORS preflight OK"})
        }

    path = event.get('path', '')
    method = event.get('httpMethod', '')

    try:
        body = {}
        if event.get('body'):
            body = json.loads(event['body'])

        # === Upload URL ===
        if path.endswith("/generate-upload-url") and method == "POST":
            filename = body.get("filename") or body.get("file_name")
            if not filename:
                raise ValueError("Filename is required")
            url = s3.generate_presigned_url(
                ClientMethod='put_object',
                Params={'Bucket': BUCKET_NAME, 'Key': filename},
                ExpiresIn=300
            )
            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({"upload_url": url, "file_key": filename})
            }

        # === Download URL ===
        elif path.endswith("/generate-download-url") and method == "POST":
            filename = body.get("filename") or body.get("file_name")
            if not filename:
                raise ValueError("Filename is required")
            url = s3.generate_presigned_url(
                ClientMethod='get_object',
                Params={'Bucket': BUCKET_NAME, 'Key': filename},
                ExpiresIn=300
            )
            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({"download_url": url})
            }

        # === List files ===
        elif path.endswith("/list-files") and method == "GET":
            objects = s3.list_objects_v2(Bucket=BUCKET_NAME)
            files = [obj['Key'] for obj in objects.get('Contents', [])]
            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({"files": files})
            }

        # Unknown path
        else:
            return {
                "statusCode": 404,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Not Found"})
            }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)})
        }
