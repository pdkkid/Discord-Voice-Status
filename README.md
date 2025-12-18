flowchart TB
  subgraph Discord["Discord"]
    DGW["Discord Gateway (WSS)\nVOICE_STATE_UPDATE events"]
  end

  subgraph Server["Discord Voice Status Server"]
    BOT["Discord Gateway Client\n(Intents + Session)"]
    STATE["In-memory Voice State\n(any user in voice = true/false)"]
    WSSRV["ESP WebSocket Server\n/ws"]
    AUTH["Auth Handler\nValidate ESP_AUTH_TOKEN"]
  end

  subgraph Clients["Clients"]
    ESP["ESP Devices\nESP8266 / ESP32 / ESP32-S2"]
  end

  DGW --> BOT
  BOT --> STATE

  ESP -->|connect| WSSRV
  WSSRV -->|AUTH:<token>| AUTH
  AUTH -->|OK| WSSRV
  AUTH -->|NOAUTH| DROP["Close Connection"]

  STATE --> WSSRV
  WSSRV -->|push 1 / 0| ESP

# Discord Voice Status Server

![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![WebSocket](https://img.shields.io/badge/websocket-supported-orange)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

A self-hosted service that connects to Discord, tracks real-time voice channel activity, and exposes a lightweight WebSocket API for ESP32 / ESP8266 devices (or other clients).

This project is designed to power **physical indicators** (LEDs, signs, panels, status lights, etc.) that reflect whether users are currently connected to Discord voice channels.

---

## ✨ Features

- Connects to the Discord Gateway (WebSocket)
- Listens for VOICE_STATE_UPDATE events
- Tracks whether any users are currently in voice chat
- Hosts its own WebSocket server for ESP devices
- Push-based real-time updates (no polling)
- Token-authenticated ESP clients
- Runs locally, in Docker, or on a VPS
- Internet-friendly (Cloudflare Tunnel supported)

---

## 🚀 Quick Start (Docker – recommended)

### 1. Create a Discord bot

- Enable **Server Members Intent**
- Enable **Voice States Intent**
- Invite the bot to your server

### 2. Create a `.env` file

- Clone the `.env.example` from this repo and rename it to `.env`
- Update the values accordingly

### 3. Run with Docker

docker run -d \
  --name discord-voice-status \
  -p 8080:8080 \
  --env-file .env \
  ghcr.io/pdkkid/discord-voice-status:latest

### 4. Connect ESP devices

ESP devices connect to:

wss://your-domain/ws

(Or ws://localhost:8080/ws when running locally)

---

## 🧠 Architecture Overview

### High-level data flow

Discord Gateway (WSS)  
↓  
Discord Voice Status Server  
↓  
WebSocket Server (/ws)  
↓  
Authenticated ESP Clients  

Detailed breakdown:

- Discord Gateway sends VOICE_STATE_UPDATE events
- Server tracks current voice presence in memory
- When state changes, all connected ESP clients are notified
- ESP devices toggle GPIO outputs (LEDs, relays, etc.)

No Discord user data is forwarded to devices.

---

## 🔌 ESP Device Integration

ESP devices receive **simple boolean state updates**:

- `1` → one or more users are in voice chat
- `0` → nobody is in voice chat

Device behavior:

- Authenticate using a shared token
- Maintain persistent WebSocket connection
- Auto-reconnect if the server restarts

👉 Firmware, OTA, and flashing tools:  
<https://github.com/pdkkid/Discord-Voice-Status-ESP>

That repository includes:

- ESP32-S2, ESP8266 support
- Captive portal WiFi configuration
- OTA updates
- GitHub Pages browser flashing
- Versioned firmware builds

---

## 📋 Prerequisites

### Required

- Discord Bot Token
- Discord Server (Guild) ID
- Node.js 18+ OR Docker

### Discord bot permissions

- Server Members Intent
- Voice States Intent
- View Channels
- Connect

---

## ⚙️ Configuration

### Environment variables

- DISCORD_TOKEN
- GUILD_ID  
- PORT (default: 8080)
- ESP_AUTH_TOKEN  

---

## ▶️ Running Locally (Node.js)

npm install  
npm run build  
npm start  

WebSocket endpoint:

ws://localhost:8080/ws

---

## 🐳 Health Checks

The server exposes:

GET /health

Used for:

- Docker healthchecks
- Cloudflare Tunnel monitoring
- Uptime checks

---

## 🔐 WebSocket Protocol (ESP Clients)

Connection:

ws://<server>:8080/ws  

Authentication:

AUTH:<token>  

Responses:

- OK     → authenticated
- NOAUTH → invalid token

State updates:

- 1 → voice activity detected
- 0 → no users in voice chat

## 🔒 Security Notes

- ESP clients authenticate via shared token
- No Discord user IDs or names are sent to devices
- No voice history is stored
- OTA updates should be signed (recommended)

---

## 🌍 Internet Exposure

Designed to be exposed safely using:

- Cloudflare Tunnel (recommended)
- Reverse proxy (Caddy, Nginx, Traefik)

Only port 8080 needs to be reachable by the tunnel/proxy.

## ☁️ Cloudflare Tunnel Setup (Recommended)

Cloudflare Tunnel allows you to expose this server to the internet **without opening any inbound ports** on your network.

The Discord Voice Status Server works very well behind Cloudflare Tunnel and supports WebSockets out of the box.

### Why use Cloudflare Tunnel?

- No port forwarding required
- Works behind NAT, CGNAT, or firewalls
- Automatic HTTPS (WSS) support
- Protects your origin IP
- Stable WebSocket connections for ESP devices

## Tunnel Token (Quick setup)

If you prefer not to manage credential files, Cloudflare provides a tunnel token.

### 1. Create tunnel in Cloudflare dashboard

- Go to Cloudflare Zero Trust
- Access → Tunnels → Create Tunnel
- Choose Docker
- Copy the provided token

### 2. Docker Compose using token

- Add `CLOUDFLARE_TUNNEL_TOKEN` environment variable with recieved token
- Use the `docker-compose.yml` included in the repo
- `docker compose up`

## WebSocket Notes

- Cloudflare Tunnel fully supports WebSockets
- ESP devices should connect using:
  
  wss://your-domain/ws

- No additional TLS configuration is required
- Heartbeats are recommended for long-lived connections

## Troubleshooting

- If ESP devices disconnect:
  - Ensure heartbeats are enabled on the server
  - Avoid very aggressive idle timeouts
- If tunnel fails:
  - Check cloudflared logs
  - Verify credentials.json permissions
  - Ensure the hostname exists in Cloudflare DNS

---

## 🔗 Related Projects

ESP Firmware & Flashing Tools  
<https://github.com/pdkkid/Discord-Voice-Status-ESP>

---

## 🛣 Roadmap

- Admin API for OTA updates
- Signed OTA payloads
- Device identity & fleet tracking
- Optional Redis persistence
- Web dashboard
- Multi-guild support

---

## 📄 License

MIT
