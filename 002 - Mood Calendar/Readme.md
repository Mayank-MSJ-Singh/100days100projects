# 002 - Mood Calendar

A hands-on AWS serverless project to log daily moods for 2025.

**Live Demo:** [Mood Calendar](http://002-mood-calendar.s3-website.us-east-2.amazonaws.com)

**Architecture & Flow:**

* **S3** → Hosting the frontend (HTML, CSS, JavaScript)
* **API Gateway (HTTP API)** → Routing requests
* **Lambda** → Serverless functions to save & fetch moods
* **DynamoDB** → Stores moods using `UserId + Date` as keys
* **CI/CD** → Automated deployment

**Features:**

* Log your mood each day of 2025
* Instantly reflected on the calendar
* Simple and lightweight design
