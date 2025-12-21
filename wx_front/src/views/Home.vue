<template>
  <div class="home">
    <header class="page-header">
      <div class="header-bg-decoration"></div>
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">✨</div>
          <div class="header-text">
            <div class="title">GG侠友圈</div>
            <div class="subtitle">分享生活点滴，记录美好瞬间</div>
          </div>
        </div>
        <div class="header-right">
          <div class="weather-icon">☀️</div>
        </div>
      </div>
    </header>

    <main>
      <PostList />
    </main>

    <!-- 动态浮动按钮 -->
    <!-- 返回顶部按钮 -->
    <button v-if="showBackToTop && !showNewPost" class="fab back-to-top" @click="scrollToTop">
      <span class="fab-icon">↑</span>
    </button>
    <!-- 发布动态按钮 -->
    <button v-else-if="!showNewPost" class="fab create-post" @click="showNewPost = true">
      <span class="fab-icon">+</span>
    </button>

    <!-- 发布帖子弹窗 -->
    <transition name="modal">
      <div class="modal-overlay" v-if="showNewPost" @click.self="showNewPost = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <span class="modal-title">发布动态</span>
            <button class="modal-close" @click="showNewPost = false">×</button>
          </div>
          <NewPost @close="showNewPost = false" />
        </div>
      </div>
    </transition>

    <!-- Global image preview: listens to CustomEvent 'show-image-preview' -->
    <nut-image-preview :show-index="true" :show="showPreview" :images="previewImages" @close="hidePreview" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import PostList from "@/components/PostList.vue";
import NewPost from "@/components/NewPost.vue";

const showPreview = ref(false);
const previewImages = ref([]);
const showNewPost = ref(false);
const showBackToTop = ref(false);
const lastScrollTop = ref(0);
const lastToggleScrollTop = ref(0); // 记录上次切换按钮时的滚动位置
const scrollThreshold = 150; // 滚动超过150px才显示按钮
const scrollDelta = 80; // 滚动变化超过80px才切换按钮状态

const showHandler = (e) => {
  const imgs = (e && e.detail && e.detail.images) || [];
  previewImages.value = imgs.map((s) => (typeof s === "string" ? { src: s } : s));
  showPreview.value = true;
};
const hidePreview = () => (showPreview.value = false);

// 处理浏览器返回事件
function handlePopState(event) {
  // 检查是否有弹窗打开
  if (showPreview.value) {
    // 如果图片预览打开，关闭它
    event.preventDefault();
    hidePreview();
    history.pushState(null, "", location.href); // 保持在当前页面
  } else if (showNewPost.value) {
    // 如果发布动态弹窗打开，关闭它
    event.preventDefault();
    showNewPost.value = false;
    history.pushState(null, "", location.href); // 保持在当前页面
  }
  // 如果没有弹窗打开，则允许正常返回
}

// 监听弹窗状态变化，当弹窗打开时添加历史记录
watch([showPreview, showNewPost], ([preview, newPost], [oldPreview, oldNewPost]) => {
  // 如果任何弹窗从关闭变为打开，添加一个历史记录
  if ((preview && !oldPreview) || (newPost && !oldNewPost)) {
    history.pushState(null, "", location.href);
  }
});

// 滚动监听
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollingDown = scrollTop > lastScrollTop.value;
  const scrollDistance = Math.abs(scrollTop - lastToggleScrollTop.value);

  lastScrollTop.value = scrollTop;

  // 滚动位置不足阈值时隐藏所有按钮
  if (scrollTop <= scrollThreshold) {
    showBackToTop.value = false;
    lastToggleScrollTop.value = scrollTop;
    return;
  }

  // 只有当滚动距离超过delta值时才切换按钮状态，避免频繁切换
  if (scrollDistance > scrollDelta) {
    // 向下滑动显示添加按钮，向上滑动显示返回顶部按钮
    showBackToTop.value = !scrollingDown;
    lastToggleScrollTop.value = scrollTop;
  }
};

// 返回顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

