# Docker Deployment Guide

## What You Now Have

Your full-stack app is containerized and running:
- **Frontend**: React app at `http://localhost:3000`
- **Backend**: Node.js API at `http://localhost:5000`
- **Database**: PostgreSQL running in a container

## Access from Your Local Network (Any Device)

To access your app from another device on your network:

### 1. Find Your Machine's IP Address

**Windows/Mac/Linux (Command Prompt/Terminal):**
```bash
ipconfig          # Windows
ifconfig          # Mac/Linux
hostname -I       # Linux
```

Look for your local IP (usually `192.168.x.x` or `10.x.x.x`).

### 2. Access from Another Device

On any device on your network, open a browser and go to:
```
http://<YOUR_MACHINE_IP>:3000
```

Example: `http://192.168.1.50:3000`

---

## Deploy to the Cloud (Public Access)

To make your app accessible from anywhere on the internet:

### Option A: Cloud Hosting (Easiest)

**Recommended platforms (free tier available):**
- **Railway.app** - Push code, auto-deploys
- **Render** - Simple free tier
- **Fly.io** - Global deployment
- **Vercel** (frontend only) + Render/Railway (backend)

**Steps:**
1. Push your code to GitHub
2. Connect repo to chosen platform
3. Set environment variables (JWT_SECRET, DATABASE_URL)
4. Deploy

### Option B: VPS Server (Self-Hosted)

1. Get a VPS (AWS, DigitalOcean, Linode, Hetzner)
2. Install Docker on the server
3. Clone your repo and run `docker compose up -d`
4. Point your domain to the server's IP
5. Use Nginx as a reverse proxy for HTTPS

### Option C: Docker Compose (Production Settings)

Update `.env` for production:
```
JWT_SECRET=use-a-very-secure-random-string-here
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
```

Update `docker-compose.yml` to use environment variables properly.

---

## Local Development vs Production

### Development (What You Have Now)
```bash
docker compose up -d
```
- All services run locally
- Accessible only on your network
- No HTTPS needed
- Easy to test and debug

### Production Requirements
- Use a domain name
- Set up HTTPS/SSL (Let's Encrypt)
- Use proper environment variables
- Set stronger JWT_SECRET
- Consider database backups
- Use reverse proxy (Nginx)
- Enable CORS properly

---

## Container Management

### View logs
```bash
docker compose logs backend       # Backend logs
docker compose logs frontend      # Frontend logs
docker compose logs postgres      # Database logs
```

### Stop containers
```bash
docker compose down
```

### Rebuild and restart
```bash
docker compose up -d --build
```

### Check running containers
```bash
docker compose ps
```

---

## Important Security Notes

1. Change `JWT_SECRET` in `.env` to a strong random string
2. Never commit `.env` to GitHub (it's already in `.gitignore`)
3. Use HTTPS in production
4. Validate all API inputs on the backend
5. Keep dependencies updated: `npm audit fix`

---

## Next Steps

- Test the app at `http://localhost:3000`
- Try accessing from another device on your network
- Deploy to the cloud when ready
- Set up monitoring and backups
