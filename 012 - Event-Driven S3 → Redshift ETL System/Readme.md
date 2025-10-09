# 012 - Automating Data Pipelines on AWS + Redshift

A serverless data pipeline that automates ingestion, validation, and processing of CSV files, with seamless integration into **AWS Redshift**.

## Architecture & Flow

```aiignore
    User Upload
         |
         v
     S3 (raw/)  <-- Users/producers upload CSV files here
         |
         v
       Lambda  <-- Reads CSV, validates columns, converts timestamps, drops invalid rows
       /      \
      v        v
S3 (processed/)    S3 (failed/)
      |               |
      v               v
 Redshift (COPY from S3)  <-- Only valid files are loaded into Redshift

```

1. **S3 (Raw Bucket)** → Stores incoming CSV files
2. **Lambda** → Automatically triggered on new uploads to:

    * Clean and validate data
    * Move processed files to `processed/`
    * Move invalid files to `failed/`
3. **S3 (Processed / Failed Buckets)** → Stores processed and failed files separately
4. **Redshift** → Directly connected to S3 to load cleaned data into the warehouse automatically

## Features

* Fully automated data pipeline
* Serverless processing using AWS Lambda
* Data validation and segregation of bad files
* Seamless Redshift integration for analytics-ready data

## Why This Matters

* Demonstrates building a fully automated ETL pipeline
* Reduces manual intervention for data cleaning and loading
* Provides a foundation for scalable, serverless data workflows
