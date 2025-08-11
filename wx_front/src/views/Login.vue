<template>
  <div class="Login">
    <!-- 顶部背景 -->
    <div class="lg_bg">
      <img src="../assets/imgs/logo.png" alt="" />
    </div>
    <!-- 登陆注册切换按钮 -->
    <div class="lg_change">
      <div class="lg_change_btn" :class="{ lg_change_active: isLoginActive }" @click="isLoginActive = true">登陆</div>
      <div class="lg_change_btn" :class="{ lg_change_active: !isLoginActive }" @click="isLoginActive = false">注册</div>
    </div>
    <!-- 登录输入框 -->
    <div v-if="isLoginActive" class="lg_form">
      <input type="text" v-model="username" placeholder="请输入账号" @focus="handleFocus" @blur="handleBlur" />
      <input type="password" v-model="password" placeholder="请输入密码" @focus="handleFocus" @blur="handleBlur" />
      <!-- 每间隔3s 再次进行动画 -->
      <button class="lg_btn animate__animated" @click="submitLogin">
        <img src="../assets/icons/youjiantou.svg" alt="" />
      </button>
    </div>
    <!-- 注册输入框 -->
    <div v-else class="lg_form lg_reg">
      <input type="text" v-model="username" placeholder="请设置用户名" @focus="handleFocus" @blur="handleBlur" />
      <input type="password" v-model="password" placeholder="请设置密码" @focus="handleFocus" @blur="handleBlur" />
      <input type="password" v-model="confirmPassword" placeholder="请再次确认密码" @focus="handleFocus" @blur="handleBlur" />
      <button class="reg_btn" @click="submitRgister">注册账号</button>
    </div>
    <!-- 快捷登录方式 -->
    <div v-if="showSpeedLogin" class="lg_speed">
      <div class="lg_speed_item"><img src="../assets/icons/zhifubao.svg" alt="" /></div>
      <div class="lg_speed_item"><img src="../assets/icons/qq.svg" alt="" /></div>
      <div class="lg_speed_item"><img src="../assets/icons/wx.svg" alt="" /></div>
      <div class="lg_speed_item"><img src="../assets/icons/weibo.svg" alt="" /></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { createUser, loginUser } from "../api/allApi"; //  引入创建用户的API
import { showToast } from "@nutui/nutui";
// 引入路由
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
// 引入 Pinia store
import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";
const store = useCounterStore(); // 可以在组件中的任意位置访问 `store` 变量 ✨
const { userInfo } = storeToRefs(store); // 使用 storeToRefs 解构 store 中的响应式属性

// Animate.css 使用
import "animate.css"; // 引入 Animate.css

const isLoginActive = ref(true); // 登陆注册切换
const showSpeedLogin = ref(true); // 快捷登录方式
let timer = ref(null); // 登录按钮3s播放动画定时器

// 登录与注册输入框v-model绑定
const username = ref(""); // 用户名
const password = ref(""); // 密码
const confirmPassword = ref(""); // 注册时确认密码

onMounted(() => {
  // 页面加载时，设置定时器每3秒切换一次动画
  timer.value = setInterval(() => {
    let lg_btn = document.querySelector(".lg_btn");
    if (lg_btn) {
      // 添加动画效果
      lg_btn.style = "transition all 0.3s ease-in-out;";

      lg_btn.classList.add("animate__tada");
      setTimeout(() => {
        lg_btn.classList.remove("animate__tada");
      }, 1000);
    }
  }, 3000); // 每3秒切换一次
});

onUnmounted(() => {
  // 在组件卸载时清除定时器
  if (timer.value) {
    clearInterval(timer.value);
  }
});
// 失焦和聚焦事件
const handleFocus = () => {
  showSpeedLogin.value = false;
};
//  失焦和聚焦事件
const handleBlur = () => {
  showSpeedLogin.value = true;
};
// 点击注册按钮 // submitRgister
const submitRgister = () => {
  // 用户名不少于2位
  if (username.value.trim() === "") {
    return showToast.warn("用户名不能为空");
  }
  if (password.value.length < 6) {
    return showToast.warn("密码长度不能小于6位");
  }
  if (password.value !== confirmPassword.value) {
    return showToast.warn("两次输入的密码不一致，请重新输入");
  }
  // 调用创建用户的API
  createUser({ u_name: username.value, u_password: password.value })
    .then((response) => {
      if (response.code === 400) {
        return showToast.fail(response.message);
      } else if (response.code === 200) {
        showToast.success("注册成功,请登录");
        setTimeout(() => {
          isLoginActive.value = true; // 切换到登录界面
          confirmPassword.value = ""; // 清空确认密码输入框
        }, 1000); // 延时1秒后执行
      } else {
        console.log("注册失败:", response.message);
        showToast.fail(response.message || "注册失败，请稍后再试");
      }
    })
    .catch((error) => {
      console.error("注册请求失败:", error);
      showToast.fail("注册请求失败，请稍后再试");
    });
};

