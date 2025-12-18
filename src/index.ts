// src/index.ts

import "dotenv/config";
import { startDiscordClient } from "./discord";
import { startEspWebSocketServer } from "./esp-ws";

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.GUILD_ID;
const port = Number(process.env.ESP_WS_PORT || 8080);
const espAuthToken = process.env.ESP_AUTH_TOKEN;

if (!token || !guildId || !espAuthToken) {
  console.error("❌ Missing DISCORD_TOKEN, GUILD_ID, or ESP_AUTH_TOKEN");
  process.exit(1);
}

// Start ESP WS server first
const espServer = startEspWebSocketServer(port, espAuthToken);

// Start Discord client and hook push updates
startDiscordClient(token, guildId, () => {
  espServer.broadcastState();
});
