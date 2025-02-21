<template id="app">
  <!-- 路由占位符 -->
  <router-view></router-view>
  <!-- tabbar自定义组件 -->
  <Footer></Footer>
</template>
<script setup>
import Footer from "@/components/Footer.vue";
</script>

<style lang="scss">
#app {
  font-family: "pingfang";
}
</style>
