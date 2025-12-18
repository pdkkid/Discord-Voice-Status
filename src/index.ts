// src/index.ts

import "dotenv/config";
import { startDiscordClient } from "./discord";
import { startEspWebSocketServer } from "./esp-ws";
import { startHealthServer } from "./health";
import { voiceUsers } from "./state";

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.GUILD_ID;

const espPort = Number(process.env.ESP_WS_PORT || 8080);
const espAuthToken = process.env.ESP_AUTH_TOKEN;

const healthPort = Number(process.env.HEALTH_PORT || 3000);

if (!token || !guildId || !espAuthToken) {
  console.error("❌ Missing DISCORD_TOKEN, GUILD_ID, or ESP_AUTH_TOKEN");
  process.exit(1);
}

let discordReady = false;

// Start ESP WS server first
const espServer = startEspWebSocketServer(espPort, espAuthToken);

// Start health server
startHealthServer(healthPort, () => ({
  discordReady,
  guildId,
  voiceUsers: voiceUsers.size,
  espClients: espServer.getEspClientCount(),
  uptimeSec: Math.floor(process.uptime()),
}));

// Start Discord client and hook push updates
startDiscordClient(
  token,
  guildId,
  () => {
    // onVoiceChange
    espServer.broadcastState();
  },
  () => {
    // onReady
    discordReady = true;
  }
);
