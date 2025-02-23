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
  {
    path: "/login",
    component: () => import("@/views/Login.vue"),
    name: "Login",
  },
  {
    path: "/register",
    component: () => import("@/views/Register.vue"),
    name: "Register",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

// 模拟一个检查用户是否登录的方法
function isLoggedIn() {
  // 这里可以根据实际情况检查用户是否登录
  // 例如检查本地存储中的token或调用API验证
  return !!localStorage.getItem("userToken");
  // return true;
}

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // to: 即将进入的目标路由对象
  // from: 当前导航正要离开的路由
  // next: 必须调用此方法来resolve这个钩子

  if (to.path !== "/login" && to.path !== "/register" && !isLoggedIn()) {
    next("/login"); // 如果用户没有登录，跳转到登录页面
  } else {
    next(); // 放行，继续导航
  }
});

export default router;
