const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// 用户路由
router.get("/get_all_user", userController.getAllUsers);
router.post("/create_user", userController.createUser);
router.post("/login_user", userController.loginUser);

module.exports = router;
