import { createRouter, createWebHistory } from "vue-router";
import { showToast } from "@nutui/nutui";
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
  {
    path: "/test",
    component: () => import("@/views/Test.vue"),
    name: "Test",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    // 始终滚动到顶部
    return { top: 0, behavior: "instant" };
  },
});

// 模拟一个检查用户是否登录的方法
function isLoggedIn() {
  // 这里可以根据实际情况检查用户是否登录
  // 例如检查本地存储中的token或调用API验证
  let userInfo = JSON.parse(localStorage.getItem("userInfo")); // 假设token存储在localStorage中
  let token = userInfo ? userInfo.u_token : null;

  if (token) {
    const now = Date.now();
    const tokenParts = token.split("_");
    const expirationTime = parseInt(tokenParts[1], 10);
    if (now < expirationTime) {
      return true; // 用户已登录
    } else {
      showToast.text("登录已过期，请重新登录");
      setTimeout(() => {
        localStorage.removeItem("userInfo"); // 清除过期的token
        return false; // 用户登录已过期
      }, 1000); // 延时1秒后执行
    }
  } else {
    return false; // 用户未登录
  }
}

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // to: 即将进入的目标路由对象
  // from: 当前导航正要离开的路由
  // next: 必须调用此方法来resolve这个钩子

  if (to.path !== "/test" && to.path !== "/login" && to.path !== "/register" && !isLoggedIn()) {
    next("/login"); // 如果用户没有登录，跳转到登录页面
  } else {
    next(); // 放行，继续导航
  }
});

export default router;