// 点击登录按钮
const submitLogin = () => {
  // 用户名不能大于12位
  if (username.value.length > 20 || username.value.length < 2) {
    return showToast.warn("用户名长短不符合要求");
  }
  if (username.value.trim() === "") {
    return showToast.warn("用户名不能为空");
  }
  if (password.value.length < 6) {
    return showToast.warn("密码长度不能小于6位");
  }
  // 调用登录用户的API
  loginUser({ u_name: username.value, u_password: password.value })
    .then((response) => {
      if (response.code === 400) {
        return showToast.fail(response.message);
      } else if (response.code === 200) {
        showToast.success("登录成功");
        //保存登录信息到localStorage
        // localStorage.setItem("userInfo", JSON.stringify(response.data));
        store.setUserInfo(response.data); // 更新 Pinia store 中的用户信息

        setTimeout(() => {
          router.push("/chat"); // 假设登录成功后跳转到首页
          username.value = ""; // 清空用户名输入框
          password.value = ""; // 清空密码输入框
        }, 1000); // 延时1秒后执行
      } else {
        console.log("登录失败:", response.message);
        showToast.fail(response.message || "登录失败，请稍后再试");
      }
    })
    .catch((error) => {
      console.error("登录请求失败:", error);
      showToast.fail("登录请求失败，请稍后再试");
    });
};
</script>

<style lang="scss" scoped>
.Login {
  position: fixed;
  width: 100%;
  height: 100vh;
  bottom: 0;
  background-color: #fff;
  z-index: 889;
  font-family: "pingfang";

  /* background: url("../assets/imgs/bg.gif") no-repeat center center; */
  background-size: cover;

  background-color: #fff;
  .lg_speed {
    position: absolute;
    bottom: 6.4vw;
    display: flex;
    justify-content: space-evenly;
    width: 100%;
    height: 11.7333vw;
    box-sizing: border-box;
    background-color: #fff;
    .lg_speed_item {
      width: 19.2vw;
      height: 11.7333vw;
      box-sizing: border-box;
      border: 1px solid rgba(242, 242, 242, 1);
      border-radius: 2.1333vw;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 5.8667vw;
        height: 5.8667vw;
      }
    }
  }
  .lg_form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 16vw;
    input {
      width: 89.3333vw;
      height: 13.8667vw;
      border-radius: 8vw;
      background: rgba(242, 242, 242, 1);
      border: 0;
      margin-bottom: 4.2667vw;
      box-sizing: border-box;
      padding: 4vw;
      text-align: center;
      &::placeholder {
        color: rgba(185, 185, 193, 1);
        font-size: 4vw;
        font-weight: 400;
        letter-spacing: 0px;
        line-height: 4.688vw;
        color: rgba(185, 185, 193, 1);
        text-align: center;
        vertical-align: top;
      }
      &:nth-child(2) {
        margin-bottom: 16vw;
      }
    }
    .lg_btn {
      width: 21.3333vw;
      height: 21.3333vw;
      border-radius: 10.6667vw;
      background: linear-gradient(135deg, rgba(255, 51, 255, 1) 0%, rgba(28, 85, 255, 1) 100%);
      border: 0;
      box-shadow: 0 0 0.8vw rgba(0, 0, 0, 0.3);

      img {
        width: 8.5333vw;
        height: 6.6667vw;
      }
    }
  }
  .lg_bg {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48.8vw;
    img {
      width: 80%;
      /* height: 21.3333vw; */
    }
  }
  .lg_change {
    width: 76.5333vw;
    height: 10.6667vw;
    background-color: #f2f2f2;
    border-radius: 5.3333vw;
    margin: 0 auto;
    padding: 1.0667vw;
    box-sizing: border-box;
    display: flex;
    // margin-bottom: 16vw;
    .lg_change_btn {
      flex: 1;
      text-align: center;
      line-height: 8.5333vw;
      font-size: 4.2667vw;
      color: rgba(187, 187, 196, 1);
      border-radius: 5.3333vw;
    }
    .lg_change_active {
      color: rgba(2, 46, 87, 1);
      background-color: #fff;
    }
  }
  .lg_reg {
    margin-top: 4.2667vw;
    .reg_btn {
      width: 89.3333vw;
      height: 13.8667vw;
      opacity: 1;
      border-radius: 2.1333vw;
      background: linear-gradient(135deg, rgba(255, 51, 255, 1) 0%, rgba(28, 85, 255, 1) 100%);
      border: 0;
      box-sizing: border-box;
      font-size: 4.5333vw;
      font-weight: 400;
      line-height: 5.312vw;
      color: rgba(255, 255, 255, 1);
      text-align: center;
      vertical-align: top;
    }
    input {
      &:nth-child(2) {
        margin-bottom: 4.2667vw;
      }
    }
  }
}
</style>
