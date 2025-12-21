<template>
  <div class="my-page">
    <!-- 美化的头部区域 -->
    <header class="my-header">
      <div class="header-bg-decoration"></div>
      <div class="header-content">
        <!-- 用户信息卡片 -->
        <div class="user-card">
          <div class="avatar-wrapper" @click="handleAvatarClick">
            <img :src="userInfo?.u_avatar || defaultAvatar" alt="头像" />
            <div class="avatar-border"></div>
            <div class="avatar-edit-hint">点击修改</div>
          </div>
          <div class="user-info">
            <div class="username">{{ userInfo?.u_name || "游客" }}</div>
            <div class="user-id">ID: {{ userInfo?.id || "---" }}</div>
          </div>
        </div>
        <!-- 隐藏的文件输入 -->
        <input ref="avatarInput" type="file" accept="image/*" style="display: none" @change="handleAvatarChange" />
      </div>
    </header>

    <!-- 数据统计卡片 -->
    <div class="stats-section">
      <div class="stats-card">
        <div class="stat-item" @click="showMyPosts">
          <div class="stat-number" v-if="!loading">{{ myPostsCount }}</div>
          <div class="stat-number loading-text" v-else>-</div>
          <div class="stat-label">我的帖子</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item" @click="showMyLikes">
          <div class="stat-number" v-if="!loading">{{ myLikesCount }}</div>
          <div class="stat-number loading-text" v-else>-</div>
          <div class="stat-label">获赞数</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item" @click="showMyComments">
          <div class="stat-number" v-if="!loading">{{ myCommentsCount }}</div>
          <div class="stat-number loading-text" v-else>-</div>
          <div class="stat-label">评论数</div>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <div class="menu-card">
        <div class="menu-item" @click="showMyPosts">
          <div class="menu-icon">📝</div>
          <div class="menu-text">我的帖子</div>
          <div class="menu-arrow">›</div>
        </div>
        <div class="menu-item" @click="showMyLikes">
          <div class="menu-icon">❤️</div>
          <div class="menu-text">我的点赞</div>
          <div class="menu-arrow">›</div>
        </div>
        <div class="menu-item" @click="showMyComments">
          <div class="menu-icon">💬</div>
          <div class="menu-text">我的评论</div>
          <div class="menu-arrow">›</div>
        </div>
      </div>

      <!-- 退出登录按钮 -->
      <div class="logout-section">
        <button class="logout-btn" @click="handleLogout">
          <span class="logout-icon">🚪</span>
          <span>退出登录</span>
        </button>
      </div>
    </div>

    <!-- 我的帖子弹窗 -->
    <nut-popup v-model:visible="showPostsPopup" position="right" :style="{ width: '100%', height: '100%' }">
      <div class="popup-container">
        <div class="popup-header">
          <button class="back-btn" @click="showPostsPopup = false">‹</button>
          <span class="popup-title">我的帖子</span>
        </div>
        <div class="popup-content">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner">⏳</div>
            <div class="loading-text">加载中...</div>
          </div>
          <div v-else-if="myPosts.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <div class="empty-text">还没有发布过帖子</div>
          </div>
          <div v-else class="posts-list">
            <PostCard v-for="post in myPosts" :key="post.id" :post="post" @deleted="loadMyPosts" />
          </div>
        </div>
      </div>
    </nut-popup>

    <!-- 我的点赞弹窗 -->
    <nut-popup v-model:visible="showLikesPopup" position="right" :style="{ width: '100%', height: '100%' }">
      <div class="popup-container">
        <div class="popup-header">
          <button class="back-btn" @click="showLikesPopup = false">‹</button>
          <span class="popup-title">我的点赞</span>
        </div>
        <div class="popup-content">
          <div v-if="loadingLikes" class="loading-state">
            <div class="loading-spinner">⏳</div>
            <div class="loading-text">加载中...</div>
          </div>
          <div v-else-if="myLikedPosts.length === 0" class="empty-state">
            <div class="empty-icon">💔</div>
            <div class="empty-text">还没有点赞过帖子</div>
          </div>
          <div v-else class="posts-list">
            <div v-for="post in myLikedPosts" :key="post.id" class="post-preview" @click="goToPostDetail(post)">
              <div class="post-preview-header">
                <img :src="post.u_avatar || defaultAvatar" alt="头像" class="author-avatar" />
                <div class="post-author-info">
                  <div class="post-author">{{ post.author }}</div>
                  <div class="post-time">{{ formatTime(post.createdAt) }}</div>
                </div>
              </div>
              <div class="post-preview-content">{{ post.content }}</div>
              <div class="post-preview-images" v-if="post.images && post.images.length">
                <img v-for="(img, idx) in post.images.slice(0, 3)" :key="idx" :src="img" alt="图片" />
              </div>
              <div class="post-preview-stats">
                <span>❤️ {{ post.likes || 0 }}</span>
                <span>💬 {{ post.comments_count || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nut-popup>

    <!-- 我的评论弹窗 -->
    <nut-popup v-model:visible="showCommentsPopup" position="right" :style="{ width: '100%', height: '100%' }">
      <div class="popup-container">
        <div class="popup-header">
          <button class="back-btn" @click="showCommentsPopup = false">‹</button>
          <span class="popup-title">我的评论</span>
        </div>
        <div class="popup-content">
          <div v-if="loadingComments" class="loading-state">
            <div class="loading-spinner">⏳</div>
            <div class="loading-text">加载中...</div>
          </div>
          <div v-else-if="myCommentedPosts.length === 0" class="empty-state">
            <div class="empty-icon">💬</div>
            <div class="empty-text">还没有评论过帖子</div>
          </div>
          <div v-else class="posts-list">
            <div v-for="post in myCommentedPosts" :key="post.id" class="post-preview" @click="goToPostDetail(post)">
              <div class="post-preview-header">
                <img :src="post.u_avatar || defaultAvatar" alt="头像" class="author-avatar" />
                <div class="post-author-info">
                  <div class="post-author">{{ post.author }}</div>
                  <div class="post-time">{{ formatTime(post.createdAt) }}</div>
                </div>
              </div>
              <div class="post-preview-content">{{ post.content }}</div>
              <div class="post-preview-images" v-if="post.images && post.images.length">
                <img v-for="(img, idx) in post.images.slice(0, 3)" :key="idx" :src="img" alt="图片" />
              </div>
              <div class="post-preview-stats">
                <span>❤️ {{ post.likes || 0 }}</span>
                <span>💬 {{ post.comments_count || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nut-popup>

    <!-- 帖子详情弹窗 -->
    <nut-popup v-model:visible="showDetailPopup" position="right" :style="{ width: '100%', height: '100%' }">
      <div class="popup-container">
        <div class="popup-header">
          <button class="back-btn" @click="showDetailPopup = false">‹</button>
          <span class="popup-title">帖子详情</span>
        </div>
        <div class="popup-content">
          <PostCard v-if="selectedPost" :post="selectedPost" :key="selectedPost.id" />
        </div>
      </div>
    </nut-popup>

    <!-- 确认退出弹窗 -->
    <nut-dialog v-model:visible="showLogoutDialog" title="退出登录" content="确定要退出登录吗？" ok-text="确定" cancel-text="取消" @ok="confirmLogout" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";
import { getPostsAPI, getMyLikedPostsAPI, getMyCommentedPostsAPI, updateUserAvatarAPI } from "@/api/allApi";
import PostCard from "@/components/PostCard.vue";
import { showToast } from "@nutui/nutui";
import { uploadFile } from "@/utils/oss";

const router = useRouter();
const store = useCounterStore();
const { userInfo } = storeToRefs(store);

const defaultAvatar = "https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/cookies/default-avatar.png";
const avatarInput = ref(null);

// 数据统计
const myPostsCount = ref(0);
const myLikesCount = ref(0);
const myCommentsCount = ref(0);

// 我的帖子数据
const myPosts = ref([]);
const showPostsPopup = ref(false);
const showLogoutDialog = ref(false);
const loading = ref(false);

// 我的点赞数据
const myLikedPosts = ref([]);
const showLikesPopup = ref(false);
const loadingLikes = ref(false);

// 我的评论数据
const myCommentedPosts = ref([]);
const showCommentsPopup = ref(false);
const loadingComments = ref(false);

// 帖子详情
const selectedPost = ref(null);
const showDetailPopup = ref(false);

// 加载我的帖子
const loadMyPosts = async () => {
  if (!userInfo.value?.id) {
    console.warn("用户未登录");
    return;
  }

  loading.value = true;
  try {
    const res = await getPostsAPI(1, 100);
    console.log("获取帖子数据:", res);

    if (res.code === 200 && res.data) {
      // 后端返回的是 { code: 200, data: posts } 直接是数组
      const allPosts = Array.isArray(res.data) ? res.data : [];

      // 筛选出当前用户的帖子
      myPosts.value = allPosts.filter((post) => post.user_id === userInfo.value.id);
      myPostsCount.value = myPosts.value.length;

      // 计算总点赞数 - 使用 likes 字段
      myLikesCount.value = myPosts.value.reduce((sum, post) => sum + (post.likes || 0), 0);

      // 计算总评论数 - 使用 comments_count 字段
      myCommentsCount.value = myPosts.value.reduce((sum, post) => sum + (post.comments_count || 0), 0);

      console.log("我的帖子统计:", {
        帖子数: myPostsCount.value,
        点赞数: myLikesCount.value,
        评论数: myCommentsCount.value,
      });
    }
  } catch (error) {
    console.error("加载我的帖子失败:", error);
    showToast.fail("加载数据失败");
  } finally {
    loading.value = false;
  }
};

// 显示我的帖子
const showMyPosts = () => {
  showPostsPopup.value = true;
};

// 加载我的点赞
const loadMyLikes = async () => {
  if (!userInfo.value?.id) {
    console.warn("用户未登录");
    return;
  }

  loadingLikes.value = true;
  try {
    const res = await getMyLikedPostsAPI(userInfo.value.id);
    console.log("获取我的点赞:", res);

    if (res.code === 200 && res.data) {
      myLikedPosts.value = Array.isArray(res.data) ? res.data : [];
    }
  } catch (error) {
    console.error("加载我的点赞失败:", error);
    showToast.fail("加载数据失败");
  } finally {
    loadingLikes.value = false;
  }
};

// 显示我的点赞
const showMyLikes = () => {
  loadMyLikes();
  showLikesPopup.value = true;
};

// 加载我的评论
const loadMyComments = async () => {
  if (!userInfo.value?.id) {
    console.warn("用户未登录");
    return;
  }

  loadingComments.value = true;
  try {
    const res = await getMyCommentedPostsAPI(userInfo.value.id);
    console.log("获取我的评论:", res);

    if (res.code === 200 && res.data) {
      myCommentedPosts.value = Array.isArray(res.data) ? res.data : [];
    }
  } catch (error) {
    console.error("加载我的评论失败:", error);
    showToast.fail("加载数据失败");
  } finally {
    loadingComments.value = false;
  }
};

// 显示我的评论
const showMyComments = () => {
  loadMyComments();
  showCommentsPopup.value = true;
};

// 跳转到帖子详情
const goToPostDetail = (post) => {
  selectedPost.value = post;
  showDetailPopup.value = true;
};

// 格式化时间
const formatTime = (time) => {
  if (!time) return "";
  const date = new Date(time);
  const now = new Date();
  const diff = now - date;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "刚刚";
  } else if (diff < hour) {
    return Math.floor(diff / minute) + "分钟前";
  } else if (diff < day) {
    return Math.floor(diff / hour) + "小时前";
  } else if (diff < 7 * day) {
    return Math.floor(diff / day) + "天前";
  } else {
    return date.toLocaleDateString();
  }
};

// 点击头像触发文件选择
const handleAvatarClick = () => {
  avatarInput.value?.click();
};

// 处理头像文件变化
const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // 验证文件类型
  if (!file.type.startsWith("image/")) {
    showToast.fail("请选择图片文件");
    return;
  }

  // 验证文件大小（限制5MB）
  if (file.size > 5 * 1024 * 1024) {
    showToast.fail("图片大小不能超过5MB");
    return;
  }

  try {
    showToast.loading("上传中...");

    // 上传到OSS
    const avatarUrl = await uploadFile(file, "avatars/");

    // 调用后端API更新用户头像
    const res = await updateUserAvatarAPI({
      user_id: userInfo.value.id,
      avatar_url: avatarUrl,
    });

    if (res.code === 200) {
      // 更新本地store中的用户信息
      const updatedUserInfo = { ...userInfo.value, u_avatar: avatarUrl };
      store.setUserInfo(updatedUserInfo);
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      // 更新聊天记录中的头像 - 创建新数组以触发响应式更新
      // 更新群聊消息中的头像
      store.messages_p = store.messages_p.map((msg) => {
        if (msg.username === userInfo.value.u_name) {
          return { ...msg, user_img: avatarUrl };
        }
        return msg;
      });

      // 更新私聊消息中的头像
      store.private_messages_p = store.private_messages_p.map((msg) => {
        if (msg.username === userInfo.value.u_name) {
          return { ...msg, user_img: avatarUrl };
        }
        return msg;
      });

      // 更新在线用户列表中的头像
      store.onlineUser_p = store.onlineUser_p.map((u) => {
        if (u.user_people === userInfo.value.u_name) {
          return { ...u, user_img: avatarUrl };
        }
        return u;
      });

      showToast.hide();
      showToast.success("头像更新成功");
    } else {
      showToast.hide();
      showToast.fail(res.message || "更新失败");
    }
  } catch (error) {
    showToast.hide();
    console.error("上传头像失败:", error);
    showToast.fail("上传失败，请重试");
  } finally {
    // 清空input的值，以便可以重复选择同一文件
    event.target.value = "";
  }
};

// 退出登录
const handleLogout = () => {
  showLogoutDialog.value = true;
};

const confirmLogout = () => {
  // 清除用户信息
  store.setUserInfo(null);
  localStorage.removeItem("userInfo");
  localStorage.removeItem("token");

  // 清除在线用户状态
  store.onlineUser_p = [];
  store.messages_p = [];
  store.private_messages_p = [];
  store.unReadMessages_p = [];
  store.unprivateMessages_p = [];

  showToast.success("已退出登录");

  // 跳转到登录页
  setTimeout(() => {
    router.push("/login");
  }, 800);
};

onMounted(() => {
  // 重置滚动位置到顶部
  window.scrollTo(0, 0);

  console.log("我的页面加载，当前用户:", userInfo.value);
  if (userInfo.value) {
    loadMyPosts();
  } else {
    console.warn("未登录，跳转到登录页");
    showToast.text("请先登录");
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }
});
</script>

<style scoped lang="scss">
.my-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9ff 0%, #ffffff 100%);
  padding-bottom: 80px;
  font-family: "pingfang", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* 头部样式 */
.my-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 30px 20px 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.header-bg-decoration {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.header-bg-decoration::before {
  content: "";
  position: absolute;
  bottom: -80px;
  left: -100px;
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite reverse;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-20px) translateX(10px);
  }
}

.header-content {
  position: relative;
  z-index: 1;
}

/* 用户卡片 */
.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.98);
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: filter 0.3s ease;
  }

  &:hover img {
    filter: brightness(0.8);
  }

  .avatar-border {
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
    animation: rotate 3s linear infinite;
  }

  .avatar-edit-hint {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 11px;
    text-align: center;
    padding: 4px 0;
    border-radius: 0 0 50% 50%;
    opacity: 1;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover .avatar-edit-hint {
    opacity: 0.9;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.user-info {
  flex: 1;

  .username {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 6px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .user-id {
    font-size: 14px;
    opacity: 0.9;
  }
}

/* 数据统计 */
.stats-section {
  padding: 0 16px;
  margin-top: 0px;
}

.stats-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.12);
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.95);
  }

  .stat-number {
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 6px;
  }

  .stat-label {
    font-size: 13px;
    color: #8c8c8c;
  }
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, #e8e8e8, transparent);
}

