<template>
  <div class="Login">
    <!-- 顶部背景 -->
    <div class="lg_bg">
      <img src="../assets/icons/lg_bg.svg" alt="" />
    </div>
    <!-- 登陆注册切换按钮 -->
    <div class="lg_change">
      <div class="lg_change_btn" :class="{ lg_change_active: isLoginActive }" @click="isLoginActive = true">登陆</div>
      <div class="lg_change_btn" :class="{ lg_change_active: !isLoginActive }" @click="isLoginActive = false">注册</div>
    </div>
    <!-- 登录输入框 -->
    <div v-if="isLoginActive" class="lg_form">
      <input type="text" placeholder="请输入账号" @focus="handleFocus" @blur="handleBlur" />
      <input type="password" placeholder="请输入密码" @focus="handleFocus" @blur="handleBlur" />
      <button class="lg_btn">
        <img src="../assets/icons/youjiantou.svg" alt="" />
      </button>
    </div>
    <!-- 注册输入框 -->
    <div v-else class="lg_form lg_reg">
      <input type="text" placeholder="请输入账号" @focus="handleFocus" @blur="handleBlur" />
      <input type="password" placeholder="请输入密码" @focus="handleFocus" @blur="handleBlur" />
      <input type="password" placeholder="请再次输入密码" @focus="handleFocus" @blur="handleBlur" />
      <button class="reg_btn">注册账号</button>
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
import { ref } from "vue";

const isLoginActive = ref(true); // 登陆注册切换
const showSpeedLogin = ref(true); // 快捷登录方式

// 失焦和聚焦事件
const handleFocus = () => {
  showSpeedLogin.value = false;
};
//  失焦和聚焦事件
const handleBlur = () => {
  showSpeedLogin.value = true;
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

  .lg_speed {
    position: absolute;
    bottom: 6.4vw;
    display: flex;
    justify-content: space-evenly;
    width: 100%;
    height: 11.7333vw;
    box-sizing: border-box;
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
      width: 22.6667vw;
      height: 21.3333vw;
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
