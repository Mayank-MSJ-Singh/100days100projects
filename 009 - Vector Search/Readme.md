# 009 - Vector Search

A mini vector search engine implemented in **Python** to understand the core concepts behind modern retrieval systems such as **FAISS** and **RAG (Retrieval-Augmented Generation)**. Instead of relying on pre-built embeddings, this project builds everything from scratch to show exactly how queries are matched to documents using vector similarity.

## Features

* Converts documents into vectors using **word-count dictionaries**
* Computes similarity between query and documents using **cosine similarity**
* Simple, from-scratch implementation for educational purposes
* Helps understand the foundation of vector-based search before moving to AI embeddings

## Tech Stack / Approach

* **Python** → Implements the vectorization and search logic
* **Cosine Similarity** → Measures relevance between a query and all document vectors
* **Word-count dictionaries** → Converts text into numerical vectors for comparison

## How It Works

1. Each document is converted into a vector representation based on word counts.
2. A user query is also converted into a vector in the same space.
3. Cosine similarity is calculated between the query vector and each document vector.
4. The document(s) with the highest similarity score are returned as the most relevant results.

## Why This Matters

* Provides a deep understanding of how **vector-based retrieval** works under the hood.
* Demonstrates the core principle behind **RAG systems**: retrieving relevant documents efficiently.
* Educational exercise for anyone looking to implement **custom search systems** before using more complex AI embeddings.
