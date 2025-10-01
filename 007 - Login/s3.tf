resource "aws_s3_bucket" "login_s3"{
  bucket = "007-login"
}

resource "aws_s3_bucket_public_access_block" "login_s3_block" {
  bucket                  = aws_s3_bucket.login_s3.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "login_s3_site" {
  bucket = aws_s3_bucket.login_s3.id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_policy" "login_s3_policy" {
  bucket = aws_s3_bucket.login_s3.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.login_s3.arn}/*"
      }
    ]
  })
}