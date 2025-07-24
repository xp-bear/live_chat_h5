const WebSocket = require("ws");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // 引入 cors 包
const dayjs = require("dayjs"); // 如果需要使用日期格式化功能，可以取消注释这一行

const server = new WebSocket.Server({ port: 5200, host: "0.0.0.0" });
let clients = {};

const app = express();
const port = 5201; // 服务端口

app.use(cors()); // 使用 cors 中间件
app.use(bodyParser.json()); // 解析 application/json

server.on("connection", (ws) => {
  ws.on("message", (message) => {
    let data = JSON.parse(message);
    console.log(`收到消息: ${message}`);

    switch (data.type) {
      case "join":
        clients[data.username] = ws;
        broadcast({ type: "info", message: `${data.username} 加入了聊天`, create_time: dayjs().format("YYYY-MM-DD HH:mm:ss") });
        break;
      case "private":
        if (clients[data.to]) {
          clients[data.to].send(JSON.stringify({ from: data.from, message: data.message, type: "private" }));
        }
        break;
      case "group":
        broadcast({ from: data.from, message: data.message, type: "group", create_time: data.create_time }, data.from);
        break;
    }
  });

  ws.on("close", () => {
    Object.keys(clients).forEach((username) => {
      if (clients[username] === ws) {
        delete clients[username];
        broadcast({ type: "info", message: `${username} 退出了聊天`, create_time: dayjs().format("YYYY-MM-DD HH:mm:ss") });
      }
    });
  });
});

//  广播消息
function broadcast(data, sender) {
  Object.keys(clients).forEach((username) => {
    if (username !== sender) {
      clients[username].send(JSON.stringify(data));
    }
  });
}

app.get("/", (req, res) => {
  res.send({
    code: 200,
    message: "服务器api运行正常",
  });
});

app.listen(port, () => {
  console.log(`API 服务器运行在 http://localhost:${port}`);
});

console.log("WebSocket 服务器运行在 ws://0.0.0.0:5200");
