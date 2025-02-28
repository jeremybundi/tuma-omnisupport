import { Server } from "ws";

let wss; // Store WebSocket server globally

export default function handler(req, res) {
  if (!res.socket.server.wss) {
    console.log("🚀 Starting WebSocket Server...");

    wss = new Server({ server: res.socket.server });

    wss.on("connection", (ws) => {
      console.log("✅ Client Connected");

      ws.on("message", (data) => {
        console.log(`📩 Received Message: ${data}`);
        
        // Broadcast message to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(data);
          }
        });
      });

      ws.on("close", () => console.log("❌ Client Disconnected"));
    });

    res.socket.server.wss = wss;
  }

  res.end();
}

export { wss };
