# 微信聊天 Demo (仿微信) ✅

一个基于 Vue.js + Node.js 的即时聊天示例，实现了**单聊与群聊**的核心功能，并包含基础的用户管理与**消息持久化**（聊天记录保存）。后续计划扩展类似朋友圈（动态）页面与更多功能。

---

## 🚀 特性

- ✨ **单聊与群聊**（WebSocket 实时通信）
- 💾 **聊天记录持久化**（消息自动保存到数据库，刷新页面不丢失）
- 📜 **历史消息自动加载**（打开页面/私聊窗口自动显示历史记录）
- 👥 **用户管理**（注册、登录、在线用户列表）
- 📷 **文件/图片上传**（支持图片消息）
- 😊 **表情支持**（内置表情和自定义表情包）
- 🎨 **现代化 UI**（仿微信界面设计）

## 🧰 技术栈

- **前端**：Vue 3、Vite、Pinia、NutUI
- **后端**：Node.js、Express、ws（WebSocket）
- **数据库**：MySQL（使用 `mysql2` 驱动）
- **实时通信**：WebSocket

---

## 📥 环境要求

- Node.js >= 16
- pnpm 或 npm
- 本地 MySQL 数据库

---

## ⚙️ 快速开始

### 1. 克隆仓库并进入目录

```bash
git clone <repo-url>
cd 2.wx_chat
```

### 2. 配置数据库

在 `wx_end` 目录创建 `.env` 文件：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306
```

### 3. 初始化数据库

```bash
cd wx_end
pnpm install   # 或 npm install

# 初始化用户表等基础表
node config/initDb.js

# 初始化聊天记录表（新功能）
node config/initChatMessagesTable.js
```

### 4. 启动后端

```bash
cd wx_end
node app.js
```

**预期输出**：

```
🚀 BASE_API 运行在 http://localhost:3000
🚀 WS_API 运行在 ws://0.0.0.0:5200
```

### 5. 启动前端

```bash
cd wx_front
pnpm install   # 或 npm install
pnpm dev       # 或 npm run dev
```

**访问**: http://localhost:5173

---

## 📚 新功能：聊天记录持久化

### 功能说明

- **自动保存**：所有群聊和私聊消息通过 WebSocket 发送时自动保存到数据库
- **自动加载**：
  - 打开聊天页面时自动加载最近 100 条群聊历史
  - 打开私聊窗口时自动加载与该用户的最近 100 条私聊历史
- **智能显示**：历史消息和新消息无缝衔接，按时间正确排序
- **数据持久化**：刷新页面、关闭浏览器后聊天记录不丢失

### 详细文档

- 📖 [快速启动指南.md](./快速启动指南.md) - 3 步快速使用
- 📖 [聊天记录功能说明.md](./聊天记录功能说明.md) - 详细功能说明
- 📖 [测试指南.md](./测试指南.md) - 完整测试步骤
- 📖 [实现总结.md](./实现总结.md) - 技术实现细节

### 数据库表结构

新增 `chat_messages` 表：

| 字段        | 类型         | 说明                      |
| ----------- | ------------ | ------------------------- |
| id          | INT          | 消息 ID（主键）           |
| type        | VARCHAR(20)  | 消息类型（group/private） |
| from_user   | VARCHAR(100) | 发送者用户名              |
| to_user     | VARCHAR(100) | 接收者用户名（私聊）      |
| message     | TEXT         | 消息内容                  |
| msg_type    | VARCHAR(20)  | 消息格式（text/image）    |
| user_img    | VARCHAR(500) | 发送者头像                |
| create_time | DATETIME     | 发送时间                  |
| is_read     | TINYINT      | 已读状态                  |

### API 接口

| 接口         | 方法 | 路径                         | 说明             |
| ------------ | ---- | ---------------------------- | ---------------- |
| 获取群聊历史 | GET  | `/api/chat/messages/group`   | 获取群聊历史消息 |
| 获取私聊历史 | GET  | `/api/chat/messages/private` | 获取私聊历史消息 |
| 获取会话列表 | GET  | `/api/chat/conversations`    | 获取私聊会话列表 |
| 标记已读     | PUT  | `/api/chat/messages/read`    | 标记消息已读     |

---

## 📁 项目结构（关键文件）

- `wx_end/` — 后端服务
  - `app.js` — 后端入口（包含 WebSocket 消息保存逻辑）
  - `config/initDb.js` — 初始化基础数据库表
  - `config/initChatMessagesTable.js` — 初始化聊天记录表 ⭐ 新增
  - `controllers/chatController.js` — 聊天记录控制器 ⭐ 新增
  - `routes/chatRoutes.js` — 聊天记录路由 ⭐ 新增
  - `controllers/`, `routes/`, `services/` — 其他后端逻辑
- `wx_front/` — 前端应用（Vue 3 + Vite）
  - `src/views/Chat.vue` — 聊天页面（包含历史记录加载）⭐ 更新
  - `src/api/allApi.js` — API 接口定义 ⭐ 更新
  - `src/api/`、`src/utils/` — 请求与工具函数
- 文档：
  - `快速启动指南.md` — 快速开始指南 ⭐ 新增
  - `聊天记录功能说明.md` — 功能详细说明 ⭐ 新增
  - `测试指南.md` — 测试步骤 ⭐ 新增
  - `实现总结.md` — 技术实现总结 ⭐ 新增

---

## 📷 示例截图

<img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/typora/image-20250724103450581.png"  />

<img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/typora/image-20250724103719121.png" alt="image-20250724103719121" style="zoom:50%;" />

---

## 🧪 测试功能

1. **测试群聊历史**

   - 发送几条群聊消息
   - 刷新页面
   - 确认消息历史正确显示

2. **测试私聊历史**

   - 打开某用户的私聊窗口
   - 发送几条消息
   - 关闭窗口并刷新页面
   - 再次打开该用户私聊窗口
   - 确认聊天记录完整保存

3. **验证数据库**

   ```sql
   -- 查看群聊消息
   SELECT * FROM chat_messages WHERE type = 'group' ORDER BY create_time DESC LIMIT 10;

   -- 查看私聊消息
   SELECT * FROM chat_messages WHERE type = 'private' ORDER BY create_time DESC LIMIT 10;
   ```

---

## 🛠 开发提示

- 如果需要自定义数据库连接，请修改 `wx_end/config/db.js` 或 `.env` 文件
- 若要在生产环境运行，请使用进程管理工具（例如 PM2）并配置正确的环境变量
- 聊天消息会自动保存，无需手动调用保存接口
- 默认加载最近 100 条历史消息，可在代码中修改限制数量

---

## 🎯 功能亮点

### 零配置自动化

- 消息发送时自动保存到数据库
- 页面加载时自动获取历史记录
- 无需额外配置和手动操作

### 智能消息管理

- 群聊和私聊消息分别存储和加载
- 消息按时间正确排序
- 历史消息和新消息无缝衔接

### 性能优化

- 使用数据库索引优化查询
- 支持 100+条消息的流畅显示
- WebSocket 实时通信，响应快速

---

## 🔮 后续计划

- [ ] 分页加载更多历史消息
- [ ] 消息搜索功能
- [ ] 消息已读/未读状态完善
- [ ] 消息撤回功能
- [ ] 消息转发功能
- [ ] 多设备消息同步
- [ ] 朋友圈（动态）功能

---

## 🤝 贡献与反馈

欢迎提出 Issue 或 PR，描述问题与改进建议即可。

---

## 📄 许可

当前仓库未附带特定开源许可证；如需使用或发布，请在仓库中添加相应的 LICENSE。
