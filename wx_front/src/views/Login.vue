<template>
  <div class="login-page">
    <!-- 动态背景球 -->
    <div class="bg-blobs" aria-hidden="true">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
      <div class="blob b3"></div>
    </div>

    <section :class="['card', 'animate__animated', 'animate__fadeInUp', { 'card--focused': isInputFocused }]">
      <div class="card-top">
        <img src="../assets/imgs/logo.png" alt="logo" class="logo" />
        <div class="switcher" role="tablist" aria-label="登录或注册切换">
          <button :class="['tab', { active: isLoginActive }]" @pointerdown="switchTab(true)" @click.prevent="isLoginActive = true">登录</button>
          <button :class="['tab', { active: !isLoginActive }]" @pointerdown="switchTab(false)" @click.prevent="isLoginActive = false">注册</button>
          <div class="slider" :class="{ 'to-right': !isLoginActive }"></div>
        </div>
      </div>

      <transition name="fade" mode="out-in">
        <form class="form" key="login" v-if="isLoginActive" @submit.prevent="submitLogin">
          <div class="field">
            <span class="icon"><img src="../assets/icons/user.svg" alt="user" /></span>
            <input ref="loginUsernameRef" v-model="username" type="text" placeholder="用户名/手机号" @focus="handleFocus" @blur="handleBlur" />
          </div>

          <div class="field">
            <span class="icon"><img src="../assets/icons/password.svg" alt="pass" /></span>
            <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="请输入密码" @focus="handleFocus" @blur="handleBlur" />
            <button type="button" class="eye" @click="toggleShowPassword" :aria-pressed="String(showPassword)" aria-label="切换密码显示">
              <span class="sr-only">切换密码显示</span>
              <svg v-if="!showPassword" class="eye-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 11a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" fill="#1897f1" />
              </svg>
              <svg v-else class="eye-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 3l18 18" stroke="#1897f1" stroke-width="2" fill="none" /></svg>
            </button>
          </div>

          <div class="actions">
            <button class="primary-btn" :class="{ pulse: btnPulse }" type="submit">
              <span>登录</span>
              <img src="../assets/icons/youjiantou_black.svg" alt="go" />
            </button>
          </div>

          <div class="social" v-show="showSpeedLogin" aria-hidden="!showSpeedLogin">
            <div class="social-item"><img src="../assets/icons/wx.svg" alt="wx" /></div>
            <div class="social-item"><img src="../assets/icons/qq.svg" alt="qq" /></div>
            <div class="social-item"><img src="../assets/icons/weibo.svg" alt="weibo" /></div>
          </div>
        </form>

        <form class="form" key="register" v-else @submit.prevent="submitRegister">
          <div class="field">
            <span class="icon"><img src="../assets/icons/user.svg" alt="user" /></span>
            <input ref="regUsernameRef" v-model="username" type="text" placeholder="设置用户名" @focus="handleFocus" @blur="handleBlur" />
          </div>

          <div class="field">
            <span class="icon"><img src="../assets/icons/password.svg" alt="pass" /></span>
            <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="设置密码" @focus="handleFocus" @blur="handleBlur" />
            <button type="button" class="eye" @click="toggleShowPassword" :aria-pressed="String(showPassword)" aria-label="切换密码显示">
              <span class="sr-only">切换密码显示</span>
              <svg v-if="!showPassword" class="eye-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 11a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" fill="#1897f1" />
              </svg>
              <svg v-else class="eye-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 3l18 18" stroke="#1897f1" stroke-width="2" fill="none" /></svg>
            </button>
          </div>

          <div class="field">
            <span class="icon"><img src="../assets/icons/confirm_password.svg" alt="pass" @error="handleIconError" /></span>
            <input :type="showPassword ? 'text' : 'password'" v-model="confirmPassword" placeholder="确认密码" @focus="handleFocus" @blur="handleBlur" />
          </div>

          <div class="actions">
            <button class="primary-btn" type="submit">注册</button>
          </div>
        </form>
      </transition>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { createUser, loginUser } from "../api/allApi";
