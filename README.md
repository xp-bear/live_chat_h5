# 微信聊天 Demo (仿微信) ✅

一个基于 Vue.js + Node.js 的即时聊天示例，实现了**单聊与群聊**的核心功能，并包含基础的用户管理与消息持久化。后续计划扩展类似朋友圈（动态）页面与更多功能。

---

## 🚀 特性

- 单聊与群聊（WebSocket 实时通信）
- 消息存储（MySQL）与基础用户管理
- 前后端分离：`wx_front`（前端） + `wx_end`（后端）
- 简易文件/图片上传示例与表情支持

## 🧰 技术栈

- 前端：Vue 3、Vite、Pinia
- 后端：Node.js、Express、ws（WebSocket）
- 数据库：MySQL（使用 `mysql2` 驱动）

---

## 📥 环境要求

- Node.js >= 16
- pnpm 或 npm
- 本地 MySQL 数据库（`config/initDb.js` 会尝试创建表）

---

## ⚙️ 快速开始

1. 克隆仓库并进入目录：

```bash
git clone <repo-url>
cd 2.wx_chat
```

2. 启动后端（在 `wx_end` 目录）：

```bash
cd wx_end
pnpm install   # 或 npm install
# 开发模式：会先初始化数据库再用 nodemon 启动服务
pnpm dev
```

> 后端启动脚本会运行 `config/initDb.js` 来创建所需的数据表（如果尚不存在）。

3. 启动前端（在 `wx_front` 目录）：

```bash
cd ../wx_front
pnpm install
pnpm dev
```

4. 打开浏览器访问前端提供的地址（默认由 Vite 显示），即可使用聊天功能。

---

## 📁 项目结构（关键文件）

- `wx_end/` — 后端服务
  - `app.js` — 后端入口
  - `config/initDb.js` — 初始化数据库脚本
  - `controllers/`, `routes/`, `services/` — 后端逻辑
- `wx_front/` — 前端应用（Vue 3 + Vite）
  - `src/views/Chat.vue` — 聊天页面
  - `src/api/`、`src/utils/` — 请求与工具函数
- `chat_demo.vue` — 示例/演示文件

---

## 📷 示例截图

<img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/typora/image-20250724103450581.png"  />

<img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/typora/image-20250724103719121.png" alt="image-20250724103719121" style="zoom:50%;" />

---

## 🛠 开发提示

- 如果需要自定义数据库连接，请修改 `wx_end/config/db.js`。
- 若要在生产环境运行，请使用进程管理工具（例如 PM2）并配置正确的环境变量。

---

## 🤝 贡献与反馈

欢迎提出 Issue 或 PR，描述问题与改进建议即可。

---

## 📄 许可

当前仓库未附带特定开源许可证；如需使用或发布，请在仓库中添加相应的 LICENSE。
