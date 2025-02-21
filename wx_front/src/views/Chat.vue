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
      <!-- 顶部栏 -->
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
      <!-- 内容区域 -->
      <div class="chat_all_content">
        <!-- 别人发消息 -->
        <div class="chat_all_content_info">
          <img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/cookies/头像.png?1737703342307" alt="" />
          <div class="chat_all_content_text">你好呀</div>
        </div>
        <!-- 我发消息 -->
        <div class="chat_all_content_my">
          <div class="chat_all_content_text_my">本自动换行。</div>
          <img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/cookies/头像.png?1737703342307" alt="" />
        </div>
      </div>
      <!-- 底部栏 -->
      <div class="chat_all_bottom" ref="chat_all_bottom">
        <!-- 发送消息 -->
        <div class="chat_all_bottom_list">
          <img @click="showMenuFn" src="../assets/icons/jia.svg" alt="" />
          <input type="text" placeholder="在此处键入" />
          <img src="../assets/icons/fasong.svg" alt="" />
        </div>
        <!-- 功能区域 -->
        <div class="chat_all_bottom_tool">
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/icons/lianxiren.svg" alt="" />
            <span>联系</span>
          </div>
        </div>
      </div>
    </nut-popup>
  </div>
</template>

<script setup>
import { MoreX, RectLeft } from "@nutui/icons-vue";
import { ref } from "vue";
const tabIndexValue = ref("1"); // tab 标签页切换索引
const chatAllPopupState = ref(true); // 群聊弹出层

const chat_all_bottom = ref(null); // 底部栏ref

// 函数 显示菜单
function showMenuFn() {
  console.log(chat_all_bottom.value);
  // 向上移动200px
  chat_all_bottom.value.style.transform = "translateY(-26.6667vw)";
  // 加上过渡效果
  chat_all_bottom.value.style.transition = "all 0.5s";
}

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
  .chat_all_content {
    height: calc(100vh - 21.3333vw - 14.9333vw);
    overflow: auto;
    padding: 3.2vw 6.4vw 0;
    box-sizing: border-box;

    .chat_all_content_info,
    .chat_all_content_my {
      display: flex;
      align-items: flex-start;
      margin-bottom: 3.2vw;
      img {
        width: 8.5333vw;
        height: 8.5333vw;
        border-radius: 50%;
        margin-right: 2.1333vw;
      }
      .chat_all_content_text {
        border-radius: 1.0667vw 2.1333vw 2.1333vw 2.1333vw;
        background: rgba(242, 243, 245, 1);
        padding: 2.1333vw 3.2vw;
        font-size: 4.2667vw;
        line-height: 5.8667vw;
        box-sizing: border-box;
        max-width: 74.6667vw;
        flex-wrap: wrap;
        word-wrap: break-word;
      }
    }
    .chat_all_content_my {
      justify-content: flex-end;
      img {
        margin-right: 0;
        margin-left: 2.1333vw;
      }
      .chat_all_content_text_my {
        border-radius: 1.0667vw 2.1333vw 2.1333vw 2.1333vw;
        background: rgba(242, 243, 245, 1);
        padding: 2.1333vw 3.2vw;
        font-size: 4.2667vw;
        line-height: 5.8667vw;
        box-sizing: border-box;
        max-width: 74.6667vw;
        flex-wrap: wrap;
        word-wrap: break-word;
        background-color: #3f51b5;
        color: #fff;
      }
    }
  }
  .chat_all_bottom {
    .chat_all_bottom_tool {
      .chat_all_bottom_tool_item {
        width: 14.9333vw;
        height: 21.8667vw;
        display: flex;
        flex-direction: column;
        text-align: center;
        color: rgba(175, 175, 175, 1);
        vertical-align: top;
        img {
          width: 14.9333vw;
          height: 14.93333vw;
        }
      }
    }
    .chat_all_bottom_list {
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      margin-bottom: 4.2667vw;
    }
    position: fixed;
    bottom: 0;
    width: 100vw;
    height: 49.0667vw;
    border-radius: 4.2667vw 4.2667vw 0 0;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0vw 0vw 2.1333vw rgba(0, 0, 0, 0.08);
    padding: 4.2667vw;
    box-sizing: border-box;
    input {
      width: 72.2667vw;
      height: 12.8vw;
      outline: none;
      border: 0;
      border-radius: 6.4vw;
      background: rgba(249, 249, 249, 1);
      padding: 0 4.2667vw;
      margin-left: 3.2vw;
      margin-right: 4.2667vw;
      box-sizing: border-box;
      &::placeholder {
        font-size: 4.2667vw;
        font-weight: 400;
        line-height: 5.8667vw;
        color: rgba(175, 175, 175, 1);
        text-align: left;
        vertical-align: top;
      }
    }
  }
  .chat_all_top {
    padding: 2.6667vw 6.4vw;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 14.9333vw;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 0px 2.1333vw rgba(0, 0, 0, 0.08);
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
