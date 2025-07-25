// src/stores/counter.js
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", {
  state: () => ({
    tabbarIndex: 0, // tabbar的索引
    userInfo: null, // 用户信息登录的对象 {}
  }),
  getters: {},
  actions: {
    // 保存userInfo到localStorage
    setUserInfo(userInfo) {
      this.userInfo = userInfo; // 更新 store 中的用户信息
      localStorage.setItem("userInfo", JSON.stringify(userInfo)); // 同步到 localStorage
    },
    // 从 localStorage 初始化用户信息
    initUserInfo() {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        this.userInfo = JSON.parse(userInfo); // 从 localStorage 中获取用户信息并解析
      } else {
        this.userInfo = null; // 如果没有用户信息，则设置为 null
      }
    },
  },
});
