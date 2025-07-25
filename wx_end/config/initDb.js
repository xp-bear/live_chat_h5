// 新建文件：c:\Users\16938\Desktop\PROJECT_XP\wx_chat\wx_end\config\initDb.js
require("dotenv").config();
const mysql = require("mysql2/promise");

async function init() {
  // 先连接，不指定 database
  const basePool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
  });

  await basePool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
  console.log(`✅ 数据库 ${process.env.DB_NAME} 已创建或已存在`);

  // 再连接指定 database
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT,
      u_name VARCHAR(50) NOT NULL,
      u_password VARCHAR(255) NOT NULL,
      u_sex TINYINT(1) NOT NULL DEFAULT 0,
      u_createtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      u_token VARCHAR(255) DEFAULT NULL,
      u_avatar VARCHAR(255) DEFAULT 'https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/common/default_avatar.png',
      u_money INT NOT NULL DEFAULT 0,
      u_saying VARCHAR(100) DEFAULT NULL,
      u_location VARCHAR(100) DEFAULT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY u_name (u_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log("✅ 表格 'users' 已创建或已存在");
  process.exit(0);
}

init().catch((err) => {
  console.error("❌ 初始化失败:", err.message);
  process.exit(1);
});
