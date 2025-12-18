// src/esp-ws.ts

import WebSocket, { WebSocketServer } from "ws";
import { isAnyoneInVoice, isUserInVoice } from "./state";

export function startEspWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port });

  console.log(`📡 ESP WebSocket server listening on :${port}`);

  wss.on("connection", (ws: WebSocket) => {
    ws.on("message", data => {
      const msg = data.toString();

      // ultra-simple protocol
      if (msg === "ANY") {
        ws.send(isAnyoneInVoice() ? "1" : "0");
        return;
      }

      // USER:<id>
      if (msg.startsWith("USER:")) {
        const userId = msg.substring(5);
        ws.send(isUserInVoice(userId) ? "1" : "0");
        return;
      }

      ws.send("ERR");
    });

    // Send initial state immediately
    ws.send(isAnyoneInVoice() ? "1" : "0");
  });
}