/* 功能菜单 */
.menu-section {
  padding: 16px;
}

.menu-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.08);
  overflow: hidden;
  margin-bottom: 16px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f8f9ff;
  }

  .menu-icon {
    font-size: 24px;
    margin-right: 16px;
  }

  .menu-text {
    flex: 1;
    font-size: 15px;
    color: #2c3e50;
    font-weight: 500;
  }

  .menu-arrow {
    font-size: 24px;
    color: #bbb;
  }
}

/* 退出登录按钮 */
.logout-section {
  padding: 0 16px 20px;
}

.logout-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(238, 90, 111, 0.3);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(238, 90, 111, 0.4);
  }

  .logout-icon {
    font-size: 20px;
  }
}

/* 弹窗样式 */
.popup-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #f8f9ff 0%, #ffffff 100%);
}

.popup-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);

  .back-btn {
    background: none;
    border: none;
    color: #fff;
    font-size: 32px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .popup-title {
    font-size: 18px;
    font-weight: 600;
  }
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.loading-state {
  text-align: center;
  padding: 80px 20px;

  .loading-spinner {
    font-size: 60px;
    margin-bottom: 16px;
    animation: spin 2s linear infinite;
  }

  .loading-text {
    font-size: 16px;
    color: #999;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;

  .empty-icon {
    font-size: 80px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 16px;
    color: #999;
  }
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 帖子预览卡片样式 */
.post-preview {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
}

.post-preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .author-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #f0f0f0;
  }
}

.post-author-info {
  flex: 1;

  .post-author {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .post-time {
    font-size: 12px;
    color: #999;
  }
}

.post-preview-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-preview-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow: hidden;

  img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
  }
}

.post-preview-stats {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #666;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

/* 美化退出登录确认弹窗 */
:deep(.nut-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.25);
  animation: dialog-pop-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  min-width: 280px;
  max-width: 90vw;
}

:deep(.nut-dialog__header) {
  padding: 28px 24px 20px;
  min-height: 60px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
  border-bottom: 2px solid #f0f0f0;
  position: relative;
  text-align: center;
  word-break: keep-all;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.nut-dialog__header::before) {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -2px;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

:deep(.nut-dialog__footer .nut-button--primary:active) {
  transform: scale(0.96);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
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
