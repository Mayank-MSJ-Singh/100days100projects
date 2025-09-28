# Catch the Insect Game – Full Cloud Setup

## Overview

“Catch the Insect” is a browser-based game where players catch insects on the screen. Scores and events are sent to AWS services for storage and analytics. The game uses a serverless architecture with **AWS Lambda, DynamoDB, Kinesis, and S3**.

### Architecture Flow

```
Player Browser
     |
     v
CloudFront  <-- S3 (game files)
     |
     v
 API Gateway
     |
     v
   Lambda
   /     \
  v       v
DynamoDB   Kinesis Stream
   |           |
 Leaderboard   v
               Firehose -> S3 -> Athena/QuickSight
```

---

## Features

1. Enter a **Player ID** at the start.
2. Choose your favorite insect.
3. Catch insects on the screen.
4. Track **score** and **time**.
5. Send **score** to DynamoDB.
6. Send **events** (e.g., `insectCaught`) to **Kinesis Stream**, which is then sent to S3 via **Firehose** for analytics.
7. **Stop button**: ends the game and sends the final score.
8. Full browser support with **CloudFront + S3 hosting**.

---

## Game Flow

1. Player enters their **Player ID**.
2. Player chooses an insect.
3. Game screen appears with timer and score.
4. Player clicks insects to catch them.
5. Each click:

    * Updates the score locally.
    * Sends an **event** to API Gateway → Lambda → Kinesis.
6. On pressing **Stop**, the final score is sent to API Gateway → Lambda → DynamoDB.
7. Leaderboard (optional) can query DynamoDB via a **GSI**.

---

## AWS Components

* **S3**: Hosts game files (`index.html`, `style.css`, `script.js`).
* **CloudFront**: Serves S3 content globally.
* **API Gateway**: REST API endpoints:

    * `/score` (POST) – Save final score to DynamoDB
    * `/event` (POST) – Send game events to Kinesis
* **Lambda**: Handles API logic for `/score` and `/event`.
* **DynamoDB**: Stores scores with `playerId` as partition key and `timestamp` as sort key.
* **Kinesis Stream**: Collects events for analytics.
* **Firehose → S3 → Athena/QuickSight**: Optional analytics on player behavior.

---

## Game Files

* `index.html` – Game interface with Player ID input and Stop button
* `style.css` – Styling for game screen, insects, buttons, and input
* `script.js` – Game logic, event handling, API integration

---

## Setup Instructions

### 1. S3 + CloudFront

1. Upload game files (`index.html`, `style.css`, `script.js`) to **S3 bucket**.
2. Enable **static website hosting** on the S3 bucket.
3. Connect S3 to **CloudFront** for CDN delivery.

### 2. API Gateway + Lambda

1. Create **REST API**.
2. Add endpoints:

    * `POST /score` → Lambda to save DynamoDB score
    * `POST /event` → Lambda to send Kinesis event
3. Enable **CORS** for frontend requests (`Access-Control-Allow-Origin: *`).

### 3. DynamoDB

1. Create a table:

    * **Partition key**: `playerId` (String)
    * **Sort key**: `timestamp` (String)
    * Optional GSI: `gameId-score-index` for leaderboard

### 4. Kinesis + Firehose

1. Create **Kinesis Stream** for events.
2. Connect **Firehose** to the stream → S3 for storage.
3. Use **Athena/QuickSight** to query and visualize events.

### 5. Connect Game to API

* Update `script.js` with your API Gateway URLs:

```js
const API_BASE = 'https://<YOUR-API-ID>.execute-api.us-east-2.amazonaws.com/<STAGE>';
```

* Game automatically sends:

    * Events when insects are caught
    * Final score on Stop button

### 6. Local Testing

* Run a simple HTTP server for local testing:

```bash
python3 -m http.server 8000
```

* Visit `http://localhost:8000`

* Ensure **CORS** headers are allowed on API Gateway.

---

## Game Controls

* **Start**: Enter Player ID → Click Start → Choose insect
* **Catch insects**: Click insects appearing randomly
* **Stop**: Ends game, sends score to backend
* **Leaderboard**: Optional query via DynamoDB GSI

---

## Notes

* Score data **does not persist** if Stop is not pressed. Always stop the game to send final score.
* Events are stored in Kinesis **for analytics**, not directly tied to the score.
* Ensure **CORS** is properly configured for API requests.

---

This README gives anyone a complete understanding of the game flow, cloud setup, and how to test locally.

---