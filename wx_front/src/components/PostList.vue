<template>
  <div class="post-list" ref="listRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <!-- 下拉刷新提示 -->
    <div class="pull-refresh" :style="{ height: pullDistance + 'px' }">
      <div class="pull-refresh-content" :class="refreshStatus">
        <div v-if="refreshStatus === 'pulling'" class="pull-icon">↓</div>
        <div v-else-if="refreshStatus === 'loosing'" class="pull-icon loosing">↑</div>
        <div v-else-if="refreshStatus === 'refreshing'" class="pull-spinner">
          <div class="spinner-wrapper">
            <div class="spinner"></div>
            <div class="spinner-pulse"></div>
          </div>
        </div>
        <div v-else-if="refreshStatus === 'success'" class="pull-icon success">✓</div>
        <span class="pull-text">
          <template v-if="refreshStatus === 'pulling'">下拉刷新</template>
          <template v-else-if="refreshStatus === 'loosing'">释放刷新</template>
          <template v-else-if="refreshStatus === 'refreshing'">加载中...</template>
          <template v-else-if="refreshStatus === 'success'">刷新成功</template>
        </span>
      </div>
    </div>

    <!-- 刷新完成提示 -->
    <transition name="toast">
      <div v-if="showSuccessToast" class="success-toast">
        <div class="toast-icon">✓</div>
        <div class="toast-text">刷新成功</div>
      </div>
    </transition>

    <div v-if="posts.length">
      <PostCard v-for="p in postsSorted" :key="p.id" :post="p" @update-post="updatePost" @delete-post="deletePost" />
      <div class="load-more" v-if="!finished" ref="loadMoreEl">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
          <span>加载中...</span>
        </div>
        <button v-else @click="loadRemote">加载更多</button>
      </div>
      <div class="finished" v-else>
        <div class="finished-icon">📝</div>
        <div class="finished-text">没有更多了</div>
        <div class="finished-sub">已经到底啦～</div>
      </div>
    </div>
    <div v-else class="empty">
      <div class="empty-icon">🌟</div>
      <div class="empty-text">暂无动态</div>
      <div class="empty-sub">点击右下角发布第一条动态吧～</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import PostCard from "./PostCard.vue";
import { getPostsAPI } from "@/api/allApi";

const posts = ref([]);
const page = ref(1);
const pageSize = 10;
const loading = ref(false);
const finished = ref(false);

// 下拉刷新相关
const listRef = ref(null);
const pullDistance = ref(0);
const refreshStatus = ref(""); // 'pulling', 'loosing', 'refreshing', 'success'
const startY = ref(0);
const isPulling = ref(false);
const showSuccessToast = ref(false);
const PULL_THRESHOLD = 80; // 触发刷新的距离

// infinite scroll via intersection observer
const loadMoreEl = ref(null);
let observer = null;

const loadRemote = async (reset = false) => {
  if (loading.value || (finished.value && !reset)) return;
  loading.value = true;
  if (reset) {
    page.value = 1;
    posts.value = [];
    finished.value = false;
  }
  try {
    const res = await getPostsAPI(page.value, pageSize);
    if (res && res.code === 200) {
      const data = res.data || [];
      if (data.length < pageSize) finished.value = true;
      posts.value.push(...data);
      page.value += 1;
    }
  } catch (err) {
    console.error("加载帖子失败", err);
  } finally {
    loading.value = false;
  }
};

// 下拉刷新函数
const handleRefresh = async () => {
  refreshStatus.value = "refreshing";
  try {
    // 重新加载第一页
    page.value = 1;
    posts.value = [];
    finished.value = false;
    const res = await getPostsAPI(1, pageSize);
    if (res && res.code === 200) {
      const data = res.data || [];
      posts.value = data;
      page.value = 2;
      if (data.length < pageSize) finished.value = true;
      refreshStatus.value = "success";

      // 显示刷新成功的toast
      setTimeout(() => {
        showSuccessToast.value = true;
        setTimeout(() => {
          showSuccessToast.value = false;
        }, 2000);
      }, 300);
    }
  } catch (err) {
    console.error("刷新失败", err);
  }

  // 显示成功提示后慢慢收回
  setTimeout(() => {
    pullDistance.value = 0;
    refreshStatus.value = "";
    isPulling.value = false;
  }, 500);
};

// 触摸事件处理
const handleTouchStart = (e) => {
  // 只有在顶部时才启用下拉刷新
  if (window.scrollY === 0 && !loading.value) {
    startY.value = e.touches[0].clientY;
    isPulling.value = true;
  }
};

const handleTouchMove = (e) => {
  if (!isPulling.value || refreshStatus.value === "refreshing") return;

  const currentY = e.touches[0].clientY;
  const distance = currentY - startY.value;

  // 只处理向下拉的情况
  if (distance > 0 && window.scrollY === 0) {
    e.preventDefault();
    // 阻尼效果，拉得越长越难拉
    pullDistance.value = Math.min(distance * 0.5, PULL_THRESHOLD * 1.5);

    if (pullDistance.value >= PULL_THRESHOLD) {
      refreshStatus.value = "loosing";
    } else {
      refreshStatus.value = "pulling";
    }
  }
};

