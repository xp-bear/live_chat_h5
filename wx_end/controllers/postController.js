const db = require("../services/dbService");
const OSS = require("ali-oss");
const fs = require("fs");

const uploadToOSS = async (filePath, fileName) => {
  // If OSS not configured, skip trying
  if (!process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET || !process.env.OSS_BUCKET) {
    return null;
  }
  try {
    const client = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
    });
    const result = await client.put(`posts/${Date.now()}_${fileName}`, filePath);
    return result && result.url ? result.url : null;
  } catch (err) {
    // Log detailed info but don't crash the server
    console.warn("OSS 上传失败：", err && err.message ? err.message : err);
    return null;
  }
};

module.exports = {
  uploadImage: async (req, res) => {
    if (!req.file) return res.status(400).json({ code: 400, message: "没有文件" });

    const tmpPath = req.file.path;
    let url = null;

    try {
      // Try uploading to OSS (uploadToOSS catches and returns null on failure)
      url = await uploadToOSS(tmpPath, req.file.originalname);
    } catch (err) {
      console.warn("uploadToOSS 抛出异常：", err && err.message ? err.message : err);
      url = null;
    }

    // always try to remove tmp file
    try {
      fs.unlinkSync(tmpPath);
    } catch (e) {
      console.warn("删除临时文件失败：", e && e.message ? e.message : e);
    }

    if (url) {
      return res.json({ code: 200, data: { url }, message: "上传成功（OSS）" });
    }

    // Fallback to local file URL when OSS not configured or upload failed
    const localUrl = `/uploads/${req.file.filename}`;
    console.warn("使用本地回退 URL：", localUrl);
    return res.json({ code: 200, data: { url: localUrl }, message: "已保存到本地（OSS 未配置或上传失败）" });
  },

  // OSS health check
  ossStatus: async (req, res) => {
    console.log("[ossStatus] called");
    if (!process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET || !process.env.OSS_BUCKET) {
      console.log("[ossStatus] OSS not configured");
      return res.json({ ok: false, message: "OSS 未配置" });
    }
    try {
      console.log("[ossStatus] checking bucket", process.env.OSS_BUCKET, process.env.OSS_REGION);
      const client = new OSS({
        region: process.env.OSS_REGION,
        accessKeyId: process.env.OSS_ACCESS_KEY_ID,
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
        bucket: process.env.OSS_BUCKET,
      });
      // list a few objects to verify credentials and bucket access
      const result = await client.list({ "max-keys": 1 });
      console.log("[ossStatus] result", result && result.objects ? result.objects.length : 0);
      return res.json({ ok: true, bucket: process.env.OSS_BUCKET, region: process.env.OSS_REGION, info: { objects: result && result.objects ? result.objects.length : 0 } });
    } catch (err) {
      console.warn("[ossStatus] OSS 状态检查失败：", err && err.message ? err.message : err);
      return res.json({ ok: false, message: err && err.message ? err.message : String(err) });
    }
  },

  createPost: async (req, res) => {
    try {
      const { user_id, author, content, images } = req.body;

      // normalize images into an array
      let imgsArray = [];
      if (images) {
        if (Array.isArray(images)) imgsArray = images;
        else if (typeof images === "string") {
          try {
            const parsed = JSON.parse(images);
            imgsArray = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            imgsArray = [images];
          }
        } else {
          imgsArray = [images];
        }
      }

      // limit to max 9 images
      if (imgsArray.length > 9) imgsArray = imgsArray.slice(0, 9);

      const imagesJson = imgsArray.length ? JSON.stringify(imgsArray) : null;
      const result = await db.query("INSERT INTO posts (user_id, author, content, images) VALUES (?, ?, ?, ?)", [user_id || null, author || null, content || null, imagesJson]);
      const insertedId = result.insertId;
      const posts = await db.query("SELECT * FROM posts WHERE id = ?", [insertedId]);
      const p = posts[0];
      p.images = imgsArray; // already normalized
      // normalize camelCase createdAt for frontend
      p.createdAt = p.created_at;
      p.comments_count = 0; // new post has zero comments
      res.json({ code: 200, data: p });
    } catch (err) {
      console.error(err);
      res.status(500).json({ code: 500, message: "创建失败" });
    }
  },

  getPosts: async (req, res) => {
    try {
      const page = parseInt(req.query.page || "1");
      const pageSize = parseInt(req.query.pageSize || "10");
      const offset = (page - 1) * pageSize;
      // fetch posts along with per-post comment counts and user avatar for initial UI
      const rows = await db.query(
        `
        SELECT p.*, u.u_avatar, COALESCE(c.cnt, 0) AS comments_count
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN (
          SELECT post_id, COUNT(*) AS cnt FROM comments GROUP BY post_id
        ) c ON p.id = c.post_id
        ORDER BY p.id DESC
        LIMIT ? OFFSET ?
      `,
        [pageSize, offset]
      );

      // safe parse images helper
      const parseImages = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed;
            if (parsed) return [parsed];
          } catch (e) {
            // value is a raw string (e.g., '/uploads/xxx' or 'http://...')
            return [val];
          }
        }
        return [];
      };

      const posts = rows.map((r) => ({ ...r, images: parseImages(r.images), createdAt: r.created_at, comments_count: r.comments_count || 0 }));
      res.json({ code: 200, data: posts });
    } catch (err) {
      console.error(err);
      res.status(500).json({ code: 500, message: "查询失败" });
    }
  },

  addComment: async (req, res) => {
    try {
      const { post_id, user_id, author, text } = req.body;
      const result = await db.query("INSERT INTO comments (post_id, user_id, author, text) VALUES (?, ?, ?, ?)", [post_id, user_id || null, author || null, text]);
      const insertedId = result.insertId;
      const rows = await db.query("SELECT * FROM comments WHERE id = ?", [insertedId]);
      const comment = rows[0];
      // normalize camelCase createdAt for frontend
      comment.createdAt = comment.created_at;
      res.json({ code: 200, data: comment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ code: 500, message: "评论失败" });
    }
  },

  getComments: async (req, res) => {
    try {
      const post_id = parseInt(req.query.post_id);
      const page = parseInt(req.query.page || "1");
      const pageSize = parseInt(req.query.pageSize || "10");
      const offset = (page - 1) * pageSize;
      const rows = await db.query("SELECT c.*, u.u_avatar FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.id DESC LIMIT ? OFFSET ?", [post_id, pageSize, offset]);
      const comments = rows.map((r) => ({ ...r, createdAt: r.created_at }));
      res.json({ code: 200, data: comments });
    } catch (err) {
      console.error(err);
      res.status(500).json({ code: 500, message: "查询评论失败" });
    }
  },

  likePost: async (req, res) => {
    try {
      const { post_id, user_id } = req.body;
      // check existing
      const existing = await db.query("SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?", [post_id, user_id || null]);
      let liked = false;
      if (existing.length > 0) {
        // remove like
        await db.query("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?", [post_id, user_id || null]);
        await db.query("UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = ?", [post_id]);
      } else {
        // add like
        await db.query("INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)", [post_id, user_id || null]);
        await db.query("UPDATE posts SET likes = likes + 1 WHERE id = ?", [post_id]);
        liked = true;
      }
      const p = await db.query("SELECT likes FROM posts WHERE id = ?", [post_id]);
      res.json({ code: 200, data: { likes: p[0].likes, liked } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ code: 500, message: "点赞失败" });
    }
  },

  deletePost: async (req, res) => {
    try {
      const { post_id } = req.body;
      await db.query("DELETE FROM comments WHERE post_id = ?", [post_id]);
      await db.query("DELETE FROM post_likes WHERE post_id = ?", [post_id]);
      await db.query("DELETE FROM posts WHERE id = ?", [post_id]);
      res.json({ code: 200, message: "已删除" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ code: 500, message: "删除失败" });
    }
  },

  // 获取用户点赞过的帖子
  getMyLikedPosts: async (req, res) => {
    try {
      const user_id = parseInt(req.query.user_id);
      if (!user_id) {
        return res.status(400).json({ code: 400, message: "缺少 user_id 参数" });
      }

      // 查询用户点赞过的帖子
      const rows = await db.query(
        `
        SELECT p.*, u.u_avatar, COALESCE(c.cnt, 0) AS comments_count
        FROM post_likes pl
        INNER JOIN posts p ON pl.post_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN (
          SELECT post_id, COUNT(*) AS cnt FROM comments GROUP BY post_id
        ) c ON p.id = c.post_id
        WHERE pl.user_id = ?
        ORDER BY pl.id DESC
      `,
        [user_id]
      );

      const parseImages = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed;
            if (parsed) return [parsed];
          } catch (e) {
            return [val];
          }
        }
        return [];
      };

      const posts = rows.map((r) => ({ ...r, images: parseImages(r.images), createdAt: r.created_at, comments_count: r.comments_count || 0 }));
      res.json({ code: 200, data: posts });
    } catch (err) {
      console.error(err);
      res.status(500).json({ code: 500, message: "查询失败" });
    }
  },

  // 获取用户评论过的帖子
  getMyCommentedPosts: async (req, res) => {
    try {
      const user_id = parseInt(req.query.user_id);
      if (!user_id) {
        return res.status(400).json({ code: 400, message: "缺少 user_id 参数" });
      }

      // 查询用户评论过的帖子（去重）
      const rows = await db.query(
        `
        SELECT p.*, u.u_avatar, COALESCE(c.cnt, 0) AS comments_count
        FROM posts p
        INNER JOIN (
          SELECT DISTINCT post_id, MAX(id) as max_comment_id
          FROM comments
          WHERE user_id = ?
          GROUP BY post_id
        ) cm ON p.id = cm.post_id
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN (
          SELECT post_id, COUNT(*) AS cnt FROM comments GROUP BY post_id
        ) c ON p.id = c.post_id
        ORDER BY cm.max_comment_id DESC
      `,
        [user_id]
      );

      const parseImages = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed;
            if (parsed) return [parsed];
          } catch (e) {
            return [val];
          }
        }
        return [];
      };

      const posts = rows.map((r) => ({ ...r, images: parseImages(r.images), createdAt: r.created_at, comments_count: r.comments_count || 0 }));
      res.json({ code: 200, data: posts });
    } catch (err) {
      console.error(err);
      res.status(500).json({ code: 500, message: "查询失败" });
    }
  },
};
