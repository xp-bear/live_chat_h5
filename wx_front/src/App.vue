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
#app {
  font-family: "pingfang";
  font-size: 4.2667vw;
  max-width: 750px;
}
</style>