const handleTouchEnd = () => {
  if (!isPulling.value) return;

  if (pullDistance.value >= PULL_THRESHOLD && refreshStatus.value === "loosing") {
    // 触发刷新
    pullDistance.value = 60; // 设置为固定高度
    handleRefresh();
  } else {
    // 恢复原状
    pullDistance.value = 0;
    refreshStatus.value = "";
    isPulling.value = false;
  }
};

const onPublish = (e) => {
  // new post comes from server already
  posts.value.unshift(e.detail);
};

onMounted(() => {
  loadRemote(true);
  window.addEventListener("publish", onPublish);
  if (loadMoreEl.value && "IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) loadRemote();
      });
    });
    observer.observe(loadMoreEl.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("publish", onPublish);
  if (observer && loadMoreEl.value) observer.unobserve(loadMoreEl.value);
});

const updatePost = (post) => {
  const idx = posts.value.findIndex((p) => p.id === post.id);
  if (idx >= 0) {
    posts.value.splice(idx, 1, { ...post });
  }
};
const deletePost = (id) => {
  posts.value = posts.value.filter((p) => p.id !== id);
};

const postsSorted = computed(() => posts.value.slice().sort((a, b) => b.id - a.id));
</script>

<style scoped>
.post-list {
  padding: 12px;
  position: relative;
  overflow: hidden;
}

/* 下拉刷新 */
.pull-refresh {
  position: absolute;
  top: -80px;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transition: height 0.3s ease;
  overflow: hidden;
}
.pull-refresh-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  transition: all 0.3s ease;
}
.pull-icon {
  font-size: 20px;
  animation: pullBounce 0.6s ease infinite;
}
.pull-icon.loosing {
  animation: pullRotate 0.6s ease infinite;
  color: #1c55ff;
  font-weight: bold;
}
.pull-icon.success {
  color: #4caf50;
  animation: scaleIn 0.3s ease;
  font-weight: bold;
}
.pull-text {
  font-size: 3.2vw;
  color: #666;
  font-weight: 500;
}
.pull-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}
.spinner-wrapper {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1c55ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: relative;
  z-index: 2;
}
.spinner-pulse {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 2px solid #1c55ff;
  border-radius: 50%;
  animation: pulse 1.5s ease-out infinite;
  opacity: 0.6;
}

/* 刷新成功Toast */
.success-toast {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(76, 175, 80, 0.95);
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  z-index: 9999;
  backdrop-filter: blur(10px);
}
.toast-icon {
  font-size: 20px;
  font-weight: bold;
  animation: scaleIn 0.3s ease;
}
.toast-text {
  font-size: 3.6vw;
  font-weight: 600;
}

/* Toast动画 */
.toast-enter-active {
  animation: toastSlideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  animation: toastSlideUp 0.3s ease-out;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 20px;
}
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #666;
  font-size: 3.2vw;
}
.loading-spinner .spinner {
  width: 18px;
  height: 18px;
  border-width: 2px;
}
.load-more button {
  background: #f5f5f5;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  color: #666;
  font-size: 3.2vw;
  cursor: pointer;
  transition: all 0.3s ease;
}
.load-more button:hover {
  background: #e8e8e8;
  transform: translateY(-2px);
}

.empty {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.empty-icon {
  font-size: 12vw;
  animation: float 3s ease-in-out infinite;
}
.empty-text {
  font-size: 4.2vw;
  font-weight: 600;
  color: #666;
}
.empty-sub {
  font-size: 3.2vw;
  color: #999;
}
.finished {
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.finished-icon {
  font-size: 8vw;
  opacity: 0.6;
  animation: fadeIn 0.5s ease;
}
.finished-text {
  font-size: 3.6vw;
  font-weight: 600;
  color: #888;
}
.finished-sub {
  font-size: 3vw;
  color: #aaa;
}

/* 动画 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.2;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}
@keyframes pullBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(5px);
  }
}
@keyframes pullRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(180deg);
  }
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 0.6;
    transform: scale(1);
  }
}
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes toastSlideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}
@keyframes toastSlideUp {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(0.8);
  }
}

/* PC端字体适配 */
@media (min-width: 768px) {
  .pull-refresh-text {
    font-size: 12px;
  }
  .load-more-btn {
    font-size: 13px;
  }
  .loading-text {
    font-size: 12px;
  }
  .finished-icon {
    font-size: 45px;
  }
  .finished-text {
    font-size: 13px;
  }
  .finished-sub {
    font-size: 11px;
  }
  .no-posts-icon {
    font-size: 45px;
  }
  .no-posts-text {
    font-size: 16px;
  }
  .no-posts-sub {
    font-size: 12px;
  }
}
</style>
