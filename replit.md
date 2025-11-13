# Overview

This is a Minecraft server keeper bot that maintains an active connection to Minecraft servers to prevent auto-shutdown. The bot is designed to run 24/7 on Render's free tier, automatically reconnecting when disconnected. It's particularly useful for free hosting services like Aternos that shut down servers when no players are connected.

The application uses Node.js with TypeScript and the Mineflayer library to create a headless Minecraft client that stays connected to the server.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Technology Stack

**Runtime Environment**: Node.js 22+ with TypeScript ES2022, using ESM modules for modern JavaScript compatibility.

**Bot Framework**: Built on `mineflayer` v4.33.0, a high-level JavaScript API for creating Minecraft bots. Provides automated connection management, protocol handling, and event-driven architecture for interacting with Minecraft servers.

**Logging System**: Uses Pino logger with pretty-printing for human-readable logs in development. Structured logging captures bot lifecycle events, connection status, errors, and reconnection attempts with configurable log levels via environment variables.

## Bot Architecture

**Connection Management**: Single bot instance with automatic reconnection logic. The bot maintains state tracking (`isConnected` flag) and implements exponential backoff for reconnection attempts to handle network failures gracefully.

**Circular Movement System**: The bot actively runs and jumps in a circular pattern to keep the server engaged. Upon spawning, the bot captures its starting position and continuously moves in a 5-block radius circle while sprinting and jumping. This active behavior ensures the server recognizes ongoing player activity, preventing auto-shutdown more reliably than a static connection.

**Movement Implementation**: Uses dual interval timers for coordinated control:
- **Movement Interval** (100ms): Calculates circular path using trigonometry, updates bot rotation to face the target position, and maintains forward sprint control with occasional random jumps
- **Jump Interval** (1000ms): Executes regular jumps when the bot is on the ground, creating visible player activity
- **Interval Lifecycle**: Both timers are properly cleared and nulled during cleanup to prevent accumulation on reconnect/death events

**Reconnection Strategy**: Scheduled reconnections with configurable delays (default 5 seconds) to prevent reconnection loops. Uses timeout-based scheduling to retry connections after disconnect events, kick events, or connection errors. Movement automatically resumes after successful reconnection.

**Event-Driven Design**: Leverages Mineflayer's event system for lifecycle management:
- `spawn` event: Confirms successful server join and starts circular movement
- `death` event: Waits 2 seconds, updates position, and restarts movement
- `kicked` event: Handles server-initiated disconnections and stops movement
- `end` event: Triggers reconnection on connection loss and cleans up intervals
- `error` event: Logs errors and schedules recovery

## Deployment Architecture

**Health Monitoring**: HTTP server listening on configurable port (default 3000) with `/health` endpoint. Returns JSON status indicating whether the bot is currently connected to the Minecraft server. This endpoint is used by Render for health checks and uptime monitoring.

**Environment Configuration**: All server-specific settings managed via environment variables:
- `MINECRAFT_SERVER_HOST`: Target server address
- `MINECRAFT_SERVER_PORT`: Server port (default 25565)
- `MINECRAFT_BOT_USERNAME`: Bot's display name
- `MINECRAFT_VERSION`: Minecraft protocol version (e.g., 1.21.10)
- `LOG_LEVEL`: Pino log verbosity control
- `PORT`: HTTP health endpoint port

**Process Management**: Single long-running process design suitable for containerized deployment. The bot runs indefinitely, maintaining the connection and handling failures internally without requiring external process supervisors.

## Build and Development

**TypeScript Configuration**: Targets ES2022 with bundler module resolution for optimal tree-shaking. Development uses `tsx` for hot-reloading without compilation. Production builds compile to `dist/` directory with `tsc`.

**Code Quality**: Prettier integration for consistent formatting across TypeScript files, with check and auto-format scripts.

# External Dependencies

## Primary Libraries

**mineflayer** (v4.33.0): Core library providing Minecraft protocol implementation, bot creation, event handling, and server interaction capabilities. Handles all low-level networking and game state management.

**pino** (v9.9.4) + **pino-pretty** (v13.0.0): High-performance JSON logger with optional pretty-printing transport for development. Provides structured logging with minimal overhead.

**dotenv** (v17.2.0): Environment variable management from `.env` files for local development configuration.

## Development Tools

**TypeScript** (v5.9.3): Type safety and modern JavaScript features with strict mode enabled.

**tsx** (v4.20.3): TypeScript execution engine for development without pre-compilation.

**Prettier** (v3.6.2): Code formatter for maintaining consistent style.

## Deployment Platform

**Render**: Cloud hosting platform for continuous deployment. The application includes Render-specific configuration via `render.yaml` blueprint for automated setup of web services with health checks, environment variables, and build commands.

The bot connects to external Minecraft servers (commonly Aternos or similar free hosting services) but does not depend on any databases, authentication services, or additional APIs.