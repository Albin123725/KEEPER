# Deployment Guide: GitHub to Render

This guide will walk you through deploying your Minecraft bot from GitHub to Render.

## Prerequisites

Before you begin, make sure you have:
- A [GitHub](https://github.com) account
- A [Render](https://render.com) account (free tier available)
- Your Minecraft server details:
  - Server host (e.g., `your-server.aternos.me`)
  - Server port (e.g., `12635`)
  - Bot username
  - Minecraft version (e.g., `1.21.10`)

## Step 1: Push Your Code to GitHub

1. **Initialize Git Repository** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Minecraft bot for Render"
   ```

2. **Create a New Repository on GitHub**
   - Go to [GitHub](https://github.com/new)
   - Create a new repository (e.g., `minecraft-bot-keeper`)
   - Don't initialize with README, .gitignore, or license

3. **Push to GitHub**
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

## Step 2: Deploy to Render

### Method 1: Using Blueprint (Recommended)

This method uses the `render.yaml` file for automatic configuration.

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click **"New +"** button → Select **"Blueprint"**

2. **Connect Repository**
   - Select **"Connect a repository"**
   - Choose your GitHub repository
   - Click **"Connect"**

3. **Configure Blueprint**
   - Render will automatically detect the `render.yaml` file
   - Review the service configuration
   - Click **"Apply"** to create the service

4. **Add Environment Variables**
   - After deployment starts, go to your service dashboard
   - Navigate to **"Environment"** tab
   - Add these variables:
     ```
     MINECRAFT_SERVER_HOST=your-server.aternos.me
     MINECRAFT_SERVER_PORT=12635
     MINECRAFT_BOT_USERNAME=AternosKeeper
     MINECRAFT_VERSION=1.21.10
     ```
   - Click **"Save Changes"**

5. **Redeploy**
   - After adding environment variables, click **"Manual Deploy"** → **"Deploy latest commit"**

### Method 2: Manual Setup

If you prefer manual setup or Blueprint doesn't work:

1. **Create New Web Service**
   - In Render dashboard, click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Select your GitHub repository
   - Click **"Connect"**

3. **Configure Service**
   - **Name**: `minecraft-bot` (or your choice)
   - **Region**: Choose closest to your Minecraft server
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   - In the "Environment Variables" section, add:
     ```
     MINECRAFT_SERVER_HOST=your-server.aternos.me
     MINECRAFT_SERVER_PORT=12635
     MINECRAFT_BOT_USERNAME=AternosKeeper
     MINECRAFT_VERSION=1.21.10
     ```

5. **Advanced Settings** (Optional)
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: Enable

6. **Create Web Service**
   - Click **"Create Web Service"**
   - Wait for deployment to complete

## Step 3: Verify Deployment

1. **Check Logs**
   - In Render dashboard, go to your service
   - Click on **"Logs"** tab
   - Look for messages like:
     ```
     Health check server listening on port 3000
     Bot logged in as AternosKeeper
     Bot spawned in the world
     ```

2. **Test Health Endpoint**
   - Your service will have a URL like: `https://minecraft-bot-xxx.onrender.com`
   - Visit: `https://minecraft-bot-xxx.onrender.com/health`
   - You should see JSON output with bot status

3. **Check Minecraft Server**
   - Connect to your Minecraft server
   - Run `/list` command
   - Verify your bot is in the player list

## Troubleshooting

### Bot Won't Connect
- **Check Minecraft Server Status**: Make sure your Aternos/server is online
- **Verify Environment Variables**: Double-check host, port, and version are correct
- **Check Logs**: Look for error messages in Render logs

### Build Failures
- **Node Version**: Ensure Render is using Node.js 22+
  - Add `NODE_VERSION=22` to environment variables if needed
- **Dependencies**: Check that all dependencies installed correctly in logs

### Bot Keeps Disconnecting
- **Server Version Mismatch**: Ensure `MINECRAFT_VERSION` matches your server
- **Firewall/Whitelist**: Some servers require whitelisting
- **Rate Limiting**: Aternos may have connection rate limits

### Health Check Failing
- **PORT Configuration**: Render automatically sets PORT variable
- **Startup Time**: Initial startup may take 1-2 minutes
- **Check Start Command**: Ensure `npm start` runs correctly

## Updating Your Bot

When you make changes to your code:

1. **Commit Changes**
   ```bash
   git add .
   git commit -m "Updated bot features"
   git push origin main
   ```

2. **Auto-Deploy**
   - If auto-deploy is enabled, Render will automatically redeploy
   - Otherwise, click **"Manual Deploy"** in Render dashboard

## Cost Considerations

### Render Free Tier
- 750 hours/month of free service
- Services spin down after 15 minutes of inactivity
- May have cold start delays (30-60 seconds)

### Keeping Bot Online 24/7
- Free tier may spin down during inactivity
- For 24/7 uptime, consider:
  - **Paid Plan**: $7/month for always-on service
  - **External Pinger**: Use a service like UptimeRobot to ping your health endpoint every 5 minutes

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MINECRAFT_SERVER_HOST` | Server address | `craftpixel.aternos.me` |
| `MINECRAFT_SERVER_PORT` | Server port | `12635` |
| `MINECRAFT_BOT_USERNAME` | Bot's in-game name | `AternosKeeper` |
| `MINECRAFT_VERSION` | Minecraft version | `1.21.10` |
| `PORT` | HTTP server port (auto-set by Render) | `3000` |

## Support

If you encounter issues:
1. Check Render logs for error messages
2. Verify all environment variables are set correctly
3. Ensure Minecraft server is online and accessible
4. Check that server version matches `MINECRAFT_VERSION`

## Security Notes

- Never commit your `.env` file to GitHub
- `.env` is in `.gitignore` by default
- Environment variables in Render are encrypted
- Use `.env.example` as a template for required variables
