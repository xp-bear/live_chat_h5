const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// 保存消息
router.post("/messages", chatController.saveMessage);

// 获取群聊历史消息
router.get("/messages/group", chatController.getGroupMessages);

// 获取私聊历史消息
router.get("/messages/private", chatController.getPrivateMessages);

// 获取私聊会话列表
router.get("/conversations", chatController.getPrivateChatList);

// 标记消息为已读
router.put("/messages/read", chatController.markAsRead);

module.exports = router;
