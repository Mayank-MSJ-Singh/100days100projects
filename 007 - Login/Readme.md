# 007 - Login

Static website hosted on AWS with full **Terraform** infrastructure automation.

**Live Demo:** [Login](https://d2nhqsq5gcikgy.cloudfront.net/)

**Architecture & Flow:**

* **S3** → Hosts the static site (`index.html`)
* **CloudFront** → Global CDN for fast and secure delivery
* **Terraform** → Infrastructure as code for fully automated and reproducible setup

**Terraform Structure:**

```
007 - Login
 |
 |-- terraform
 |    |-- variable.tf
 |    |-- provider.tf
 |    |-- s3.tf
 |    |-- cloudfront.tf
 |    |-- outputs.tf
 |
 |-- index.html
```

**Features:**

* No AWS Console required — fully code-defined infrastructure
* Repeatable deployments with `terraform apply`
* Cost-efficient, serverless static hosting
