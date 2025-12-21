<template>
  <div class="post-card">
    <div class="head">
      <div class="avatar" :style="!getUserAvatar(post) ? getAvatarStyle(post.author) : {}">
        <img v-if="getUserAvatar(post)" :src="getUserAvatar(post)" class="avatar-img" />
        <span v-else class="avatar-text">{{ post.author[0] || "我" }}</span>
      </div>
      <div class="meta">
        <div class="author">{{ post.author }}</div>
        <div class="time">{{ timeAgo(post.createdAt) }}</div>
      </div>
      <button class="del-btn" @click="delPost" v-if="canDelete">删除</button>
    </div>

    <div class="content" v-if="post.content">{{ post.content }}</div>

    <div class="images" :class="{ single: post.images && post.images.length === 1 }" v-if="post.images && post.images.length">
      <div class="img" v-for="(img, idx) in post.images.slice(0, 9)" :key="idx" @click="openPreview(idx)">
        <img :src="img" />
        <!-- overlay on the 9th tile when there are more than 9 images -->
        <div v-if="idx === 8 && post.images.length > 9" class="more-overlay" aria-hidden="true">+{{ post.images.length - 9 }}</div>
      </div>
    </div>

    <div class="actions">
      <button class="action-btn like-btn" @click="toggleLike" :class="{ liked: post.liked }" aria-pressed="{{!!post.liked}}">
        <span class="a-icon">👍</span>
        <span class="a-text">赞</span>
        <span class="a-count">{{ post.likes || 0 }}</span>
      </button>

      <button class="action-btn comment-btn" @click="toggleComments">
        <span class="a-icon">💬</span>
        <span class="a-text">评论</span>
        <span class="a-count">{{ (post.comments && post.comments.length) || post.comments_count || 0 }}</span>
      </button>
    </div>

    <div class="comments" v-if="showComments">
      <button v-if="!commentsFinished" class="load-comments" @click="loadComments">{{ commentsLoading ? "加载中..." : "加载更多评论" }}</button>
      <div class="comment" v-for="c in post.comments" :key="c.id">
        <div class="comment-avatar" :style="!getUserAvatar(c) ? getAvatarStyle(c.author) : {}">
          <img v-if="getUserAvatar(c)" :src="getUserAvatar(c)" class="avatar-img" />
          <span v-else class="avatar-text">{{ c.author[0] || "我" }}</span>
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="c-author">{{ c.author }}</span>
            <span class="c-time">{{ timeAgo(c.createdAt) }}</span>
          </div>
          <div class="c-text">{{ c.text }}</div>
        </div>
      </div>
      <div class="comment-input">
        <input v-model="commentText" placeholder="写评论..." @keydown.enter.prevent="addComment" />
        <button @click="addComment" :disabled="!commentText.trim()">发送</button>
      </div>
    </div>
  </div>

  <!-- 自定义删除确认弹窗 -->
  <transition name="dialog-fade">
    <div v-if="showDeleteDialog" class="custom-dialog-overlay" @click.self="showDeleteDialog = false">
      <div class="custom-dialog">
        <div class="custom-dialog__header">
          <span>删除动态</span>
        </div>
        <div class="custom-dialog__content">确定要删除这条动态吗？删除后无法恢复！</div>
        <div class="custom-dialog__footer">
          <button class="dialog-btn dialog-btn--cancel" @click="showDeleteDialog = false">取消</button>
          <button class="dialog-btn dialog-btn--confirm" @click="confirmDelete">确定</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from "vue";
import { useCounterStore } from "@/stores/counter";
import { addCommentAPI, likePostAPI, deletePostAPI, getCommentsAPI } from "@/api/allApi";
const props = defineProps({ post: Object });
const emit = defineEmits(["update-post", "delete-post"]);
const store = useCounterStore();
const showComments = ref(false);
const commentText = ref("");
const showDeleteDialog = ref(false);

const commentsPage = ref(1);
const commentsPageSize = 5;
const commentsFinished = ref(false);
const commentsLoading = ref(false);

