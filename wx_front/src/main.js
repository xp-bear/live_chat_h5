import { createApp } from "vue";
import App from "./App.vue";

// 引入路由
import router from "./router";

// 引入公共样式
import "./common.css";

// 引入nutui 京东移动端组件库
import NutUI from "@nutui/nutui";
import "@nutui/nutui/dist/style.css";

// 引入pinia
import { createPinia } from "pinia";
const pinia = createPinia();

const app = createApp(App);
app.use(router);
app.use(NutUI);
app.use(pinia);
app.mount("#app");
