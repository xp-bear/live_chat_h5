<template>
  <div class="Chat">
    <!-- 搜索框 -->
    <div class="search_all">
      <input class="search" placeholder="消息列表查询" />
      <img class="search_img" src="../assets/icons/fangdajing.svg" />
    </div>
    <!-- tab 标签页切换 -->
    <nut-tabs v-model="tabIndexValue" swipeable background="#ffffff" size="large">
      <nut-tab-pane title="全部群聊" pane-key="1">
        <!-- 列表展示 -->
        <div class="qunliao_list" @click="openCahtAllFn">
          <div class="qunliao_list_info">
            <img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/cookies/头像.png?1737703342307" alt="" />
            <div class="qunliao_list_info_txt">
              <span>小潘</span>
              <span>今天 • 10:30</span>
            </div>
          </div>
          <div class="qunliao_list_message">2</div>
        </div>
      </nut-tab-pane>
      <nut-tab-pane title="个人单聊" pane-key="2"> Content 2 </nut-tab-pane>
    </nut-tabs>
    <!-- 群聊弹出层 -->
    <nut-popup v-model:visible="chatAllPopupState" position="right" :style="{ width: '100%', height: '100%' }">
      <div class="chat_all_top">
        <div class="chat_all_top_txt">
          <RectLeft @click="closeChatAllPopup" width="4.8vw" height="4.8vw" />
          <img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/cookies/头像.png?1737703342307" alt="" />
          <div class="chat_all_top_state">
            <span>小潘</span>
            <span><i class="chat_all_top_dot"></i>在线</span>
          </div>
        </div>
        <MoreX width="4.8vw" height="4.8vw" />
      </div>
    </nut-popup>
  </div>
</template>

<script setup>
import { MoreX, RectLeft } from "@nutui/icons-vue";
import { ref } from "vue";
const tabIndexValue = ref("1"); // tab 标签页切换索引
const chatAllPopupState = ref(true); // 群聊弹出层

// 函数 打开群聊弹出层
function openCahtAllFn() {
  chatAllPopupState.value = true;
}
// 函数 关闭群聊弹出层
function closeChatAllPopup() {
  chatAllPopupState.value = false;
}
</script>

<style lang="scss" scoped>
.Chat {
  .chat_all_top {
    padding: 2.6667vw 6.4vw;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 14.9333vw;
    .chat_all_top_txt {
      display: flex;
      align-items: center;
    }
    img {
      width: 8.5333vw;
      height: 8.5333vw;
      border-radius: 50%;
      margin-left: 4.2667vw;
      margin-right: 2.1333vw;
    }
    .chat_all_top_state {
      display: flex;
      flex-direction: column;
      span {
        &:nth-child(1) {
          font-size: 4vw;
        }
        &:nth-child(2) {
          font-size: 3.2vw;
          color: rgba(70, 209, 145, 1);
          vertical-align: bottom;
        }
        .chat_all_top_dot {
          display: inline-block;
          width: 2.1333vw;
          height: 2.1333vw;
          background-color: rgba(70, 209, 145, 1);
          border-radius: 50%;
          margin-right: 1.0667vw;
        }
      }
    }
  }
  font-family: "pingfang";
  .search_all {
    position: relative;
    margin-top: 2.6667vw;
    .search {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      width: 90.1333vw;
      height: 10.9333vw;
      border-radius: 5.3333vw;
      border: 0.2667vw solid rgba(220, 220, 220, 1);
      background: rgba(255, 255, 255, 1);
      margin: 0 auto;
      outline: none;
      &::placeholder {
        color: rgba(153, 153, 153, 1);
        font-size: 3.7333vw;
      }
      padding-left: 12.8vw;
    }
    .search_img {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 5.3333vw;
      width: 4.4453vw;
      height: 4.4453vw;
      margin-right: 2.6667vw;
      margin-left: 5.3333vw;
    }
  }
  .qunliao_list {
    width: 87.2vw;
    height: 21.3333vw;
    opacity: 1;
    border-radius: 2.1333vw;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 0px 2.1333vw rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    .qunliao_list_info {
      display: flex;
      align-items: center;
      img {
        width: 12.8vw;
        height: 12.8vw;
        border-radius: 50%;
        margin-left: 4.2667vw;
        margin-right: 3.2vw;
      }
      .qunliao_list_info_txt {
        display: flex;
        flex-direction: column;
        span {
          &:nth-child(1) {
            font-size: 4.2667vw;
            font-weight: 400;
            color: #000;
            margin-bottom: 1.0667vw;
          }
          &:nth-child(2) {
            font-size: 3.2vw;
            font-weight: 400;
            letter-spacing: 0px;
            line-height: 4.2667vw;
            color: rgba(175, 175, 175, 1);
          }
        }
      }
    }
    .qunliao_list_message {
      width: 6.4vw;
      height: 6.4vw;
      border-radius: 50%;
      background-color: #3f51b5;
      text-align: center;
      color: #fff;
      font-size: 3.2vw;
      line-height: 6.4vw;
      margin-right: 4.2667vw;
    }
  }
}
</style>
