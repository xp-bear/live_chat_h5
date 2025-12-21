<template>
  <div class="cool-footer">
    <!-- 自定义底部导航 -->
    <div class="footer-nav">
      <div v-for="(item, index) in navList" :key="index" class="nav-item" :class="{ active: active === index }" @click="handleNavClick(index)">
        <!-- 内容包装器 -->
        <div class="content-wrapper">
          <!-- 涟漪效果容器 -->
          <div class="ripple-container">
            <div class="ripple" v-if="rippleIndex === index"></div>
          </div>

          <!-- 光晕效果 -->
          <div class="icon-glow"></div>

          <!-- 图标和标题 -->
          <div class="icon-text-group">
            <!-- SVG图标 -->
            <div class="icon-svg" v-html="active === index ? item.iconActive : item.icon"></div>

            <!-- 标题 -->
            <div class="nav-title">
              <span>{{ item.title }}</span>
            </div>
          </div>

          <!-- 未读消息徽章 -->
          <transition name="badge-pop">
            <div v-if="index === 1 && unprivateMessages_p.length" class="message-badge">
              <span>{{ unprivateMessages_p.length > 99 ? "99+" : unprivateMessages_p.length }}</span>
              <div class="badge-ping"></div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";

const store = useCounterStore();
const { tabbarIndex, unprivateMessages_p } = storeToRefs(store);
const router = useRouter();
const route = useRoute();

const active = ref(0);
const rippleIndex = ref(-1);

// 导航列表配置
const navList = [
  {
    title: "首页",
    to: "/home",
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    iconActive: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" fill="url(#gradient1)" stroke="url(#gradient1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 22V12H15V22" fill="url(#gradient1)" stroke="url(#gradient1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>`,
  },
  {
    title: "聊天",
    to: "/chat",
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    iconActive: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" fill="url(#gradient2)" stroke="url(#gradient2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <defs>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>`,
  },
  {
    title: "短视频",
    to: "/shortvideo",
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 5H3C1.89543 5 1 5.89543 1 7V17C1 18.1046 1.89543 19 3 19H14C15.1046 19 16 18.1046 16 17V7C16 5.89543 15.1046 5 14 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    iconActive: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 7L16 12L23 17V7Z" fill="url(#gradient3)" stroke="url(#gradient3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 5H3C1.89543 5 1 5.89543 1 7V17C1 18.1046 1.89543 19 3 19H14C15.1046 19 16 18.1046 16 17V7C16 5.89543 15.1046 5 14 5Z" fill="url(#gradient3)" stroke="url(#gradient3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <defs>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>`,
  },
  {
    title: "我的",
    to: "/linkman",
    icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    iconActive: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" fill="url(#gradient4)" stroke="url(#gradient4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" fill="url(#gradient4)" stroke="url(#gradient4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <defs>
        <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>`,
  },
];

// 处理导航点击
const handleNavClick = (index) => {
  if (active.value === index) return;

  active.value = index;
  rippleIndex.value = index;

  // 清除涟漪效果
  setTimeout(() => {
    rippleIndex.value = -1;
  }, 600);

  // 路由跳转
  router.push(navList[index].to);
};

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    const pathMap = {
      "/home": 0,
      "/chat": 1,
      "/shortvideo": 2,
      "/linkman": 3,
    };

    const newIndex = pathMap[newPath];
    if (newIndex !== undefined) {
      active.value = newIndex;
      tabbarIndex.value = newIndex;
    }
  },
  { immediate: true }
);

onMounted(() => {});
</script>

<style lang="scss" scoped>
.cool-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);

  /* 电脑端适配：限制在375px宽度内并居中 */
  @media (min-width: 768px) {
    width: 375px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);

    &::before {
      border-radius: 0;
    }
  }

  /* 玻璃拟态背景 */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-top: 1px solid rgba(102, 126, 234, 0.1);
    box-shadow: 0 -10px 40px rgba(102, 126, 234, 0.08);
  }

  /* 底部导航容器 */
  .footer-nav {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    height: 100%;
    padding: 0 10px;
    z-index: 1;
  }

  /* 导航项 */
  .nav-item {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;

    /* 内容包装器 */
    .content-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      transition: all 0.3s ease;

      /* 涟漪效果容器 */
      .ripple-container {
        position: absolute;
        inset: 0;
        overflow: hidden;
        border-radius: 50%;
        pointer-events: none;
      }

      .ripple {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        animation: ripple-effect 0.6s ease-out;
      }

      /* 光晕效果 */
      .icon-glow {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(118, 75, 162, 0) 100%);
        transition: all 0.4s ease;
        opacity: 0;
        transform: scale(0.8);
      }

      /* 图标和文字组合 */
      .icon-text-group {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        z-index: 1;
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      /* SVG图标 */
      .icon-svg {
        width: 24px;
        height: 24px;
        color: #9ca3af;
        transition: all 0.3s ease;

        :deep(svg) {
          width: 100%;
          height: 100%;
          display: block;
        }
      }

      /* 标题 */
      .nav-title {
        font-size: 10px;
        color: #9ca3af;
        font-weight: 500;
        transition: all 0.3s ease;

        span {
          display: inline-block;
          transition: transform 0.3s ease;
        }
      }

      /* 未读消息徽章 */
      .message-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
        border-radius: 9px;
        border: 2px solid #fff;
        box-shadow: 0 2px 8px rgba(238, 90, 111, 0.4);
        z-index: 3;

        span {
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
        }

        /* 脉动效果 */
        .badge-ping {
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: inherit;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          opacity: 0.75;
        }
      }
    }

    /* 激活状态 */
    &.active {
      .content-wrapper {
        .icon-glow {
          opacity: 1;
          transform: scale(1.1);
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .icon-text-group {
          transform: scale(1.05);
          animation: icon-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .icon-svg {
          color: #667eea;
        }

        .nav-title {
          color: #667eea;
          font-weight: 600;

          span {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        }
      }
    }

    /* 点击反馈 */
    &:active {
      .content-wrapper {
        transform: scale(0.95);
      }
    }
  }

  /* 徽章弹出动画 */
  .badge-pop-enter-active,
  .badge-pop-leave-active {
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .badge-pop-enter-from,
  .badge-pop-leave-to {
    opacity: 0;
    transform: scale(0);
  }

  /* 动画定义 */
  @keyframes ripple-effect {
    0% {
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      width: 48px;
      height: 48px;
      opacity: 0;
    }
  }

  @keyframes icon-bounce {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    25% {
      transform: translateY(-8px) scale(1.15);
    }
    50% {
      transform: translateY(-4px) scale(1.05);
    }
    75% {
      transform: translateY(-6px) scale(1.1);
    }
  }

  @keyframes pulse-glow {
    0%,
    100% {
      transform: scale(1.2);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.4);
      opacity: 0.4;
    }
  }

  @keyframes ping {
    75%,
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  /* 悬停效果 (PC端) */
  @media (hover: hover) {
    .nav-item:hover:not(.active) {
      .content-wrapper {
        .icon-text-group {
          transform: scale(1.05);
        }

        .icon-svg {
          color: #667eea;
        }

        .nav-title {
          color: #667eea;
        }
      }
    }
  }

  /* 深色模式适配 */
  @media (prefers-color-scheme: dark) {
    &::before {
      background: rgba(30, 30, 30, 0.8);
    }
  }
}
</style>
