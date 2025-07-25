const pool = require("../config/db");

const dbService = {
  // 通用查询方法
  query: async (sql, params) => {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (error) {
      console.error("数据库查询错误:", error.message);
      throw new Error("数据库操作失败");
    }
  },

  // 用户相关操作
  user: {
    getAll: async () => {
      return await dbService.query("SELECT * FROM users");
    },
    createUser: async (u_name, u_password) => {
      // 1.判断u_name在数据库是否唯一
      const existingUser = await dbService.query("SELECT * FROM users WHERE u_name = ?", [u_name]);
      if (existingUser.length > 0) {
        return {
          code: 400,
          message: "用户名已存在",
        };
      }
      // 2.插入新用户
      const result = await dbService.query("INSERT INTO users (u_name, u_password) VALUES (?, ?)", [u_name, u_password]);
      return {
        code: 200,
        message: "用户创建成功",
        userId: result.insertId, // 返回新用户的ID
      };
    },
    loginUser: async (u_name, u_password) => {
      const users = await dbService.query("SELECT * FROM users WHERE u_name = ? AND u_password = ?", [u_name, u_password]);
      // 去除 u_password 返回
      if (users.length > 0) {
        // 设置用户登录状态  Date.now()设置到7天后
        const now = Date.now();
        const sevenDaysLater = now + 15 * 24 * 60 * 60 * 1000; // 计算15天后的时间戳
        // 设置token，包含用户ID和15天后的过期时间
        users[0].u_token = `${users[0].id}_${sevenDaysLater}`;
        // 更新用户 token
        await dbService.query("UPDATE users SET u_token = ? WHERE id = ?", [users[0].u_token, users[0].id]);

        delete users[0].u_password; // 删除密码字段
      }
      return {
        code: users.length > 0 ? 200 : 400,
        message: users.length > 0 ? "登录成功" : "用户名或密码错误",
        data: users.length > 0 ? users[0] : null,
      };
    },
  },
};

module.exports = dbService;
