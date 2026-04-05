# 🚀 Billing Management System

[![CI](https://github.com/Boominathan2355/billing-software/actions/workflows/ci.yml/badge.svg)](https://github.com/Boominathan2355/billing-software/actions/workflows/ci.yml)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FBoominathan2355%2Fbilling-software)

A high-performance, enterprise-ready billing and inventory management suite. Optimized for **Serverless Fullstack** execution on Vercel with a focus on speed, security, and developer experience.

---

## 🌟 Key Features
- **Real-time Billing**: Instant invoice generation with dynamic tax calculations.
- **Inventory Tracking**: Automated stock management and low-stock alerts.
- **Secure Authentication**: Robust JWT-based auth with auto-seeding for admins.
- **Cloud-Native**: Fully optimized for Vercel Serverless Functions and MongoDB Atlas.
- **Modern UI**: Clean, responsive dashboard built with React and Vite.

## 📂 Monorepo Architecture
- **`server/`**: The Node.js/Express backend, refactored for **Vercel Serverless Functions**.
- **`mobile-app/`**: The React/Vite frontend, automatically deployed and routed.
- **`public/`**: Consolidated static assets for unified hosting.

## 🛠 Tech Stack
- **Backend**: Node.js, Express, TypeScript, Mongoose
- **Frontend**: React, Vite, TypeScript, Lucide Icons
- **Hosting**: Vercel (Frontend + Serverless Backend)
- **Database**: MongoDB (Atlas/Direct connection)
- **CI/CD**: GitHub Actions

---

## 🚀 Getting Started

### Local Development
1. **Install All Dependencies**:
   ```bash
   npm install
   ```
2. **Launch Dev Environment**:
   ```bash
   npm run dev
   ```
   *This starts both the Backend (5000) and Frontend (5173) concurrently.*

### Environment Configuration
Create an `.env` file in the `server/` directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_key
PORT=5000
```

---

## ☁️ Deployment

This repository is optimized for **Vercel**. Every push to the `feature/billing` branch triggers an automated fullstack deployment.

> [!IMPORTANT]
> **Dashboard Configuration**: 
> 1. Ensure the "Output Directory" in Vercel is **NOT overridden** (set to root).
> 2. Add your `MONGO_URI` and `JWT_SECRET` to the Vercel Environment Variables.

## 📄 License
Private Project - © 2026 Admin Suite
