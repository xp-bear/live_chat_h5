const WebSocket = require("ws");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // 引入 cors 包
const dayjs = require("dayjs"); // 如果需要使用日期格式化功能，可以取消注释这一行
const path = require("path");

const userRoutes = require("./routes/userRoutes"); // 引入用户路由
const postRoutes = require("./routes/postRoutes"); // 引入帖子路由
const chatRoutes = require("./routes/chatRoutes"); // 引入聊天路由
const pool = require("./config/db"); // 引入数据库连接池

const server = new WebSocket.Server({ port: 5200, host: "0.0.0.0" });
let clients = {}; // { username: { ws: WebSocket, userInfo: { user_img, create_time } } }

const app = express();

// 中间件
app.use(express.json());
app.use(cors()); // 使用 cors 中间件
app.use(bodyParser.json()); // 解析 application/json

// WebSocket 连接处理
server.on("connection", (ws) => {
  let currentUsername = null;

  ws.on("message", (message) => {
    let data = JSON.parse(message);
    console.log(`收到消息: ${message}`);

    switch (data.type) {
      case "join":
        currentUsername = data.username;
        // 保存完整的用户信息
        clients[data.username] = {
          ws: ws,
          userInfo: {
            user_img: data.user_img,
            create_time: data.create_time || dayjs().format("YYYY-MM-DD HH:mm:ss"),
          },
        };

        // 广播用户加入消息
        broadcast({
          type: "info",
          message: `${data.username} 加入了聊天`,
          create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          user_state: "join",
          user_people: data.username,
          user_img: data.user_img,
        });

        // 发送当前在线用户列表给新加入的用户
        const onlineUsers = Object.keys(clients)
          .filter((name) => name !== data.username)
          .map((name) => ({
            user_people: name,
            user_img: clients[name].userInfo.user_img,
            create_time: clients[name].userInfo.create_time,
            online: true,
          }));

        ws.send(
          JSON.stringify({
            type: "online_users",
            users: onlineUsers,
          })
        );
        break;

      case "private":
        // 保存私聊消息到数据库
        saveMessageToDb({
          type: "private",
          from_user: data.from,
          to_user: data.to,
          message: data.message,
          msg_type: data.msg_type || "text",
          user_img: data.user_img,
          create_time: data.create_time,
        });

        // 发送给接收者
        if (clients[data.to] && clients[data.to].ws) {
          clients[data.to].ws.send(
            JSON.stringify({
              msg_type: data.msg_type,
              from: data.from,
              to: data.to,
              message: data.message,
              type: "private",
              create_time: data.create_time,
              user_img: data.user_img,
            })
          );
        }
        break;

      case "group":
        // 保存群聊消息到数据库
        saveMessageToDb({
          type: "group",
          from_user: data.from,
          to_user: null,
          message: data.message,
          msg_type: data.msg_type || "text",
          user_img: data.user_img,
          create_time: data.create_time,
        });

        broadcast(
          {
            msg_type: data.msg_type,
            from: data.from,
            message: data.message,
            type: "group",
            create_time: data.create_time,
            user_img: data.user_img,
          },
          data.from
        );
        break;
    }
  });

  ws.on("close", () => {
    if (currentUsername && clients[currentUsername]) {
      delete clients[currentUsername];
      broadcast({
        type: "info",
        message: `${currentUsername} 退出了聊天`,
        create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        user_state: "close",
        user_people: currentUsername,
      });
      console.log(`用户 ${currentUsername} 断开连接`);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket 错误:", error);
    if (currentUsername && clients[currentUsername]) {
      delete clients[currentUsername];
    }
  });
});

//  广播消息
function broadcast(data, sender) {
  Object.keys(clients).forEach((username) => {
    if (username !== sender && clients[username] && clients[username].ws) {
      try {
        clients[username].ws.send(JSON.stringify(data));
      } catch (error) {
        console.error(`发送消息给 ${username} 失败:`, error);
      }
    }
  });
}

// 保存消息到数据库
async function saveMessageToDb(messageData) {
  try {
    await pool.query(
      `INSERT INTO chat_messages (type, from_user, to_user, message, msg_type, user_img, create_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [messageData.type, messageData.from_user, messageData.to_user, messageData.message, messageData.msg_type, messageData.user_img, messageData.create_time]
    );
    console.log(`💾 消息已保存到数据库: ${messageData.type} - ${messageData.from_user}`);
  } catch (error) {
    console.error("❌ 保存消息到数据库失败:", error);
  }
}

// 设置路由
app.use("/api", userRoutes);
app.use("/api", postRoutes);
app.use("/api/chat", chatRoutes);

// 若使用本地上传（没有 OSS 配置），把 uploads 目录静态发布出来
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
