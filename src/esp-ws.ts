// src/esp-ws.ts

import WebSocket, { WebSocketServer } from "ws";
import { isAnyoneInVoice } from "./state";

const AUTH_TIMEOUT_MS = 5000;

const espClients = new Set<WebSocket>();

function broadcastState() {
  const payload = isAnyoneInVoice() ? "1" : "0";

  for (const ws of espClients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

export function startEspWebSocketServer(
  port: number,
  authToken: string,
  onClientReady?: () => void
) {
  const wss = new WebSocketServer({ port });

  console.log(`📡 ESP WebSocket server listening on :${port}`);

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

      // Ignore all other messages (push-only)
    });

    ws.on("close", () => {
      clearTimeout(authTimeout);
      espClients.delete(ws);
    });
  });

  return {
    broadcastState,
  };
}
