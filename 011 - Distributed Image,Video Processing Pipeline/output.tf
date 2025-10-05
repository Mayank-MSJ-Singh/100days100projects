output "raw_bucket_name" {
  value = aws_s3_bucket.raw_bucket.bucket
}

output "processed_bucket_name" {
  value = aws_s3_bucket.processed_bucket.bucket
}

output "sqs_queue_url" {
  value = aws_sqs_queue.processing_queue.id
}

output "lambda1_arn" {
  value = aws_lambda_function.s3_to_sqs.arn
}

output "lambda2_arn" {
  value = aws_lambda_function.sqs_processor.arn
}
