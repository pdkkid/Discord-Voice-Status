// src/index.ts

import "dotenv/config";
import { startDiscordClient } from "./discord";
import { startEspWebSocketServer } from "./esp-ws";

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.GUILD_ID;
const port = Number(process.env.ESP_WS_PORT || 8080);

if (!token || !guildId) {
  console.error("❌ Missing DISCORD_TOKEN or GUILD_ID");
  process.exit(1);
}

startDiscordClient(token, guildId);
startEspWebSocketServer(port);
