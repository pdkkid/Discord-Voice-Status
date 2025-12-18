// src/state.ts

export const voiceUsers = new Set<string>();

export function isAnyoneInVoice(): boolean {
  return voiceUsers.size > 0;
}

export function isUserInVoice(userId: string): boolean {
  return voiceUsers.has(userId);
}
