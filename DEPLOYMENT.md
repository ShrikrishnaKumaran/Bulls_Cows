# 🚀 Render.com Deployment Guide

## Overview
This app consists of two services on Render:
1. **Backend** - Node.js Web Service
2. **Frontend** - Static Site

---

## Step 1: Deploy Backend (Web Service)

### Create Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `bulls-cows-backend` |
| **Root Directory** | `Backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (or your choice) |

### Environment Variables
Add these in the **Environment** tab:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bulls_cows
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
CLIENT_URL=https://your-frontend-app.onrender.com
```

> ⚠️ **Important:** Generate strong random strings for JWT secrets!
> Use: `openssl rand -base64 32` or an online generator

### After Deploy
Copy your backend URL (e.g., `https://bulls-cows-backend.onrender.com`)

---

## Step 2: Deploy Frontend (Static Site)

### Create Service
1. Click **New** → **Static Site**
2. Connect the same GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `bulls-cows-frontend` |
| **Root Directory** | `Frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Environment Variables
Add these in the **Environment** tab:

```
VITE_API_URL=https://bulls-cows-backend.onrender.com
VITE_SOCKET_URL=https://bulls-cows-backend.onrender.com
```

> Replace with your actual backend URL from Step 1

---

## Step 3: Update Backend CORS

After getting your frontend URL:
1. Go to your **Backend** service on Render
2. Update the `CLIENT_URL` environment variable:
   ```
   CLIENT_URL=https://bulls-cows-frontend.onrender.com
   ```
3. Click **Save Changes** (will auto-redeploy)

---

## 🔄 Redeployment

### Auto Deploy
- Enabled by default on push to main branch

### Manual Deploy
- Go to your service → Click **Manual Deploy** → **Deploy latest commit**

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure `CLIENT_URL` in backend matches your frontend URL exactly (no trailing slash)
- Check both services are deployed and running

### Socket Connection Issues
- Verify `VITE_SOCKET_URL` points to your backend
- Check browser console for connection errors

### Database Connection
- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access (for Render's dynamic IPs)
- Verify connection string is correct

### Cold Starts (Free Tier)
- Free tier services sleep after 15 mins of inactivity
- First request after sleep takes 30-60 seconds
- Consider upgrading for always-on services

---

## 📁 Project Structure for Render

```
Bulls_Cows/
├── Backend/          ← Web Service (Root Directory: Backend)
│   ├── package.json
│   ├── server.js
│   └── ...
├── Frontend/         ← Static Site (Root Directory: Frontend)
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.production
│   └── ...
└── DEPLOYMENT.md
```
