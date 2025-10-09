# 006 - Paper

Interactive paper canvas deployed entirely on AWS S3 using **Terraform**.

**Live Demo:** [Paper](http://006-paper.s3-website.us-east-2.amazonaws.com/)

**Architecture & Flow:**

* **S3** → Hosting the frontend with website hosting enabled
* **Terraform** → Fully automated infrastructure setup (bucket creation, public access, policies)
* **AWS CLI** → Upload and deployment automation

**Features:**

* Interactive paper canvas
* Fully automated, repeatable, and scalable deployment
* Hands-on practice with infrastructure as code
