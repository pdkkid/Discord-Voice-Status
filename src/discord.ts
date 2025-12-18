// src/discord.ts

import { Client, GatewayIntentBits, VoiceState, Guild } from "discord.js";
import { voiceUsers } from "./state";

function syncInitialVoiceStates(guild: Guild) {
  voiceUsers.clear();

  for (const [, vs] of guild.voiceStates.cache) {
    if (vs.channelId) {
      voiceUsers.add(vs.id); // vs.id is the userId
    }
  }

  console.log(`🔄 Initial voice sync: ${voiceUsers.size} user(s) in voice`);
}

export function startDiscordClient(
  token: string,
  guildId: string,
  onVoiceChange: () => void,
  onReady?: () => void
) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  client.once("ready", async () => {
    console.log(`✅ Discord connected as ${client.user?.tag}`);

    // Ensure guild exists (cache is usually ready here)
    const guild =
      client.guilds.cache.get(guildId) ?? (await client.guilds.fetch(guildId));

    // Build initial state from the cached voice states
    syncInitialVoiceStates(guild);

    // Push initial state to ESP clients
    onVoiceChange();
    onReady?.();
  });

  // Also handle reconnects / new guild availability events
  client.on("guildCreate", guild => {
    if (guild.id !== guildId) return;
    syncInitialVoiceStates(guild);
    onVoiceChange();
  });

  client.on(
    "voiceStateUpdate",
    (oldState: VoiceState, newState: VoiceState) => {
      if (newState.guild.id !== guildId) return;

      const userId = newState.id;
      let changed = false;

      // Joined voice
      if (!oldState.channelId && newState.channelId) {
        voiceUsers.add(userId);
        changed = true;
        console.log(`➕ ${userId} joined voice`);
      }

      // Left voice
      if (oldState.channelId && !newState.channelId) {
        voiceUsers.delete(userId);
        changed = true;
        console.log(`➖ ${userId} left voice`);
      }

      if (changed) onVoiceChange();
    }
  );

  client.login(token);
}
