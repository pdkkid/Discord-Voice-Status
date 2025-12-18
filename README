# Discord Voice Status Server

A self-hosted service that connects to Discord, tracks real-time voice channel activity, and exposes a lightweight WebSocket API for ESP32 / ESP8266 devices (or other clients) to consume.

This server is designed to power physical indicators (LEDs, signs, panels, etc.) that reflect whether users are currently connected to Discord voice channels.

---

## What this project does

- Connects to the Discord Gateway (WebSocket)
- Subscribes to **VOICE_STATE_UPDATE** events
- Tracks whether **any user is currently in a voice channel**
- Hosts its **own WebSocket server** for embedded devices
- Pushes **real-time boolean state updates** (`1` / `0`) to clients
- Supports **authenticated clients** (ESP devices)
- Designed to run **locally, in Docker, or on a VPS**
- Internet-exposable (Cloudflare Tunnel friendly)

---

## Architecture overview

Discord Gateway (WSS)
│
▼
Discord Voice Status Server
│
├── Tracks voice state in memory
│
├── WebSocket Server (/ws)
│ └── Authenticated ESP clients
│
└── (optional) Admin / OTA endpoints


---

## ESP device integration

ESP devices connect to the server’s WebSocket endpoint and receive:

- `1` → one or more users are in voice chat
- `0` → nobody is in voice chat

ESP devices:
- authenticate using a shared token
- maintain a persistent WebSocket connection
- reconnect automatically if the server restarts

👉 **Firmware + flashing tools:**  
https://github.com/pdkkid/Discord-Voice-Status-ESP

That repository includes:
- ESP32-S2, ESP32, ESP8266 support
- captive portal WiFi setup
- OTA updates
- GitHub Pages flashing
- versioned firmware builds

---

## Prerequisites

### Required
- Discord Bot Token
- Discord Server (Guild) ID
- Node.js 18+ **or** Docker

### Discord bot requirements

The bot **must** have the following privileged intents enabled:

- Server Members Intent
- Voice States Intent

And be added to your server with at least:
- View Channels
- Connect

---

## Environment variables

Create a `.env` file:

```env
DISCORD_TOKEN=your_discord_bot_token
GUILD_ID=your_guild_id

PORT=8080
WS_PATH=/ws

ESP_AUTH_TOKEN=supersecret_token_here
LOG_LEVEL=info

// Fix below

Running locally (Node.js)
npm install
npm run build
npm start


The WebSocket server will be available at:

ws://localhost:8080/ws

Running with Docker (recommended)
Build
docker build -t discord-voice-status .

Run
docker run -d \
  --name discord-voice-status \
  -p 8080:8080 \
  --env-file .env \
  discord-voice-status

Health checks

The server exposes a lightweight health endpoint:

GET /health


Useful for:

Docker healthchecks

Cloudflare Tunnel monitoring

uptime checks

WebSocket protocol (ESP clients)
Connection
ws://<server>:8080/ws

Authentication

Immediately after connecting:

AUTH:<token>


Responses:

OK → authenticated

NOAUTH → invalid token

State updates
1  → voice activity detected
0  → no users in voice chat

Security considerations

ESP clients authenticate using a shared token

No Discord user data is sent to clients

No voice history is stored

OTA messages should be signed (recommended)

Internet exposure

This server is designed to be exposed safely using:

Cloudflare Tunnel (recommended)

Reverse proxy (Caddy, Nginx, Traefik)

Only port 8080 needs to be reachable.

Related repositories

ESP Firmware & Flashing Tools
https://github.com/pdkkid/Discord-Voice-Status-ESP

Roadmap

Admin API for OTA updates

Signed OTA payloads

Device identity + fleet tracking

Optional Redis persistence

Web dashboard

Multi-guild support