// 判断当前用户是否可以删除该帖子
const canDelete = computed(() => {
  const user = store.userInfo || { id: null };
  return user.id && props.post.user_id && user.id === props.post.user_id;
});

// 获取用户头像URL，支持多种字段名
const getUserAvatar = (data) => {
  if (!data) return null;

  // 首先尝试从数据本身获取头像
  const avatarUrl = data.u_avatar || data.avatar || data.user_avatar;
  if (avatarUrl) return avatarUrl;

  // 如果数据中没有头像，检查是否是当前登录用户
  const user = store.userInfo;
  if (user && data.user_id && user.id === data.user_id) {
    // 如果是当前登录用户，返回本地存储的头像
    return user.u_avatar || null;
  }

  return null;
};

// 生成头像样式，基于用户名生成不同颜色
const getAvatarStyle = (name) => {
  const colors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)",
  ];

  // 基于用户名生成一个稳定的颜色索引
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;

  return {
    background: colors[index],
  };
};

const toggleLike = async () => {
  try {
    const user = store.userInfo || { id: null };
    const res = await likePostAPI({ post_id: props.post.id, user_id: user.id });
    if (res && res.code === 200 && res.data) {
      props.post.likes = res.data.likes;
      // set liked based on res.data.liked
      props.post.liked = !!res.data.liked;
      emit("update-post", props.post);
    }
  } catch (err) {
    console.error("点赞失败", err);
  }
};
const toggleComments = () => {
  showComments.value = !showComments.value;
  if (showComments.value && (!props.post.comments || !props.post.comments.length)) {
    loadComments(true);
  }
};
const addComment = async () => {
  const text = commentText.value.trim();
  if (!text) return;
  const user = store.userInfo || { id: null, name: "访客" };
  try {
    const res = await addCommentAPI({
      post_id: props.post.id,
      user_id: user.id,
      author: user.name || user.u_name || "访客",
      u_avatar: user.u_avatar || null, // 添加用户头像
      text,
    });
    if (res && res.code === 200 && res.data) {
      props.post.comments = props.post.comments || [];
      props.post.comments.unshift(res.data);
      // update comments_count if present
      props.post.comments_count = (props.post.comments_count || 0) + 1;
      commentText.value = "";
      emit("update-post", props.post);
    }
  } catch (err) {
    console.error(err);
  }
};
const loadComments = async (reset = false) => {
  if (reset) {
    commentsPage.value = 1;
    commentsFinished.value = false;
    props.post.comments = [];
  }
  if (commentsFinished.value || commentsLoading.value) return;
  commentsLoading.value = true;
  try {
    const res = await getCommentsAPI(props.post.id, commentsPage.value, commentsPageSize);
    if (res && res.code === 200) {
      const data = res.data || [];
      props.post.comments = (props.post.comments || []).concat(data);
      // keep comments_count at least equal to loaded comment length
      props.post.comments_count = Math.max(props.post.comments_count || 0, (props.post.comments || []).length);
      if (data.length < commentsPageSize) commentsFinished.value = true;
      commentsPage.value += 1;
    }
  } catch (err) {
    console.error("加载评论失败", err);
  } finally {
    commentsLoading.value = false;
  }
};
const openPreview = (idx) => {
  // dispatch a global event so image preview shows in app-level container
  const imgs = props.post.images || [];
  // make clicked image first so preview opens at that image
  const ordered = imgs.slice(idx).concat(imgs.slice(0, idx));
  window.dispatchEvent(new CustomEvent("show-image-preview", { detail: { images: ordered } }));
};

const delPost = () => {
  // 显示确认对话框
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  try {
    const res = await deletePostAPI({ post_id: props.post.id });
    if (res && res.code === 200) {
      emit("delete-post", props.post.id);
    } else {
      alert("删除失败，请稍后重试");
    }
  } catch (err) {
    console.error(err);
    alert("删除失败，请检查网络连接");
  }
};

