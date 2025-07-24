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
            <img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/cookies/quanyuan.jpeg" alt="" />
            <div class="qunliao_list_info_txt">
              <span>全员群</span>
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
      <div @click="hideMenuFn" class="chat_all_content" ref="chat_all_content">
        <!-- 别人发消息 -->
        <div class="chat_all_content_info" v-for="(message, index) in messages" :key="index" :class="{ 'my-message': message.isMine }">
          <!-- 时间显示 -->
          <div class="chat_all_content_info_createtime">{{ message.create_time }}</div>
          <img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/cookies/头像.png?1737703342307" alt="" />
          <div class="chat_all_content_info_block">
            <div class="chat_all_content_info_time">{{ message.username }}</div>
            <div class="chat_all_content_text">{{ message.text }}</div>
          </div>
        </div>
        <!-- 通知消息 -->
        <!-- <div class="chat_all_content_noitfy" >xx加入聊天</div> -->
      </div>
      <!-- 底部栏 -->
      <div class="chat_all_bottom" ref="chat_all_bottom">
        <!-- 发送消息 -->
        <div class="chat_all_bottom_list">
          <!-- <img @click="showMenuFn" src="../assets/icons/jia.svg" alt="" /> -->
          <Uploader @click="showMenuFn" width="4.8vw" height="4.8vw" color="#979797" />
          <textarea id="textarea_message" v-model="messageText" type="text" placeholder="在此处键入" rows="1" @focus="activePlaceholderHeight(6.4)" @blur="cancelPlaceholderHeight(12.8)"></textarea>
          <!-- <img @click="sendGroupMessage" src="../assets/icons/fasong.svg" alt="" /> -->
          <Check @click="sendGroupMessage" width="4.8vw" height="4.8vw" :color="messageText.length > 0 ? '#3f51b5' : '#979797'" />
        </div>
        <!-- 功能区域 -->
        <div class="chat_all_bottom_tool">
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/icons/lianxiren.svg" alt="" />
            <span>联系</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/icons/tupian.svg" alt="" />
            <span>图片</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/icons/wenjian.svg" alt="" />
            <span>文件</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/icons/weizhi.svg" alt="" />
            <span>位置</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/icons/shengyin.svg" alt="" />
            <span>声音</span>
          </div>
        </div>
      </div>
    </nut-popup>
  </div>
</template>

<script setup>
import { MoreX, RectLeft, Uploader, Check } from "@nutui/icons-vue";
import { ref, onMounted } from "vue";
// 导入dayjs
import dayjs from "dayjs";
const ws = ref(null); // websocket
const username = ref(""); // 用户名
const privateTo = ref(""); // 私聊对象
const connected = ref(false); // 是否连接

const tabIndexValue = ref("1"); // tab 标签页切换索引
const messageText = ref(""); // 消息文本
const messages = ref([]); // 消息列表

const chatAllPopupState = ref(false); // 群聊弹出层状态

const chat_all_bottom = ref(null); // 底部栏ref
const chat_all_content = ref(null); // 内容区域ref

onMounted(() => {
  // 随机用户名
  username.value = "用户" + Math.floor(Math.random() * 10000);
  // 连接
  connect();
});
// 函数 websockit连接
function connect() {
  if (!username.value) {
    alert("请输入用户名");
    return;
  }
  // 局域网测试
  ws.value = new WebSocket("ws://192.168.1.7:5200");

  // 用户连接成功
  ws.value.onopen = () => {
    connected.value = true;
    ws.value.send(JSON.stringify({ type: "join", username: username.value, create_time: dayjs().format("YYYY-MM-DD HH:mm:ss") }));
  };

  // 广播消息
  ws.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("收到消息", data);

    if (data.type === "group" || data.type === "private") {
      // 群消息和私聊消息
      // messages.value.push({ text: `${data.from ? data.from + ": " : ""}${data.message}`, isMine: data.from === username.value });
      messages.value.push({ text: `${data.message}`, isMine: data.from === username.value, username: data.from, create_time: data.create_time });

      // chat_all_content //监测下方是否有最新消息,不应该直接滚动到最底部
      setTimeout(() => {
        chat_all_content.value.scrollTop = chat_all_content.value.scrollHeight;
      }, 100);
    }
  };
}

// 函数 发送群聊消息
function sendGroupMessage() {
  console.log("发送群聊消息", messages.value);
  if (ws.value && messageText.value) {
    ws.value.send(JSON.stringify({ type: "group", from: username.value, message: messageText.value, username: username.value, create_time: dayjs().format("YYYY-MM-DD HH:mm:ss") }));
    messages.value.push({ text: messageText.value, isMine: true, username: username.value, create_time: dayjs().format("YYYY-MM-DD HH:mm:ss") });
    messageText.value = "";
  }

  // chat_all_content 滚动到最底部
  setTimeout(() => {
    chat_all_content.value.scrollTop = chat_all_content.value.scrollHeight;
  }, 100);
}

