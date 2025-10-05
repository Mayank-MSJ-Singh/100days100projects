variable "region" {
  type    = string
  default = "us-east-2"
}

variable "raw_bucket_name" {
  type    = string
  default = "010-raw"
}

variable "processed_bucket_name" {
  type    = string
  default = "010-processed"
}


variable "sqs_queue_name" {
  type    = string
  default = "010-processing-queue"
}
