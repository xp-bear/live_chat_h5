const express = require("express");
const router = express.Router();
let multer;
try {
  multer = require("multer");
} catch (e) {
  console.warn("multer not installed. upload endpoints will be disabled.");
}
const path = require("path");
const fs = require("fs");
const postController = require("../controllers/postController");

// ensure uploads dir exists
const UPLOAD_DIR = path.resolve(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

let upload = null;
if (multer) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  });
  upload = multer({ storage });
  router.post("/upload_image", upload.single("file"), postController.uploadImage);
} else {
  router.post("/upload_image", (req, res) => res.status(500).json({ code: 500, message: "服务器缺少 multer，上传不可用，请安装依赖" }));
}

router.post("/create_post", postController.createPost);
router.get("/get_posts", postController.getPosts);
router.post("/add_comment", postController.addComment);
router.get("/get_comments", postController.getComments);
router.post("/like_post", postController.likePost);
router.post("/delete_post", postController.deletePost);
router.get("/get_my_liked_posts", postController.getMyLikedPosts);
router.get("/get_my_commented_posts", postController.getMyCommentedPosts);

// OSS 状态检查
router.get("/oss_status", postController.ossStatus);

module.exports = router;
