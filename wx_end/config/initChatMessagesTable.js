const pool = require("./db");

/**
 * 创建聊天记录表
 */
async function createChatMessagesTable() {
  const connection = await pool.getConnection();
  try {
    // 创建聊天消息表
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
        type VARCHAR(20) NOT NULL COMMENT '消息类型: group-群聊, private-私聊',
        from_user VARCHAR(100) NOT NULL COMMENT '发送者用户名',
        to_user VARCHAR(100) DEFAULT NULL COMMENT '接收者用户名(私聊时使用)',
        message TEXT NOT NULL COMMENT '消息内容',
        msg_type VARCHAR(20) NOT NULL DEFAULT 'text' COMMENT '消息格式: text-文本, image-图片',
        user_img VARCHAR(500) COMMENT '发送者头像',
        create_time DATETIME NOT NULL COMMENT '发送时间',
        is_read TINYINT DEFAULT 0 COMMENT '是否已读: 0-未读, 1-已读',
        INDEX idx_type (type),
        INDEX idx_from_user (from_user),
        INDEX idx_to_user (to_user),
        INDEX idx_create_time (create_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天消息记录表';
    `;

    await connection.query(createTableSQL);
    console.log("✅ 聊天消息表创建成功");
  } catch (error) {
    console.error("❌ 创建聊天消息表失败:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// 如果直接运行此文件，则创建表
if (require.main === module) {
  createChatMessagesTable()
    .then(() => {
      console.log("数据库表初始化完成");
      process.exit(0);
    })
    .catch((error) => {
      console.error("数据库表初始化失败:", error);
      process.exit(1);
    });
}

module.exports = { createChatMessagesTable };
