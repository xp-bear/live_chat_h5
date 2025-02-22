const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 5200 });

let clients = {};

server.on("connection", (ws) => {
  ws.on("message", (message) => {
    let data = JSON.parse(message);
    switch (data.type) {
      case "join":
        clients[data.username] = ws;
        broadcast({ type: "info", message: `${data.username} 加入了聊天` });
        break;
      case "private":
        if (clients[data.to]) {
          clients[data.to].send(JSON.stringify({ from: data.from, message: data.message, type: "private" }));
        }
        break;
      case "group":
        broadcast({ from: data.from, message: data.message, type: "group" }, data.from);
        break;
    }
  });

  ws.on("close", () => {
    Object.keys(clients).forEach((username) => {
      if (clients[username] === ws) {
        delete clients[username];
        broadcast({ type: "info", message: `${username} 退出了聊天` });
      }
    });
  });
});

function broadcast(data, sender) {
  Object.keys(clients).forEach((username) => {
    if (username !== sender) {
      clients[username].send(JSON.stringify(data));
    }
  });
}

console.log("WebSocket 服务器运行在 ws://127.0.0.1:5200");
