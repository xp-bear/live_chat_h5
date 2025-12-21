<template id="app">
  <!-- 路由占位符 -->
  <router-view></router-view>
  <!-- tabbar自定义组件 -->
  <Footer></Footer>
</template>
<script setup>
import { onMounted } from "vue";
import Footer from "@/components/Footer.vue";
import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";
const store = useCounterStore(); // 可以在组件中的任意位置访问 `store` 变量 ✨
const { userInfo } = storeToRefs(store); // 使用 storeToRefs 解构 store 中的响应式属性

onMounted(() => {
  // piana store 中的 userInfo 可能在页面加载时未定义，确保它已被正确初始化
  if (!userInfo.value) {
    store.initUserInfo(); // 调用 Pinia store 的方法来初始化用户信息
  }
});
</script>

<style lang="scss">
:root {
  --primary-gradient: linear-gradient(135deg, #ff33ff 0%, #1c55ff 100%);
  --primary-color-start: #ff33ff;
  --primary-color-end: #1c55ff;
  --primary-color: #1c55ff;
  --muted: #f5f7fb;
}

#app {
  font-family: "pingfang";
  font-size: 4.2667vw;
  max-width: 750px;
  margin: 0 auto;
  background: var(--muted);
  min-height: 100vh;
  overflow-x: hidden;
}

/* 防止body水平滚动 */
body {
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

/* 确保所有元素使用border-box */
* {
  box-sizing: border-box;
}

/* 电脑端适配：固定手机屏幕宽度375px，居中显示 */
@media (min-width: 768px) {
  html,
  body {
    height: 100%;
    overflow-x: hidden;
  }

  body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  #app {
    width: 375px;
    max-width: 375px;
    min-width: 375px;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.3);
    position: relative;
    margin: 0;
  }
}
</style>
