# 🚀 Billing Management System

A full-stack, enterprise-ready billing and inventory management software built with **Node.js**, **Express**, **TypeScript**, and **Vite**.

## 📁 Project Structure

This project is a monorepo containing:
- **`server/`**: Backend API (Express.js), hosted as **Vercel Serverless Functions**.
- **`mobile-app/`**: Modern frontend dashboard (React + Vite), hosted on **Vercel**.

## 🛠 Tech Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Frontend**: React, Vite, TypeScript
- **Deployment**: **Vercel** (Fullstack Deployment)
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Local Development

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start both server and frontend together**:
    ```bash
    npm run dev
    ```

### Deployment

This project is fully hosted on **Vercel**.
- **Frontend & API**: Automated deployments for the **`feature/billing`** branch.

> [!IMPORTANT]
> Ensure you have configured your **Environment Variables** (`MONGO_URI`, `JWT_SECRET`) in the Vercel Dashboard for both the frontend and backend to communicate with the database.

## 📄 License
Private Project - © 2026
