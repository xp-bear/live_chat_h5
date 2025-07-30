const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// 用户路由
router.get("/get_all_user", userController.getAllUsers);
router.post("/create_user", userController.createUser);
router.post("/login_user", userController.loginUser);
// 在线用户列表更新
router.post("/add_online_user", userController.updateOnlineUser);
// 清空在线用户列表数据
router.post("/clear_online_user", userController.clearOnlineUser);
// 查询在线用户列表
router.get("/get_online_user", userController.getOnlineUser);
// 根据用户名删除在线用户
router.post("/delete_online_user", userController.deleteOnlineUser);

// 根据用户ID添加表情包图片
router.post("/add_user_emoji", userController.addUserEmoji);
// 根据用户ID查询表情包图片
router.get("/get_user_emoji", userController.getUserEmoji);
module.exports = router;
