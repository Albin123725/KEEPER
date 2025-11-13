# Minecraft Bot - Server Keeper

A simple Minecraft bot that keeps your server active by maintaining a connection. Perfect for Aternos servers that shut down when empty!

## ✨ Features

- 🤖 Automatically connects to your Minecraft server
- ⏰ Keeps server online 24/7 (prevents auto-shutdown)
- 🔄 Auto-reconnects if disconnected
- 💚 Health monitoring endpoint for deployment platforms
- 📝 Detailed logging of all bot activities
- 🚀 Ready for Render deployment out-of-the-box

## 🚀 Quick Deploy to Render

The fastest way to get your bot running:

1. **Fork/Clone this repository**
2. **Push to your GitHub**
3. **Deploy to Render** - See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions

**That's it!** Your bot will keep your Minecraft server online 24/7.

## 📋 Prerequisites

- Node.js 22+ (for local development)
- GitHub account (for deployment)
- Render account (free tier works!)
- Minecraft server details

## 🏃 Local Development

Want to test locally first?

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your server details**
   ```env
   MINECRAFT_SERVER_HOST=your-server.aternos.me
   MINECRAFT_SERVER_PORT=12635
   MINECRAFT_BOT_USERNAME=ServerKeeper
   MINECRAFT_VERSION=1.21.10
   ```

4. **Run the bot**
   ```bash
   npm run dev
   ```

5. **Test health check**
   Open http://localhost:3000/health in your browser

## 🎮 Configuration

All configuration is done via environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MINECRAFT_SERVER_HOST` | Your server address | `myserver.aternos.me` |
| `MINECRAFT_SERVER_PORT` | Server port | `12635` |
| `MINECRAFT_BOT_USERNAME` | Bot's in-game name | `ServerKeeper` |
| `MINECRAFT_VERSION` | Minecraft version | `1.21.10` |

## 📚 Documentation

- [**Deployment Guide**](DEPLOYMENT.md) - Complete GitHub + Render deployment walkthrough
- [**.env.example**](.env.example) - Environment variable template

## 🔧 How It Works

1. Bot connects to your Minecraft server using Mineflayer
2. Stays connected, preventing server auto-shutdown
3. Automatically reconnects if connection is lost
4. Provides health endpoint for monitoring
5. Logs all activities for debugging

## 🌐 Deployment Platforms

This bot is optimized for **Render**, but can be deployed to:
- ✅ Render (recommended - includes `render.yaml`)
- Railway
- Heroku
- Any Node.js hosting platform

## 🐛 Troubleshooting

### Bot won't connect
- ✅ Make sure server is online
- ✅ Check server address and port are correct
- ✅ Verify Minecraft version matches your server

### Bot keeps disconnecting
- ✅ Check `MINECRAFT_VERSION` matches server version exactly
- ✅ Some servers require whitelisting - add bot username
- ✅ Check server logs for kick/ban messages

### Local development issues
- ✅ Make sure you're using Node.js 22+
- ✅ Verify `.env` file exists and has correct values
- ✅ Run `npm install` to ensure all dependencies are installed

## 📊 Monitoring

Your bot exposes a health check endpoint at `/health`:

```json
{
  "status": "connected",
  "bot": "ServerKeeper",
  "uptime": 3600,
  "timestamp": "2025-11-13T03:00:00.000Z"
}
```

- Status 200: Bot is connected
- Status 503: Bot is disconnected/reconnecting

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

ISC

## 💡 Tips

- **Free Hosting**: Render's free tier includes 750 hours/month
- **24/7 Uptime**: Upgrade to Render's paid plan ($7/month) for always-on service
- **Multiple Bots**: Deploy separate instances for different servers
- **Monitoring**: Use UptimeRobot to ping `/health` and get alerts if bot goes down