import { showToast } from "@nutui/nutui";
import { useRouter } from "vue-router";
import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";
import "animate.css";
import iconVoice from "../assets/icons/password.svg";
import iconFile from "../assets/icons/password.svg";
import iconFallback from "../assets/icons/youjiantou.svg";

const router = useRouter();
const store = useCounterStore();
const { userInfo } = storeToRefs(store);

const isLoginActive = ref(true);
const showSpeedLogin = ref(true);
const btnPulse = ref(false); // 控制按钮脉动
let pulseTimer = null;
let prevHtmlOverflow = "";
let prevBodyOverflow = "";
const preventTouchMove = (e) => {
  e.preventDefault();
};

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);

onMounted(() => {
  // 定时脉动效果（替代直接操作 DOM）
  pulseTimer = setInterval(() => {
    btnPulse.value = true;
    setTimeout(() => (btnPulse.value = false), 900);
  }, 3500);

  // 页面级滚动锁定（H5 登录/注册页面不允许上下滚动）
  prevHtmlOverflow = document.documentElement.style.overflow;
  prevBodyOverflow = document.body.style.overflow;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  // 阻止 touchmove 防止 iOS 橡皮筋回弹滚动
  document.addEventListener("touchmove", preventTouchMove, { passive: false });
});
onUnmounted(() => {
  if (pulseTimer) clearInterval(pulseTimer);

  // 恢复之前的滚动设置
  document.documentElement.style.overflow = prevHtmlOverflow || "";
  document.body.style.overflow = prevBodyOverflow || "";
  document.removeEventListener("touchmove", preventTouchMove);
});

const isInputFocused = ref(false);
const loginUsernameRef = ref(null);
const regUsernameRef = ref(null);
const handleFocus = () => {
  showSpeedLogin.value = false;
  isInputFocused.value = true;
};
const handleBlur = () => {
  showSpeedLogin.value = true;
  // 延迟取消焦点，避免快速切换时页面闪动
  setTimeout(() => (isInputFocused.value = false), 120);
};
const toggleShowPassword = () => (showPassword.value = !showPassword.value);

import { nextTick } from "vue";

/**
 * 切换选项卡：使用 pointerdown 触发，保证在键盘弹起时也能一次切换
 * toLogin: true 切到登录，false 切到注册
 */
const switchTab = (toLogin) => {
  isLoginActive.value = toLogin;
  // 在 nextTick 中聚焦对应输入框，保持交互连贯性（尽量保留软键盘）
  nextTick(() => {
    const refEl = toLogin ? loginUsernameRef.value : regUsernameRef.value;
    if (refEl && typeof refEl.focus === "function") {
      // 延迟微小时间以提高在移动端聚焦的稳定性
      setTimeout(() => refEl.focus(), 50);
    } else {
      // 如果找不到对应元素，确保当前激活的元素失焦
      if (document.activeElement && document.activeElement instanceof HTMLElement) document.activeElement.blur();
    }
  });
};
const handleIconError = (e) => {
  // 优雅回退到备用图标，避免展示破图（alt 文本）
  try {
    e.target.src = iconFallback;
  } catch (err) {
    /* ignore */
  }
};

const submitRegister = async () => {
  if (username.value.trim() === "") return showToast.warn("用户名不能为空");
  if (password.value.length < 6) return showToast.warn("密码长度不能小于6位");
  if (password.value !== confirmPassword.value) return showToast.warn("两次输入的密码不一致");
  try {
    const res = await createUser({ u_name: username.value, u_password: password.value });
    if (res.code === 200) {
      showToast.success("注册成功，请登录");
      setTimeout(() => (isLoginActive.value = true), 800);
      confirmPassword.value = "";
    } else {
      showToast.fail(res.message || "注册失败");
    }
  } catch (err) {
    showToast.fail("注册请求失败");
  }
};

const submitLogin = async () => {
  if (username.value.length > 20 || username.value.length < 2) return showToast.warn("用户名长短不符合要求");
  if (username.value.trim() === "") return showToast.warn("用户名不能为空");
  if (password.value.length < 6) return showToast.warn("密码长度不能小于6位");
  try {
    const res = await loginUser({ u_name: username.value, u_password: password.value });
    if (res.code === 200) {
      showToast.success("登录成功");
      store.setUserInfo(res.data);
      setTimeout(() => {
        router.push("/chat");
        username.value = "";
        password.value = "";
      }, 800);
    } else {
      showToast.fail(res.message || "登录失败");
    }
  } catch (err) {
    showToast.fail("登录请求失败");
  }
};
</script>

