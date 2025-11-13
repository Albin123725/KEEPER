import mineflayer from 'mineflayer';
import { createServer } from 'http';
import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

interface BotConfig {
  host: string;
  port: number;
  username: string;
  version: string;
}

const config: BotConfig = {
  host: process.env.MINECRAFT_SERVER_HOST || 'craftpixel-R1dt.aternos.me',
  port: parseInt(process.env.MINECRAFT_SERVER_PORT || '12635'),
  username: process.env.MINECRAFT_BOT_USERNAME || 'KEEPER',
  version: process.env.MINECRAFT_VERSION || '1.21.10'
};

let isConnected = false;
let movementInterval: NodeJS.Timeout | null = null;
let jumpInterval: NodeJS.Timeout | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;

let startX: number = 0;
let startY: number = 0;
let startZ: number = 0;

const CIRCLE_RADIUS = 5;
const MOVEMENT_SPEED = 0.05;
const ROUNDS_PER_DIRECTION = 2;

let angle = 0;
let currentRound = 0;
let isClockwise = true;
let totalRotations = 0;

function createBot() {
  logger.info({ config }, 'Creating bot with config');
  
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    auth: 'offline'
  });

  bot.on('login', () => {
    logger.info(`Bot logged in as ${bot.username}`);
    isConnected = true;
  });

  bot.on('spawn', () => {
    logger.info('Bot spawned in the world');
    
    if (bot.entity && bot.entity.position) {
      startX = bot.entity.position.x;
      startY = bot.entity.position.y;
      startZ = bot.entity.position.z;
      
      logger.info(`Starting position: X=${startX.toFixed(2)}, Y=${startY.toFixed(2)}, Z=${startZ.toFixed(2)}`);
      logger.info('Starting circular movement pattern: 2 rounds clockwise, then 2 rounds counter-clockwise, repeating...');
      
      startCircularMovement(bot);
    }
  });

  bot.on('death', () => {
    logger.warn('Bot died! Waiting to respawn...');
    stopMovement();
    
    setTimeout(() => {
      if (bot.entity && bot.entity.position) {
        startX = bot.entity.position.x;
        startY = bot.entity.position.y;
        startZ = bot.entity.position.z;
        logger.info('Respawned, restarting movement');
        startCircularMovement(bot);
      }
    }, 2000);
  });

  bot.on('kicked', (reason) => {
    logger.warn({ reason }, 'Bot was kicked');
    isConnected = false;
    stopMovement();
    scheduleReconnect();
  });

  bot.on('end', () => {
    logger.warn('Connection ended');
    isConnected = false;
    stopMovement();
    scheduleReconnect();
  });

  bot.on('error', (err) => {
    logger.error({ message: err.message }, 'Bot error');
    isConnected = false;
    stopMovement();
    scheduleReconnect();
  });

  return bot;
}

function startCircularMovement(bot: any) {
  stopMovement();
  
  angle = 0;
  currentRound = 0;
  totalRotations = 0;
  isClockwise = true;
  
  bot.setControlState('sprint', true);
  
  movementInterval = setInterval(() => {
    if (!bot.entity || !bot.entity.position) return;
    
    const direction = isClockwise ? 1 : -1;
    angle += MOVEMENT_SPEED * direction;
    
    if (Math.abs(angle) >= Math.PI * 2) {
      totalRotations++;
      currentRound++;
      angle = 0;
      
      logger.info(`Completed round ${currentRound} (${isClockwise ? 'clockwise' : 'counter-clockwise'}). Total rotations: ${totalRotations}`);
      
      if (currentRound >= ROUNDS_PER_DIRECTION) {
        isClockwise = !isClockwise;
        currentRound = 0;
        logger.info(`Switching direction to ${isClockwise ? 'clockwise' : 'counter-clockwise'}`);
      }
    }
    
    const targetX = startX + Math.cos(angle) * CIRCLE_RADIUS;
    const targetZ = startZ + Math.sin(angle) * CIRCLE_RADIUS;
    
    const dx = targetX - bot.entity.position.x;
    const dz = targetZ - bot.entity.position.z;
    const yaw = Math.atan2(-dx, -dz);
    
    bot.look(yaw, 0, true);
    
    bot.setControlState('forward', true);
    
    if (Math.random() < 0.1) {
      bot.setControlState('jump', true);
      setTimeout(() => {
        bot.setControlState('jump', false);
      }, 100);
    }
  }, 100);
  
  jumpInterval = setInterval(() => {
    if (bot.entity && bot.entity.onGround) {
      bot.setControlState('jump', true);
      setTimeout(() => {
        bot.setControlState('jump', false);
      }, 100);
    }
  }, 1000);
  
  logger.info('Circular movement started');
}

function stopMovement() {
  if (movementInterval) {
    clearInterval(movementInterval);
    movementInterval = null;
  }
  
  if (jumpInterval) {
    clearInterval(jumpInterval);
    jumpInterval = null;
  }
  
  logger.debug('Movement stopped');
}

function scheduleReconnect() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  
  const delay = 5000;
  logger.info(`Reconnecting in ${delay / 1000} seconds...`);
  
  reconnectTimeout = setTimeout(() => {
    logger.info('Attempting to reconnect...');
    createBot();
  }, delay);
}

const PORT = parseInt(process.env.PORT || '3000');
const server = createServer((req, res) => {
  if (req.url === '/health') {
    const status = isConnected ? 200 : 503;
    const response = {
      status: isConnected ? 'connected' : 'disconnected',
      bot: config.username,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
    
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Health check server listening on port ${PORT}`);
});

createBot();
