const WebSocket = require("ws");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // 引入 cors 包
const dayjs = require("dayjs"); // 如果需要使用日期格式化功能，可以取消注释这一行

const userRoutes = require("./routes/userRoutes"); // 引入用户路由

const server = new WebSocket.Server({ port: 5200, host: "0.0.0.0" });
let clients = {};

const app = express();

// 中间件
app.use(express.json());
app.use(cors()); // 使用 cors 中间件
app.use(bodyParser.json()); // 解析 application/json

// WebSocket 连接处理
server.on("connection", (ws) => {
  ws.on("message", (message) => {
    let data = JSON.parse(message);
    console.log(`收到消息: ${message}`);

    switch (data.type) {
      case "join":
        clients[data.username] = ws;
        broadcast({
          type: "info",
          message: `${data.username} 加入了聊天`,
          create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          user_state: "join",
          user_people: data.username,
          user_img: data.user_img,
        });
        break;
      case "private":
        if (clients[data.to]) {
          clients[data.to].send(JSON.stringify({ from: data.from, to: data.to, message: data.message, type: "private", create_time: data.create_time, user_img: data.user_img }));
        }
        break;
      case "group":
        broadcast({ from: data.from, message: data.message, type: "group", create_time: data.create_time, user_img: data.user_img }, data.from);
        break;
    }
  });

  ws.on("close", () => {
    Object.keys(clients).forEach((username) => {
      if (clients[username] === ws) {
        delete clients[username];
        broadcast({ type: "info", message: `${username} 退出了聊天`, create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"), user_state: "close", user_people: username });
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

// 设置路由
app.use("/api", userRoutes);

// 首页根路由提示
app.get("/", (req, res) => {
  res.status(200).json({
    code: 200,
    status: "success",
    message: "欢迎使用熊仔聊天后端服务！",
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: "未找到路由" });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "服务器内部错误" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 BASE_API 运行在 http://localhost:${PORT}`);
  console.log("🚀 WS_API 运行在 ws://0.0.0.0:5200");
});
