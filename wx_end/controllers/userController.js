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
};

module.exports = userController;
