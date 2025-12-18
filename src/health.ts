// src/health.ts
import http from "http";

export type HealthSnapshot = {
  discordReady: boolean;
  guildId: string;
  voiceUsers: number;
  espClients: number;
  uptimeSec: number;
};

export function startHealthServer(
  port: number,
  getSnapshot: () => HealthSnapshot
) {
  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      const snap = getSnapshot();
      const ok = snap.discordReady; // consider "healthy" only when Discord is connected

      res.statusCode = ok ? 200 : 503;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok, ...snap }));
      return;
    }

    res.statusCode = 404;
    res.end("not found");
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`🩺 Health endpoint listening on :${port} (/health)`);
  });

  return server;
}