onMounted(() => {
  // 重置滚动位置到顶部
  window.scrollTo(0, 0);

  window.addEventListener("show-image-preview", showHandler);
  window.addEventListener("scroll", handleScroll, { passive: true });
  // 监听浏览器返回按钮
  window.addEventListener("popstate", handlePopState);
});

onUnmounted(() => {
  window.removeEventListener("show-image-preview", showHandler);
  window.removeEventListener("scroll", handleScroll);
  // 移除返回按钮监听
  window.removeEventListener("popstate", handlePopState);
});
</script>

<style scoped>
.home {
  padding-bottom: 60px;
}
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 20px 16px;
  border-radius: 0 0 24px 24px;
  margin: 0 0 16px 0;
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
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}
.header-icon {
  font-size: 32px;
  animation: sparkle 3s ease-in-out infinite;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}
.header-text {
  flex: 1;
}
.title {
  font-size: 5.6vw;
  font-weight: 700;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.subtitle {
  font-size: 3.2vw;
  opacity: 0.9;
  font-weight: 400;
}
.header-right {
  display: flex;
  align-items: center;
}
.weather-icon {
  font-size: 28px;
  animation: rotate 20s linear infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.1) rotate(10deg);
    opacity: 0.8;
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
@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-20px) translateX(10px);
  }
}
main {
  margin: 12px;
}

/* 浮动按钮 */
.fab {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 电脑端适配：让按钮相对于375px容器定位 */
@media (min-width: 768px) {
  .fab {
    right: calc(50vw - 375px / 2 + 20px);
  }
}

/* 发布按钮样式 */
.fab.create-post {
  background: linear-gradient(135deg, #ff33ff, #1c55ff);
  box-shadow: 0 4px 12px rgba(28, 85, 255, 0.4);
  animation: pulse 2s ease-in-out infinite;
}
.fab.create-post:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 6px 20px rgba(28, 85, 255, 0.6);
}
.fab.create-post:active {
  transform: scale(0.95) rotate(90deg);
}
.fab.create-post:hover .fab-icon {
  transform: rotate(90deg);
}

/* 返回顶部按钮样式 */
.fab.back-to-top {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
  box-shadow: 0 4px 12px rgba(67, 233, 123, 0.4);
  animation: bounce 1.5s ease-in-out infinite;
}
.fab.back-to-top:hover {
  transform: scale(1.1) translateY(-5px);
  box-shadow: 0 6px 20px rgba(67, 233, 123, 0.6);
}
.fab.back-to-top:active {
  transform: scale(0.95);
}
.fab.back-to-top .fab-icon {
  font-size: 28px;
  font-weight: bold;
}

.fab-icon {
  font-size: 32px;
  color: #fff;
  font-weight: 300;
  line-height: 1;
  transition: transform 0.3s ease;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 4px 12px rgba(28, 85, 255, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(28, 85, 255, 0.6), 0 0 0 8px rgba(28, 85, 255, 0.1);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 0;
  overflow: hidden;
}
.modal-content {
  background: #fff;
  border-radius: 20px 20px 0 0;
  width: 100vw;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
}
.modal-title {
  font-size: 4.2vw;
  font-weight: 600;
  color: #333;
}
.modal-close {
  background: transparent;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  line-height: 1;
}
.modal-close:hover {
  background: #f5f5f5;
  color: #666;
}

/* 弹窗动画 */
.modal-enter-active {
  animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-leave-active {
  animation: modalSlideDown 0.25s ease-out;
}
.modal-enter-active .modal-overlay {
  animation: fadeIn 0.3s ease;
}
.modal-leave-active .modal-overlay {
  animation: fadeOut 0.25s ease;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes modalSlideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 移动端适配 */
@media (max-width: 600px) {
  .modal-content {
    max-height: 85vh;
  }
}

/* PC端字体适配：固定字体大小，避免在375px容器内vw单位导致字体过大 */
@media (min-width: 768px) {
  .title {
    font-size: 21px;
  }
  .subtitle {
    font-size: 12px;
  }
  .header-icon {
    font-size: 28px;
  }
  .weather-icon {
    font-size: 24px;
  }
  .modal-title {
    font-size: 16px;
  }
}
</style>
