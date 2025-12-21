const pool = require("../config/db");

/**
 * 保存聊天消息到数据库
 */
exports.saveMessage = async (req, res) => {
  const { type, from_user, to_user, message, msg_type, user_img, create_time } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO chat_messages (type, from_user, to_user, message, msg_type, user_img, create_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [type, from_user, to_user || null, message, msg_type || "text", user_img, create_time]
    );

    res.json({
      success: true,
      message: "消息保存成功",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("保存消息失败:", error);
    res.status(500).json({
      success: false,
      message: "保存消息失败",
      error: error.message,
    });
  }
};

/**
 * 获取群聊历史消息
 */
exports.getGroupMessages = async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;

  try {
    const [messages] = await pool.query(
      `SELECT * FROM chat_messages 
       WHERE type = 'group' 
       ORDER BY create_time DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    // 反转数组，使最新消息在最后
    messages.reverse();

    res.json({
      success: true,
      message: "获取群聊历史消息成功",
      data: messages,
    });
  } catch (error) {
    console.error("获取群聊历史消息失败:", error);
    res.status(500).json({
      success: false,
      message: "获取群聊历史消息失败",
      error: error.message,
    });
  }
};

/**
 * 获取私聊历史消息
 */
exports.getPrivateMessages = async (req, res) => {
  const { user1, user2, limit = 100, offset = 0 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).json({
      success: false,
      message: "缺少必要参数: user1 和 user2",
    });
  }

  try {
    const [messages] = await pool.query(
      `SELECT * FROM chat_messages 
       WHERE type = 'private' 
       AND ((from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?))
       ORDER BY create_time DESC 
       LIMIT ? OFFSET ?`,
      [user1, user2, user2, user1, parseInt(limit), parseInt(offset)]
    );

    // 反转数组，使最新消息在最后
    messages.reverse();

    res.json({
      success: true,
      message: "获取私聊历史消息成功",
      data: messages,
    });
  } catch (error) {
    console.error("获取私聊历史消息失败:", error);
    res.status(500).json({
      success: false,
      message: "获取私聊历史消息失败",
      error: error.message,
    });
  }
};

/**
 * 获取所有私聊会话列表（去重）
 */
exports.getPrivateChatList = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "缺少必要参数: username",
    });
  }

  try {
    const [conversations] = await pool.query(
      `SELECT 
        CASE 
          WHEN from_user = ? THEN to_user 
          ELSE from_user 
        END AS chat_user,
        MAX(create_time) AS last_message_time,
        (SELECT message FROM chat_messages cm2 
         WHERE ((cm2.from_user = ? AND cm2.to_user = CASE WHEN cm1.from_user = ? THEN cm1.to_user ELSE cm1.from_user END) 
             OR (cm2.to_user = ? AND cm2.from_user = CASE WHEN cm1.from_user = ? THEN cm1.to_user ELSE cm1.from_user END))
         AND cm2.type = 'private'
         ORDER BY cm2.create_time DESC LIMIT 1) AS last_message
      FROM chat_messages cm1
      WHERE type = 'private' AND (from_user = ? OR to_user = ?)
      GROUP BY chat_user
      ORDER BY last_message_time DESC`,
      [username, username, username, username, username, username, username]
    );

    res.json({
      success: true,
      message: "获取私聊会话列表成功",
      data: conversations,
    });
  } catch (error) {
    console.error("获取私聊会话列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取私聊会话列表失败",
      error: error.message,
    });
  }
};

/**
 * 标记消息为已读
 */
exports.markAsRead = async (req, res) => {
  const { messageIds } = req.body;

  if (!messageIds || !Array.isArray(messageIds)) {
    return res.status(400).json({
      success: false,
      message: "缺少必要参数: messageIds（数组）",
    });
  }

  try {
    await pool.query(`UPDATE chat_messages SET is_read = 1 WHERE id IN (?)`, [messageIds]);

    res.json({
      success: true,
      message: "标记已读成功",
    });
  } catch (error) {
    console.error("标记已读失败:", error);
    res.status(500).json({
      success: false,
      message: "标记已读失败",
      error: error.message,
    });
  }
};