const timeAgo = (iso) => {
  try {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    // guard against invalid dates (diff = NaN)
    if (!Number.isFinite(diff)) return "刚刚";

    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);

    // 格式化具体时间
    const formatTime = () => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const currentYear = new Date().getFullYear();

      // 如果是今年，不显示年份
      if (year === currentYear) {
        return `${month}-${day} ${hours}:${minutes}`;
      }
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    // 相对时间显示
    let relativeTime = "";
    if (s < 60) {
      relativeTime = "刚刚";
    } else if (m < 60) {
      relativeTime = `${m}分钟前`;
    } else if (h < 24) {
      relativeTime = `${h}小时前`;
    } else if (d < 7) {
      relativeTime = `${d}天前`;
    } else {
      // 超过7天只显示具体时间
      return formatTime();
    }

    // 组合显示：相对时间 + 具体时间
    return `${relativeTime} · ${formatTime()}`;
  } catch (e) {
    return "刚刚";
  }
};
</script>

<style scoped>
.post-card {
  background: #fff;
  padding: 12px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  margin-bottom: 12px;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
.head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #fff;
  overflow: hidden;
  position: relative;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}
.avatar-text {
  position: relative;
  z-index: 1;
  text-transform: uppercase;
}
.meta {
  flex: 1;
}
.author {
  font-weight: 600;
}
.time {
  font-size: 3vw;
  color: #888;
}
.del-btn {
  background: transparent;
  border: none;
  color: #f66;
}
.content {
  margin: 8px 0;
  font-size: 3.6vw;
  white-space: pre-wrap;
  word-break: break-word;
}
.images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
/* single image should be shown larger */
.images.single {
  grid-template-columns: 1fr;
}
@media (max-width: 500px) {
  .images {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .images.single {
    grid-template-columns: 1fr;
  }
  .img {
    width: 100%;
    margin-bottom: 0;
  }
  .img img {
    width: 100%;
    display: block;
  }
}
.img {
  position: relative;
  cursor: pointer;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 8px;
}
.img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.18s ease;
}
.img img:hover {
  transform: scale(1.03);
}
/* overlay for showing +N more images */
.more-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-weight: 700;
  font-size: 4.6vw;
  border-radius: 8px;
  pointer-events: none; /* allow click to go through to parent */
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 18px;
  padding: 6px 10px;
  border: none;
  cursor: pointer;
  color: #333;
  font-weight: 600;
}
.action-btn .a-icon {
  font-size: 4.2vw;
}
.action-btn .a-text {
  font-size: 3.2vw;
}
.action-btn .a-count {
  background: #fff;
  color: #666;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 3vw;
  margin-left: 4px;
}
.action-btn.like-btn.liked {
  background: linear-gradient(90deg, #ff33ff, #1c55ff);
  color: #fff;
}
.action-btn.like-btn.liked .a-count {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}
.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.comments {
  margin-top: 10px;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}
.load-comments {
  width: 100%;
  padding: 6px;
  margin-bottom: 8px;
  background: #f8f8f8;
  border: none;
  border-radius: 6px;
  color: #666;
  font-size: 3vw;
  cursor: pointer;
}
.load-comments:hover {
  background: #f0f0f0;
}
.comment {
  margin-bottom: 10px;
  padding: 10px;
  background: #f7f8fa;
  border-radius: 8px;
  transition: background 0.2s ease;
  display: flex;
  gap: 10px;
}
.comment:hover {
  background: #f0f2f5;
}
.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}
.comment-avatar .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}
.comment-avatar .avatar-text {
  position: relative;
  z-index: 1;
  text-transform: uppercase;
}
.comment-content {
  flex: 1;
  min-width: 0;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.c-author {
  font-weight: 600;
  font-size: 3.2vw;
  color: #333;
}
.c-time {
  font-size: 2.4vw;
  color: #999;
  white-space: nowrap;
}
.c-text {
  font-size: 3vw;
  color: #555;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}
.comment-input {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.comment-input input {
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 3.2vw;
  background: #fff;
  transition: border-color 0.2s ease;
}
.comment-input input:focus {
  outline: none;
  border-color: #1c55ff;
}
.comment-input button {
  background: var(--primary-gradient);
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 3.2vw;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.comment-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* PC端字体适配 */
@media (min-width: 768px) {
  .post-time {
    font-size: 11px;
  }
  .username {
    font-size: 13px;
  }
  .post-content {
    font-size: 17px;
  }
  .full-content {
    font-size: 16px;
  }
  .more-btn {
    font-size: 12px;
  }
  .stat-text {
    font-size: 11px;
  }
  .comment-item-username {
    font-size: 12px;
  }
  .comment-item-text {
    font-size: 9px;
  }
  .comment-item-time {
    font-size: 11px;
  }
  .comment-show-all {
    font-size: 12px;
  }
  .comment-input button {
    font-size: 12px;
  }
}

/* 自定义删除确认弹窗样式 */
.custom-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.custom-dialog {
  background: #fff;
  border-radius: 20px;
  min-width: 280px;
  max-width: 90vw;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.25);
  overflow: hidden;
  animation: dialog-pop-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.custom-dialog__header {
  padding: 28px 24px 20px;
  min-height: 60px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
  border-bottom: 2px solid #f0f0f0;
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-dialog__header::after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -2px;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #ff6b6b, #ee5a6f);
}

.custom-dialog__content {
  padding: 16px 24px;
  font-size: 15px;
  line-height: 1.5;
  color: #666;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.custom-dialog__footer {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
}

.dialog-btn {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.dialog-btn::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.dialog-btn:active::before {
  width: 300px;
  height: 300px;
}

.dialog-btn--cancel {
  background: #f5f5f5;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dialog-btn--cancel:active {
  background: #e8e8e8;
  transform: scale(0.96);
}

.dialog-btn--confirm {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(238, 90, 111, 0.3);
}

.dialog-btn--confirm:active {
  transform: scale(0.96);
  box-shadow: 0 2px 8px rgba(238, 90, 111, 0.3);
}

/* 弹窗动画 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-active .custom-dialog {
  animation: dialog-pop-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.dialog-fade-leave-active .custom-dialog {
  animation: dialog-pop-out 0.25s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

@keyframes dialog-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-30px);
  }
  50% {
    transform: scale(1.05) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes dialog-pop-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

/* 原有的 NutUI 弹窗样式（已弃用，保留以防万一） */
.hidden-nut-dialog {
  display: none;
}

/* 美化删除确认弹窗 */
:deep(.nut-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.25);
  min-width: 280px;
  max-width: 90vw;
  animation: dialog-pop-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

:deep(.nut-dialog__header) {
  padding: 28px 24px 20px;
  min-height: 60px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
  border-bottom: 2px solid #f0f0f0;
  text-align: center;
  position: relative;
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
  word-break: keep-all;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.nut-dialog__header::after) {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -2px;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #ff6b6b, #ee5a6f);
}

:deep(.nut-dialog__content) {
  padding: 16px 24px;
  font-size: 15px;
  line-height: 1.5;
  color: #666;
  background: #fff;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

:deep(.nut-dialog__footer) {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  background: #fff;
}

:deep(.nut-dialog__footer .nut-button) {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

:deep(.nut-dialog__footer .nut-button::before) {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

:deep(.nut-dialog__footer .nut-button:active::before) {
  width: 300px;
  height: 300px;
}

:deep(.nut-dialog__footer .nut-button--default) {
  background: #f5f5f5;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.nut-dialog__footer .nut-button--default:active) {
  background: #e8e8e8;
  transform: scale(0.96);
}

:deep(.nut-dialog__footer .nut-button--primary) {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(238, 90, 111, 0.3);
}

:deep(.nut-dialog__footer .nut-button--primary:active) {
  transform: scale(0.96);
  box-shadow: 0 2px 8px rgba(238, 90, 111, 0.3);
}

/* 弹窗弹出动画 */
@keyframes dialog-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-30px);
  }
  50% {
    transform: scale(1.05) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 蒙层美化 */
:deep(.nut-overlay) {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
</style>
