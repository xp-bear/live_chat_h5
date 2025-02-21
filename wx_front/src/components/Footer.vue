<template>
  <nut-tabbar @tab-switch="tabSwitch" v-model="active" bottom safe-area-inset-bottom placeholder active-color="#3f51b5" unactive-color="#b3b3b3">
    <nut-tabbar-item v-for="(item, index) in List" :key="index" :tab-title="item.title" :icon="item.icon" :to="item.to"> </nut-tabbar-item>
  </nut-tabbar>
</template>
<script setup>
import { h, ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Home, Message, Find, Footprint, My } from "@nutui/icons-vue";

import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";
const store = useCounterStore();
const { tabbarIndex } = storeToRefs(store);
const router = useRouter();
const route = useRoute();

const List = [
  {
    title: "首页",
    icon: h(Home),
    to: "/home",
  },
  {
    title: "聊天",
    icon: h(Message),
    to: "/chat",
  },
  {
    title: "动态",
    icon: h(Find),
    to: "/dynamic",
  },
  {
    title: "联系人",
    icon: h(My),
    to: "/linkman",
  },
  {
    title: "短视频",
    icon: h(Footprint),
    to: "/shortvideo",
  },
];
const active = ref(null);

// 监听tab切换事件
const tabSwitch = (item, index) => {
  console.log(item, index);
};

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/home") {
      tabbarIndex.value = 0;
    } else if (newPath === "/chat") {
      tabbarIndex.value = 1;
    } else if (newPath === "/dynamic") {
      tabbarIndex.value = 2;
    } else if (newPath === "/linkman") {
      tabbarIndex.value = 3;
    } else if (newPath === "/shortvideo") {
      tabbarIndex.value = 4;
    }
    active.value = tabbarIndex.value;
  },
  { immediate: true }
);

onMounted(() => {});
</script>
<style lang="scss"></style>
