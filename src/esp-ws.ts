// src/esp-ws.ts

import WebSocket, { WebSocketServer } from "ws";
import { isAnyoneInVoice } from "./state";

const AUTH_TIMEOUT_MS = 5000;

// Heartbeat tuning
const HEARTBEAT_INTERVAL_MS = 15000; // ping every 15s

const espClients = new Set<WebSocket>();

function broadcastState() {
  const payload = isAnyoneInVoice() ? "1" : "0";

  for (const ws of espClients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

function setupHeartbeat(wss: WebSocketServer) {
  // Each ws gets an isAlive flag
  wss.on("connection", (ws: WebSocket) => {
    (ws as any).isAlive = true;

    ws.on("pong", () => {
      (ws as any).isAlive = true;
    });
  });

  const interval = setInterval(() => {
    for (const ws of wss.clients) {
      // Only enforce heartbeat for OPEN sockets
      if (ws.readyState !== WebSocket.OPEN) continue;

      // If they didn't pong since last tick, drop them
      if (!(ws as any).isAlive) {
        try {
          ws.terminate();
        } catch {}
        espClients.delete(ws);
        continue;
      }

      // Mark as not alive, expect pong
      (ws as any).isAlive = false;

      try {
        ws.ping();
      } catch {
        try {
          ws.terminate();
        } catch {}
        espClients.delete(ws);
      }
    }
  }, HEARTBEAT_INTERVAL_MS);

  wss.on("close", () => {
    clearInterval(interval);
  });

  return interval;
}

export function startEspWebSocketServer(port: number, authToken: string) {
  const wss = new WebSocketServer({
    port,
    path: "/ws",
  });

  console.log(`📡 ESP WebSocket server listening on :${port}`);

  setupHeartbeat(wss);

  wss.on("connection", (ws: WebSocket) => {
    let authenticated = false;

    const authTimeout = setTimeout(() => {
      if (!authenticated) {
        ws.send("NOAUTH");
        ws.close();
      }
    }, AUTH_TIMEOUT_MS);

    ws.on("message", data => {
      const msg = data.toString();

      // --- AUTH PHASE ---
      if (!authenticated) {
        if (msg.startsWith("AUTH:")) {
          const token = msg.substring(5);

          if (token === authToken) {
            authenticated = true;
            clearTimeout(authTimeout);

            espClients.add(ws);
            ws.send("OK");

            // Immediately push current state
            ws.send(isAnyoneInVoice() ? "1" : "0");
            return;
          }
        }

        ws.send("NOAUTH");
        ws.close();
        return;
      }

      // Push-only mode: ignore post-auth messages
    });

    ws.on("close", () => {
      clearTimeout(authTimeout);
      espClients.delete(ws);
    });

    ws.on("error", () => {
      clearTimeout(authTimeout);
      espClients.delete(ws);
    });
  });

  return {
    broadcastState,
    getEspClientCount: () => espClients.size,
  };
}
