// src/discord.ts

import { Client, GatewayIntentBits, VoiceState } from "discord.js";
import { voiceUsers } from "./state";

export function startDiscordClient(token: string, guildId: string) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  client.once("ready", () => {
    console.log(`✅ Discord connected as ${client.user?.tag}`);
  });

  client.on(
    "voiceStateUpdate",
    (oldState: VoiceState, newState: VoiceState) => {
      if (newState.guild.id !== guildId) return;

      const userId = newState.id;

      // Joined voice
      if (!oldState.channelId && newState.channelId) {
        voiceUsers.add(userId);
        console.log(`➕ ${userId} joined voice`);
      }

      // Left voice
      if (oldState.channelId && !newState.channelId) {
        voiceUsers.delete(userId);
        console.log(`➖ ${userId} left voice`);
      }
    }
  );

  client.login(token);
}
