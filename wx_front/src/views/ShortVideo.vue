<template>
  <div class="short-video-page">
    <header class="video-header">
      <div class="header-bg-decoration"></div>
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">🎬</div>
          <div class="header-text">
            <div class="title">短视频</div>
            <div class="subtitle">精彩视频，即将上线</div>
          </div>
        </div>
      </div>
    </header>

    <div class="coming-soon">
      <div class="icon">🚧</div>
      <div class="text">功能开发中...</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  // 重置滚动位置到顶部
  window.scrollTo(0, 0);
});
</script>

<style scoped lang="scss">
.short-video-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9ff 0%, #ffffff 100%);
  padding-bottom: 80px;
}

.video-header {
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
}

.header-icon {
  font-size: 32px;
  animation: sparkle 3s ease-in-out infinite;
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

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-20px) translateX(10px);
  }
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

.coming-soon {
  text-align: center;
  padding: 100px 20px;

  .icon {
    font-size: 80px;
    margin-bottom: 20px;
    animation: bounce 2s ease-in-out infinite;
  }

  .text {
    font-size: 18px;
    color: #999;
    font-weight: 500;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
