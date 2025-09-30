variable "aws_region" {
  default = "us-east-2"
}

provider "aws" {
  region = var.aws_region
}

# S3 bucket
resource "aws_s3_bucket" "paper" {
  bucket = "006-paper"
}

# Public access block (disable all restrictions)
resource "aws_s3_bucket_public_access_block" "paper_block" {
  bucket                  = aws_s3_bucket.paper.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Website configuration
resource "aws_s3_bucket_website_configuration" "paper_site" {
  bucket = aws_s3_bucket.paper.id

  index_document {
    suffix = "index.html"
  }
}

# Bucket policy to allow public read
resource "aws_s3_bucket_policy" "paper_policy" {
  bucket = aws_s3_bucket.paper.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.paper.arn}/*"
      }
    ]
  })
}

# Outputs
output "s3_bucket_name" {
  value = aws_s3_bucket.paper.bucket
}

output "s3_bucket_website_url" {
  value = "http://${aws_s3_bucket.paper.bucket}.s3-website-${var.aws_region}.amazonaws.com"
}
