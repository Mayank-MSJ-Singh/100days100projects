import boto3
from PIL import Image, ImageFilter
import io

s3 = boto3.client('s3')
rek = boto3.client('rekognition')

BUCKET = '018'
COLLECTION_ID = 'user-collection'

# Maximum dimension for resizing to speed up processing
MAX_DIM = 1024

def ensure_collection_and_index_references():
    # Check if collection exists
    collections = rek.list_collections()['CollectionIds']
    if COLLECTION_ID not in collections:
        rek.create_collection(CollectionId=COLLECTION_ID)

    # Check if faces already indexed
    faces = rek.list_faces(CollectionId=COLLECTION_ID)['Faces']
    if len(faces) > 0:
        return  # already indexed

    # Index reference images
    ref_objects = s3.list_objects_v2(Bucket=BUCKET, Prefix='references/').get('Contents', [])
    for obj in ref_objects:
        key = obj['Key']
        if key.endswith('/'):  # skip folder itself
            continue
        rek.index_faces(
            CollectionId=COLLECTION_ID,
            Image={'S3Object': {'Bucket': BUCKET, 'Name': key}},
            ExternalImageId=key.split('/')[-1].split('.')[0]
        )

def lambda_handler(event, context):
    # 1. Ensure collection exists and reference images are indexed
    ensure_collection_and_index_references()

    # 2. Get uploaded image info
    record = event['Records'][0]
    key = record['s3']['object']['key']

    # Only process images from input/
    if not key.startswith('input/'):
        return {'statusCode': 400, 'body': 'Not an input file'}

    # 3. Download image
    img_obj = s3.get_object(Bucket=BUCKET, Key=key)
    img = Image.open(io.BytesIO(img_obj['Body'].read()))

    # 4. Resize large images to reduce processing time
    img.thumbnail((MAX_DIM, MAX_DIM))

    # 5. Detect faces
    detect_resp = rek.detect_faces(
        Image={'S3Object': {'Bucket': BUCKET, 'Name': key}},
        Attributes=['DEFAULT']
    )

    # 6. Iterate faces and blur non-user faces
    for face_detail in detect_resp['FaceDetails']:
        box = face_detail['BoundingBox']
        left = int(box['Left'] * img.width)
        top = int(box['Top'] * img.height)
        width = int(box['Width'] * img.width)
        height = int(box['Height'] * img.height)

        face_region = img.crop((left, top, left + width, top + height))
        buf = io.BytesIO()
        face_region.save(buf, format='JPEG')
        buf.seek(0)

        # Check if face matches any reference user
        match = rek.search_faces_by_image(
            CollectionId=COLLECTION_ID,
            Image={'Bytes': buf.read()},
            MaxFaces=1,
            FaceMatchThreshold=90
        )

        if match['FaceMatches']:
            continue  # keep reference user face
        else:
            blurred = face_region.filter(ImageFilter.GaussianBlur(15))
            img.paste(blurred, (left, top))

    # 7. Save processed image to output/
    out_key = key.replace('input/', 'output/blurred_')
    out_buffer = io.BytesIO()
    img.save(out_buffer, format='JPEG')
    out_buffer.seek(0)
    s3.put_object(Bucket=BUCKET, Key=out_key, Body=out_buffer)

    return {'statusCode': 200, 'body': f'Processed image saved as {out_key}'}