// 函数 发送私聊消息
const sendPrivateMessage = () => {
  if (ws.value && privateTo.value && message.value) {
    ws.value.send(JSON.stringify({ type: "private", from: username.value, to: privateTo.value, message: message.value }));
    messages.value.push({ text: `(私聊给 ${privateTo.value}): ${message.value}`, isMine: true });
    message.value = "";
  }
};

// 函数 隐藏菜单
function hideMenuFn() {
  // 向下移动200px
  chat_all_bottom.value.style.transform = "translateY(26.6667vw)";
  // 加上过渡效果
  chat_all_bottom.value.style.transition = "all 0.3s";
}

// 函数 显示菜单
function showMenuFn() {
  console.log(chat_all_bottom.value);
  // 向上移动200px
  chat_all_bottom.value.style.transform = "translateY(0)";
  // 加上过渡效果
  chat_all_bottom.value.style.transition = "all 0.3s";
}

// 函数 打开群聊弹出层
function openCahtAllFn() {
  chatAllPopupState.value = true;
}
// 函数 关闭群聊弹出层
function closeChatAllPopup() {
  chatAllPopupState.value = false;
}
// 激活输入框时的高度变化
function activePlaceholderHeight(value) {
  // 隐藏菜单
  hideMenuFn();

  // 获取输入框
  const textarea = document.querySelector("#textarea_message");
  if (textarea) {
    // 设置高度为自动
    textarea.style = `line-height: ${value}vw;transition: all 0.3s;`;
  }
}
// 取消激活输入框时的高度变化
function cancelPlaceholderHeight(value) {
  const textarea = document.querySelector("#textarea_message");
  if (textarea) {
    // 设置高度为自动
    textarea.style = `line-height: ${value}vw;transition: all 0.3s;`;
  }
}
</script>

<style lang="scss" scoped>
.Chat {
  .chat_all_content {
    height: calc(100vh - 21.3333vw - 14.9333vw);
    overflow: auto;
    padding: 3.2vw 6.4vw 0;
    box-sizing: border-box;
    white-space: pre-wrap;
    .chat_all_content_noitfy {
      height: 5.3333vw;
      font-size: 4vw;
      font-weight: 400;
      letter-spacing: 0px;
      line-height: 5.3333vw;
      color: rgba(175, 175, 175, 1);
      text-align: center;
      vertical-align: top;
      margin-bottom: 2.6667vw;
    }
    .chat_all_content_info {
      display: flex;
      align-items: flex-start;
      margin-bottom: 3.2vw;
      position: relative;
      padding-top: 6.4vw;
      .chat_all_content_info_createtime {
        position: absolute;
        top: 0;
        font-size: 3.2vw;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(175, 175, 175, 1);
      }
      img {
        width: 8.5333vw;
        height: 8.5333vw;
        border-radius: 50%;
        margin-right: 2.1333vw;
      }
      .chat_all_content_text {
        display: inline-block;
        border-radius: 1.0667vw 2.1333vw 2.1333vw 2.1333vw;
        background: rgba(242, 243, 245, 1);
        padding: 2.1333vw 3.2vw;
        font-size: 4.2667vw;
        line-height: 5.8667vw;
        box-sizing: border-box;
        max-width: 74.6667vw;
        word-wrap: break-word;
        min-height: 10.1333vw;
        text-align: left;
      }
      .chat_all_content_info_time {
        font-size: 3.2vw;
        transform: translateY(-1.6vw);
        /* color: rgba(175, 175, 175, 1); */
        color: #000;
        padding: 0 1.3333vw;
      }
    }
    .my-message {
      justify-content: flex-start;
      flex-direction: row-reverse;
      img {
        margin-right: 0;
        margin-left: 2.1333vw;
      }

      .chat_all_content_info_block {
        text-align: right;

        .chat_all_content_text {
          background-color: #3f51b5;
          color: #fff;
        }
      }
      .chat_all_content_info_time {
        text-align: right;
      }
    }
  }
  .chat_all_bottom {
    .chat_all_bottom_tool {
      display: flex;
      overflow-x: auto;
      /* 滚动条透明 */
      &::-webkit-scrollbar {
        display: none;
      }
      .chat_all_bottom_tool_item {
        width: 14.9333vw;
        height: 21.8667vw;
        display: flex;
        flex-direction: column;
        text-align: center;
        color: rgba(175, 175, 175, 1);
        vertical-align: top;
        margin-right: 7.4667vw;
        img {
          width: 14.9333vw;
          height: 14.93333vw;
          margin-bottom: 1.0667vw;
        }
        &:nth-child(5) {
          margin-right: 0;
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
    height: 48vw;
    border-radius: 4.2667vw 4.2667vw 0 0;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0vw 0vw 2.1333vw rgba(0, 0, 0, 0.08);
    padding: 4.2667vw;
    box-sizing: border-box;
    transform: translateY(26.6667vw);
    textarea {
      width: 72.2667vw;
      height: 12.8vw;
      line-height: 12.8vw;
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
