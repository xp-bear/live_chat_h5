const dbService = require("../services/dbService");

const userController = {
  deleteUserEmoji: async (req, res) => {
    const { id } = req.body;
    try {
      await dbService.query("DELETE FROM user_emoji WHERE id = ?", [id]);
      res.json({ code: 200, message: "表情包图片已删除" });
    } catch (error) {
      res.status(500).json({ error: "删除表情包图片失败" });
    }
  },
  getUserEmoji: async (req, res) => {
    const { user_id } = req.query;
    try {
      const emojis = await dbService.query("SELECT * FROM user_emoji WHERE user_id = ?", [user_id]);
      res.json({ code: 200, data: emojis });
    } catch (error) {
      res.status(500).json({ error: "获取表情包失败" });
    }
  },
  addUserEmoji: async (req, res) => {
    const { user_id, emoji_url } = req.body;
    try {
      const result = await dbService.query("INSERT INTO user_emoji (user_id, user_emoji_img) VALUES (?, ?)", [user_id, emoji_url]);
      res.json({ code: 200, message: "表情包添加成功", data: result });
    } catch (error) {
      res.status(500).json({ error: "添加表情包失败" });
    }
  },
  deleteOnlineUser: async (req, res) => {
    const { user_people } = req.body;
    try {
      await dbService.query("DELETE FROM online_user WHERE user_people = ?", [user_people]);
      res.json({ code: 200, message: "在线用户已删除" });
    } catch (error) {
      res.status(500).json({ error: "删除在线用户失败" });
    }
  },
  // 查询在线用户列表
  getOnlineUser: async (req, res) => {
    try {
      const onlineUsers = await dbService.query("SELECT * FROM online_user");
      res.json({ code: 200, data: onlineUsers });
    } catch (error) {
      res.status(500).json({ error: "获取在线用户列表失败" });
    }
  },
  // 清空在线用户列表数据
  clearOnlineUser: async (req, res) => {
    try {
      await dbService.query("DELETE FROM online_user");
      res.json({ code: 200, message: "在线用户列表已清空" });
    } catch (error) {
      res.status(500).json({ error: "清空在线用户列表失败" });
    }
  },
  // 更新在线用户列表
  updateOnlineUser: async (req, res) => {
    const { create_time, message, type, user_img, user_people, user_state } = req.body;
    try {
      const data = await dbService.user.updateOnlineUser(create_time, message, type, user_img, user_people, user_state);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "更新在线用户列表失败" });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await dbService.user.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "获取用户失败" });
    }
  },

  // 创建用户
  createUser: async (req, res) => {
    const { u_name, u_password } = req.body;
    try {
      const newUser = await dbService.user.createUser(u_name, u_password);
      res.json(newUser);
    } catch (error) {
      res.status(500).json({ error: "创建用户失败" });
    }
  },

  loginUser: async (req, res) => {
    const { u_name, u_password } = req.body;
    try {
      const user = await dbService.user.loginUser(u_name, u_password);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "登录失败" });
    }
  },

  // 更新用户头像
  updateUserAvatar: async (req, res) => {
    const { user_id, avatar_url } = req.body;
    try {
      // 1. 先获取用户名（用于更新聊天记录）
      const users = await dbService.query("SELECT u_name FROM users WHERE id = ?", [user_id]);
      if (!users || users.length === 0) {
        return res.status(404).json({ code: 404, error: "用户不存在" });
      }
      const username = users[0].u_name;

      // 2. 更新用户表中的头像
      await dbService.query("UPDATE users SET u_avatar = ? WHERE id = ?", [avatar_url, user_id]);

      // 3. 更新聊天记录表中该用户的所有消息头像
      await dbService.query("UPDATE chat_messages SET user_img = ? WHERE from_user = ?", [avatar_url, username]);

      res.json({ code: 200, message: "头像更新成功", data: { avatar_url } });
    } catch (error) {
      console.error("更新头像失败:", error);
      res.status(500).json({ code: 500, error: "更新头像失败" });
    }
  },
};

module.exports = userController;
