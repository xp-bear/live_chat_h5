const dbService = require("../services/dbService");

const userController = {
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
