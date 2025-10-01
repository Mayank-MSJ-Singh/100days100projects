# Outputs
output "s3_bucket_name" {
  value = aws_s3_bucket.login_s3.bucket
}

output "s3_bucket_website_url" {
  value = "http://${aws_s3_bucket.login_s3.bucket}.s3-website.${var.aws_region}.amazonaws.com"
}

output "cloudfront_url" {
  description = "The URL of the CloudFront distribution"
  value       = aws_cloudfront_distribution.login_cdn.domain_name
}