<style lang="scss" scoped>
:root {
  --primary-gradient: linear-gradient(135deg, #ff33ff 0%, #1c55ff 100%);
  --bg: #f7fbff;
  --card: #ffffff;
  --muted: #b9b9c1;
}

.login-page {
  min-height: 100vh;
  max-width: 100vw; /* prevent content from growing wider than viewport */
  padding-top: env(safe-area-inset-top, 12px);
  padding-bottom: env(safe-area-inset-bottom, 12px);
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  box-sizing: border-box;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "pingfang";
  overflow: hidden; /* disable all scrolling for login/register H5 page */
}

.bg-blobs {
  position: absolute;
  width: 100vw; /* ensure it never exceeds viewport */
  height: 100%;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
  overflow: hidden; /* clip child blobs so they don't cause horizontal scroll */
  pointer-events: none;
  .blob {
    position: absolute;
    border-radius: 50%;
    /* blur: converted from px to vw for consistent scaling on mobile (40px -> 10.6667vw) */
    filter: blur(10.6667vw);
    opacity: 0.8;
    transform: translate3d(0, 0, 0);
    &.b1 {
      width: 40vw;
      height: 40vw;
      left: -10vw;
      top: -8vw;
      background: rgba(145, 85, 255, 0.2);
      animation: float 8s ease-in-out infinite;
    }
    &.b2 {
      width: 28vw;
      height: 28vw;
      right: -6vw;
      top: -6vw;
      background: rgba(28, 85, 255, 0.14);
      animation: float 10s ease-in-out infinite reverse;
    }
    &.b3 {
      width: 30vw;
      height: 30vw;
      left: 10vw;
      bottom: -10vw;
      background: rgba(255, 51, 255, 0.12);
      animation: float 12s ease-in-out infinite;
    }
  }
}

@keyframes float {
  0% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-6vh) scale(1.03);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

.card {
  position: relative;
  z-index: 2;
  width: min(92vw, 117.3333vw); /* 440px -> 117.3333vw */
  background: var(--card);
  border-radius: 4.2667vw; /* 16px -> 4.2667vw */
  box-shadow: 0 2.6667vw 8vw rgba(20, 40, 80, 0.08); /* 10px -> 2.6667vw, 30px -> 8vw */
  padding: 5.3333vw; /* 20px -> 5.3333vw */
}
.card--focused {
  transform: translateY(-12vh);
  transition: transform 220ms ease;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .logo {
    width: 34.6667vw; /* 72px -> 19.2vw */
    height: auto;
  }
  .switcher {
    position: relative;
    display: flex;
    background: #f2f5ff;
    border-radius: 6.4vw; /* 24px -> 6.4vw */
    padding: 1.6vw; /* 6px -> 1.6vw */
    overflow: hidden; /* keep slider inside */
    .tab {
      background: transparent;
      border: 0;
      padding: 1.6vw 3.7333vw; /* 6px 14px -> 1.6vw 3.7333vw */
      border-radius: 4.8vw; /* 18px -> 4.8vw */
      color: #000; /* 改为黑色字体 */
      font-size: 3.7333vw; /* 14px -> 3.7333vw */
      cursor: pointer;
      z-index: 2;
      -webkit-tap-highlight-color: transparent;
    }
    .tab.active {
      color: #000; /* 活动项也为黑色 */
      font-weight: 700;
    }
    .slider {
      position: absolute;
      top: 1.6vw; /* 6px -> 1.6vw */
      left: 1.6vw; /* 6px -> 1.6vw */
      width: calc(50% - 1.6vw); /* 6px -> 1.6vw */
      height: calc(100% - 3.2vw); /* 12px -> 3.2vw */
      background: linear-gradient(180deg, rgba(246, 248, 255, 1), rgba(255, 255, 255, 0.98));
      border: 1px solid rgba(235, 239, 255, 1);
      border-radius: 4.2667vw; /* 16px -> 4.2667vw */
      box-shadow: 0 1.6vw 3.2vw rgba(32, 65, 128, 0.04); /* 6px -> 1.6vw, 12px -> 3.2vw */
      transition: transform 240ms cubic-bezier(0.2, 0.9, 0.2, 1);
      transform-origin: left center;
    }
    .slider.to-right {
      transform: translateX(100%); /* move exactly one slider width */
    }
  }
}

.form {
  margin-top: 4.8vw; /* 18px -> 4.8vw */
  display: flex;
  flex-direction: column;
  gap: 3.2vw; /* 12px -> 3.2vw */
}

.field {
  position: relative;
  display: flex;
  align-items: center;
  background: #f6f8ff;
  border-radius: 3.2vw; /* 12px -> 3.2vw */
  padding: 2.6667vw 3.2vw; /* 10px 12px -> 2.6667vw 3.2vw */
  gap: 2.1333vw; /* 8px -> 2.1333vw */
  .icon {
    width: 8vw; /* 30px -> 8vw */
    min-width: 8vw;
    height: 8vw;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    img {
      width: 5.3333vw; /* 20px -> 5.3333vw */
      height: 5.3333vw; /* 20px -> 5.3333vw */
      display: block;
      object-fit: contain;
      opacity: 0.9;
    }
  }
  input {
    flex: 1;
    border: 0;
    background: transparent;
    outline: none;
    font-size: 4.2667vw; /* 16px -> 4.2667vw */
    color: #06203a;
    /* 增加右侧内边距，确保切换按钮不会被输入内容覆盖或挤出视图 */
    padding: 2.6667vw 14.6667vw 2.6667vw 0; /* 10px -> 2.6667vw, right padding ~55px -> 14.6667vw */
    -webkit-tap-highlight-color: transparent;
  }
  .eye {
    position: absolute;
    right: 4.8vw;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: 0;
    width: 8.5333vw; /* ~40px */
    height: 8.5333vw;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
    cursor: pointer;
    .eye-icon {
      width: 8.5333vw; /* ~32px */
      height: 8.5333vw;
      display: block;
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }
  }
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 1.6vw; /* 6px -> 1.6vw */
  .primary-btn {
    display: inline-flex;
    align-items: center;
    gap: 2.1333vw; /* 8px -> 2.1333vw */
    padding: 3.2vw 5.8667vw; /* 12px 22px -> 3.2vw 5.8667vw */
    min-height: 12.8vw; /* 48px -> 12.8vw */
    border-radius: 6.4vw; /* 24px -> 6.4vw */
    border: 0;
    color: #000;
    background: var(--primary-gradient);
    box-shadow: 0 2.1333vw 5.8667vw rgba(28, 85, 255, 0.18); /* 8px -> 2.1333vw, 22px -> 5.8667vw */
    font-weight: 600;
    cursor: pointer;
    img {
      width: 5.3333vw; /* 20px -> 5.3333vw */
    }
    transition: transform 160ms ease, box-shadow 160ms ease;
    -webkit-tap-highlight-color: transparent;
    &.pulse {
      animation: pulse 0.9s ease-in-out;
    }
    &:active {
      transform: translateY(0.2667vw); /* 1px -> 0.2667vw */
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.social {
  display: flex;
  justify-content: center;
  gap: 3.2vw; /* 12px -> 3.2vw */
  margin-top: 3.2vw; /* 12px -> 3.2vw */
  .social-item {
    width: 12vw;
    height: 12vw;
    min-width: 11.7333vw; /* 44px -> 11.7333vw */
    min-height: 11.7333vw;
    background: #fff;
    border-radius: 2.6667vw; /* 10px -> 2.6667vw */
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1.6vw 4.8vw rgba(10, 20, 40, 0.04); /* 6px -> 1.6vw, 18px -> 4.8vw */
    img {
      width: 5.8667vw; /* 22px -> 5.8667vw */
    }
  }
}

/* transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 240ms ease, transform 240ms ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(2.1333vw);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(2.1333vw);
}

@media (max-width: 420px) {
  .card {
    padding: 16px;
  }
  .card-top .logo {
    width: 34.6667vw;
  }
}
</style>
