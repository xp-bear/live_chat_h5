<template>我是首页 home-</template>

<script setup>
import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";

// 可以在组件中的任意位置访问 `store` 变量 ✨
const store = useCounterStore();
// store不能直接解构，会破坏响应性，需要使用storeToRefs()
// const { count, double } = storeToRefs(store);
// const { increment } = store;
</script>

<style></style>
