# 011 - Serverless Media Processing Pipeline

A fully serverless, scalable pipeline for processing images and videos, deployed on **AWS** and automated with **Terraform**.

## Architecture & Flow

1. **S3 (Raw Bucket)** → Stores original media uploads
2. **Lambda 1 (S3 → SQS)** → Automatically triggers on new uploads, extracts metadata, and sends tasks to SQS
3. **SQS Queue (Processing Queue)** → Decouples uploads and processing for reliability
4. **Lambda 2 (Image/Video Processor)** → Processes media (resize, compress, extract frames) and uploads outputs
5. **S3 (Processed Bucket)** → Stores final processed media
6. **Terraform** → Infrastructure as code for automated, reproducible deployments

```aiignore
User Upload
     |
     v
S3 (Raw Bucket)  <-- Stores original media
     |
     v
Lambda 1 (S3 → SQS)  <-- Extracts metadata & sends messages
     |
     v
SQS Queue (Processing Queue)  <-- Decouples workflow & ensures reliability
     |
     v
Lambda 2 (Image/Video Processor)  
   /       |       \
  v        v        v
Resize   Compress   Extract Frames  <-- Processes media and uploads results
     |
     v
S3 (Processed Bucket)  <-- Stores final processed media

```

## Challenges & Solutions

* **Metadata issue / Key not recognized** → Standardized SQS message payload (`{ "bucket": "...", "key": "..." }`) and updated Lambda parsing
* **Pillow library in Lambda** → Missing native libraries solved using a prebuilt Lambda layer

## Features

* Fully serverless and scalable
* Reliable and decoupled via SQS
* Infrastructure-as-code with Terraform
* Analytics-ready output for dashboards or ML pipelines

## Why This Matters

* Demonstrates a real-world serverless media pipeline
* Shows automation and reproducibility using Terraform
* Teaches handling common AWS Lambda issues like dependencies and message formats
