# S3 Buckets
resource "aws_s3_bucket" "raw_bucket" {
  bucket = var.raw_bucket_name
}

resource "aws_s3_bucket" "processed_bucket" {
  bucket = var.processed_bucket_name
}

# SQS Queue
resource "aws_sqs_queue" "processing_queue" {
  name = var.sqs_queue_name
}

# IAM Assume Role Document for Lambda
data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# Lambda Roles
resource "aws_iam_role" "lambda1_role" {
  name               = "lambda1-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role" "lambda2_role" {
  name               = "lambda2-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

# Attach Managed Policies
resource "aws_iam_role_policy_attachment" "lambda1_sqs" {
  role       = aws_iam_role.lambda1_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda2_s3" {
  role       = aws_iam_role.lambda2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_logs1" {
  role       = aws_iam_role.lambda1_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_logs2" {
  role       = aws_iam_role.lambda2_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda2_sqs" {
  role       = aws_iam_role.lambda2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSQSFullAccess"
}
