# -----------------------------
# Lambda 1: S3 -> SQS
# -----------------------------
resource "aws_lambda_function" "s3_to_sqs" {
  filename         = "lambda1/lambda1.zip"
  function_name    = "s3_to_sqs"
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.11"
  role             = aws_iam_role.lambda1_role.arn
  source_code_hash = filebase64sha256("lambda1/lambda1.zip")

  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.processing_queue.id
    }
  }
}

# Allow S3 to invoke Lambda 1
resource "aws_lambda_permission" "allow_s3_invoke" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.s3_to_sqs.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.raw_bucket.arn
}

# S3 Bucket Notification to Lambda 1
resource "aws_s3_bucket_notification" "raw_bucket_event" {
  bucket = aws_s3_bucket.raw_bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.s3_to_sqs.arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [
    aws_lambda_function.s3_to_sqs,
    aws_lambda_permission.allow_s3_invoke
  ]
}

# -----------------------------
# Lambda 2: SQS -> Processing -> S3
# -----------------------------
resource "aws_lambda_function" "sqs_processor" {
  filename         = "lambda2/lambda2.zip"
  function_name    = "sqs_processor"
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.11"
  role             = aws_iam_role.lambda2_role.arn
  source_code_hash = filebase64sha256("lambda2/lambda2.zip")

  environment {
    variables = {
      PROCESSED_BUCKET = aws_s3_bucket.processed_bucket.bucket
    }
  }
}

# SQS -> Lambda 2 Event Source Mapping
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = aws_sqs_queue.processing_queue.arn
  function_name    = aws_lambda_function.sqs_processor.arn
  batch_size       = 1
  enabled          = true
}
