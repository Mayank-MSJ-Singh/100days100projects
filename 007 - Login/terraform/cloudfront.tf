resource "aws_cloudfront_distribution" "login_cdn" {
  # Origins: link to your S3 bucket
  origin {
    domain_name = aws_s3_bucket.login_s3.bucket_regional_domain_name
    origin_id   = "007-login"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]

    target_origin_id = "007-login"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  enabled             = true
  default_root_object = "index.html"


  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

}
