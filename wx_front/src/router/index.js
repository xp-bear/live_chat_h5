import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";

import { createRouter, createWebHistory } from "vue-router";
const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    component: () => import("@/views/Home.vue"),
    name: "Home",
  },
  {
    path: "/chat",
    component: () => import("@/views/Chat.vue"),
    name: "Chat",
  },
  {
    path: "/dynamic",
    component: () => import("@/views/Dynamic.vue"),
    name: "Dynamic",
  },
  {
    path: "/linkman",
    component: () => import("@/views/Linkman.vue"),
    name: "Linkman",
  },
  {
    path: "/shortvideo",
    component: () => import("@/views/ShortVideo.vue"),
    name: "ShortVideo",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

// 全局前置守卫
// router.beforeEach((to, from, next) => {
//   // to: 即将进入的目标路由对象
//   // from: 当前导航正要离开的路由
//   // next: 必须调用此方法来resolve这个钩子
//   const store = useCounterStore();
//   const { tabbarIndex } = storeToRefs(store);

//   if (to.path === "/home") {
//     tabbarIndex.value = 0;
//   } else if (to.path === "/chat") {
//     tabbarIndex.value = 1;
//   } else if (to.path === "/dynamic") {
//     tabbarIndex.value = 2;
//   } else if (to.path === "/linkman") {
//     tabbarIndex.value = 3;
//   } else if (to.path === "/shortvideo") {
//     tabbarIndex.value = 4;
//   }
//   next(); // 放行，继续导航
// });

export default router;
