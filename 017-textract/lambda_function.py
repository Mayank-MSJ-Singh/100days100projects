import json
import boto3
import uuid
from PIL import Image
import io

# AWS clients
textract = boto3.client("textract")
dynamodb = boto3.client("dynamodb")
s3 = boto3.client("s3")

DDB_TABLE = "017-textract"

def convert_webp_to_png(bucket, key):
    """
    Converts a .webp file in S3 to PNG bytes for Textract
    """
    if not key.lower().endswith(".webp"):
        return None
    obj = s3.get_object(Bucket=bucket, Key=key)
    img_bytes = obj['Body'].read()
    im = Image.open(io.BytesIO(img_bytes))
    png_bytes = io.BytesIO()
    im.save(png_bytes, format="PNG")
    png_bytes.seek(0)
    return png_bytes.read()

def extract_header_data(blocks):
    """
    Extract invoice_number, invoice_date, total_amount, vendor from LINE blocks
    """
    data = {}
    for block in blocks:
        if block["BlockType"] == "LINE":
            text = block["Text"].lower()
            if "invoice" in text and "number" in text:
                data["invoice_number"] = block["Text"]
            elif "date" in text:
                data["invoice_date"] = block["Text"]
            elif "total" in text:
                data["total_amount"] = block["Text"]
            elif "vendor" in text:
                data["vendor"] = block["Text"]
    return data

def extract_table_data(blocks):
    """
    Extract line items from tables and return clean list of dicts
    """
    table_blocks = [b for b in blocks if b["BlockType"] == "TABLE"]
    cell_blocks = {b["Id"]: b for b in blocks if b["BlockType"] == "CELL"}

    all_items = []

    for table in table_blocks:
        rows = {}
        # Build rows
        for rel in table.get("Relationships", []):
            if rel["Type"] == "CHILD":
                for cell_id in rel["Ids"]:
                    cell = cell_blocks[cell_id]
                    row_idx = cell["RowIndex"]
                    text = ""
                    for c_rel in cell.get("Relationships", []):
                        if c_rel["Type"] == "CHILD":
                            for word_id in c_rel["Ids"]:
                                word_block = next((b for b in blocks if b["Id"] == word_id), None)
                                if word_block and word_block["BlockType"] == "WORD":
                                    text += word_block["Text"] + " "
                    text = text.strip()
                    if row_idx not in rows:
                        rows[row_idx] = []
                    rows[row_idx].append(text)
        # Convert rows to list of dicts using second row as header
        if len(rows) >= 2:
            headers = [h.lower().replace(" ", "_") for h in rows[2]] if 2 in rows else [h.lower().replace(" ", "_") for h in rows[1]]
            for i in range(3, len(rows)+1):
                row_data = {}
                row = rows[i]
                for j, val in enumerate(row):
                    if j < len(headers):
                        row_data[headers[j]] = val
                if row_data:
                    all_items.append(row_data)
    return all_items

def lambda_handler(event, context):
    # 1️⃣ Get S3 object info
    record = event['Records'][0]
    bucket = record['s3']['bucket']['name']
    key = record['s3']['object']['key']
    print(f"Processing file: s3://{bucket}/{key}")

    # 2️⃣ Convert webp if needed
    webp_bytes = convert_webp_to_png(bucket, key)
    if webp_bytes:
        document = {'Bytes': webp_bytes}
    else:
        document = {'S3Object': {'Bucket': bucket, 'Name': key}}

    # 3️⃣ Call Textract
    response = textract.analyze_document(
        Document=document,
        FeatureTypes=["FORMS", "TABLES"]
    )

    # 4️⃣ Extract header and table data
    header_data = extract_header_data(response["Blocks"])
    line_items = extract_table_data(response["Blocks"])

    # 5️⃣ Prepare DynamoDB item
    item_data = {
        "id": str(uuid.uuid4()),
        "s3_file": key,
        **header_data,
        "line_items": line_items
    }

    # DynamoDB requires type mapping
    ddb_item = {}
    for k, v in item_data.items():
        if k in ["total_amount"]:  # try to store numeric values if possible
            try:
                v_num = float(v.replace("$", "").replace(",", ""))
                ddb_item[k] = {"N": str(v_num)}
            except:
                ddb_item[k] = {"S": str(v)}
        elif isinstance(v, str):
            ddb_item[k] = {"S": v}
        else:
            # store lists/dicts as JSON strings
            ddb_item[k] = {"S": json.dumps(v)}

    # 6️⃣ Put item into DynamoDB
    dynamodb.put_item(TableName=DDB_TABLE, Item=ddb_item)

    print("Invoice processed and stored in DynamoDB:", item_data)

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Invoice processed", "data": item_data})
    }
