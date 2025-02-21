// counter.js
import { defineStore } from "pinia";

// store 是用 defineStore 定义的
// 第一个参数是独一无二的，是Store的唯一ID【必传】
// 第二个参数可接受 Setup函数 或 Option对象
// Options🌰：
export const useCounterStore = defineStore("counter", {
  state: () => ({
    tabbarIndex: 0, // tabbar的图标索引
  }),
  getters: {
    // double: (state) => state.count * 2,
  },
  actions: {
    // increment() {
    //   this.count++;
    // },
  },
});
// Setup🌰：
// import { ref, computed } from "vue";
// export const useCounterStore = defineStore("counter", () => {
//   const count = ref(0);
//   const doubleCount = computed(() => count.value * 2);
//   function increment() {
//     count.value++;
//   }

//   return { count, doubleCount, increment };
// });
