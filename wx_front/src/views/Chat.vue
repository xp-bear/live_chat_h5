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
              <span>
                全员群
                <span class="qunliao_list_info_txt_time"> {{ formatTime(messages_p[messages_p.length - 1]?.create_time) }} </span>
              </span>
              <span class="ellipsis"> {{ messages_p[messages_p.length - 1]?.text || "暂无新消息" }} </span>
            </div>
          </div>
          <div class="qunliao_list_message" v-show="unReadMessages_p.length > 0">{{ unReadMessages_p.length }}</div>
        </div>
      </nut-tab-pane>
      <nut-tab-pane title="个人单聊" pane-key="2">
        <div @click="openPrivateChatPopup(user)" v-for="(user, index) in onlineUser_p" :key="user.user_people" class="qunliao_list private_qunliao_list">
          <div class="qunliao_list_info">
            <img :src="user.user_img" alt="" />
            <div class="qunliao_list_info_txt">
              <span>
                {{ user.user_people }}
                <span class="qunliao_list_info_txt_time"> {{ formatTime(user?.create_time) }} </span>
              </span>
              <span><i class="chat_all_top_dot"></i>在线</span>
            </div>
          </div>
          <div class="private_qunliao_list_message" v-for="(item, index) in private_messages_p" :key="item.username">
            <div class="private_qunliao_list_message2" v-show="show_private_count(user, item)">
              {{ private_format_count(item.username) }}
            </div>
          </div>
        </div>
      </nut-tab-pane>
    </nut-tabs>
    <!-- 来消息提示音效播放 -->
    <audio id="messageAudio" src="/music/msg.mp3" preload="auto"></audio>
    <!-- 群聊 弹出层 -->
    <nut-popup v-model:visible="chatAllPopupState" position="right" :style="{ width: '100%', height: '100%' }">
      <!-- 顶部栏 -->
      <div class="chat_all_top">
        <div class="chat_all_top_txt">
          <RectLeft @click="closeChatAllPopup" width="4.8vw" height="4.8vw" />
          <img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/cookies/quanyuan.jpeg" alt="" />
          <div class="chat_all_top_state">
            <span>全员群</span>
            <span><i class="chat_all_top_dot"></i>在线</span>
          </div>
        </div>
        <MoreX width="4.8vw" height="4.8vw" />
      </div>
      <!-- 内容区域 -->
      <div @click="hideMenuFn" class="chat_all_content" ref="chat_all_content">
        <!-- 别人发消息 -->
        <div class="chat_all_content_info" v-for="(message, index) in messages_p" :key="index" :class="{ 'my-message': message.isMine }">
          <!-- 时间显示 -->
          <div class="chat_all_content_info_createtime">{{ message.create_time }}</div>
          <img :src="message.user_img" alt="" />
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
        <!-- 弹出层里面 2未读新消息提示 -->
        <div @click="cancelUnreadMessage" class="chat_all_unread_message animate__animated animate__pulse animate__infinite" v-show="unReadMessages_p.length > 0">
          <DouArrowUp style="transform: rotate(180deg)" />
          &nbsp; {{ unReadMessages_p.length }} 条新消息
        </div>
      </div>
    </nut-popup>

    <!-- 私聊 弹出层 -->
    <nut-popup v-model:visible="privateChatAllPopupState" position="right" :style="{ width: '100%', height: '100%' }">
      <!-- 顶部栏 -->
      <div class="chat_all_top">
        <div class="chat_all_top_txt">
          <RectLeft @click="closePrivateChatPopup" width="4.8vw" height="4.8vw" />
          <img :src="private_user.user_img" alt="" />
          <div class="chat_all_top_state">
            <span>{{ private_user.user_people }}</span>
            <span><i class="chat_all_top_dot"></i>在线</span>
          </div>
        </div>
        <MoreX width="4.8vw" height="4.8vw" />
      </div>

      <!-- 私聊内容区域 -->
      <div @click="hideMenuFn" class="chat_all_content" ref="private_chat_all_content">
        <!-- 私聊消息列表 -->
        <div class="chat_all_content_info" v-for="(message, index) in private_messages_p" :key="index" :class="{ 'my-message': message.isMine }">
          <div v-show="message.to === private_user.user_people || message.username === private_user.user_people" class="chat_all_content_info_createtime">{{ message.create_time }}</div>
          <img v-show="message.to === private_user.user_people || message.username === private_user.user_people" :src="message.user_img" alt="" />
          <div v-show="message.to === private_user.user_people || message.username === private_user.user_people" class="chat_all_content_info_block">
            <div class="chat_all_content_info_time">{{ message.username }}</div>
            <div class="chat_all_content_text">{{ message.text }}</div>
          </div>
        </div>
      </div>

      <!--  私聊  底部栏 -->
      <div class="chat_all_bottom" ref="chat_all_bottom">
        <!-- 发送消息 -->
        <div class="chat_all_bottom_list">
          <Uploader @click="showMenuFn" width="4.8vw" height="4.8vw" color="#979797" />
          <textarea
            id="private_textarea_message"
            v-model="privateMessageText"
            type="text"
            placeholder="在此处键入"
            rows="1"
            @focus="activePlaceholderHeight(6.4)"
            @blur="cancelPlaceholderHeight(12.8)"
          ></textarea>
          <Check @click="sendPrivateMessage" width="4.8vw" height="4.8vw" :color="privateMessageText.length > 0 ? '#3f51b5' : '#979797'" />
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
import { MoreX, RectLeft, Uploader, Check, DouArrowUp } from "@nutui/icons-vue";
import { ref, onMounted } from "vue";
import "animate.css"; // 引入 Animate.css
// 引入 Pinia store
import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";
const store = useCounterStore(); // 可以在组件中的任意位置访问 `store` 变量 ✨
const { userInfo, unReadMessages_p, messages_p, onlineUser_p, unprivateMessages_p, private_messages_p } = storeToRefs(store); // 使用 storeToRefs 解构 store 中的响应式属性

import { CONFIG } from "../config"; // 引入配置文件
import { getOnlineUser, addOnlineUser, deleteOnlineUser } from "../api/allApi"; // 引入所有 API

// 导入dayjs
import dayjs from "dayjs";

const ws = ref(null); // websocket
const username = ref(""); // 用户名
const privateTo = ref(""); // 私聊对象
const connected = ref(false); // 是否连接

const tabIndexValue = ref("2"); // tab 标签页切换索引
const messageText = ref(""); // 消息文本

const private_user = ref(""); // 私聊对象用户
const privateMessageText = ref(""); // 私聊消息文本
// const private_messages_p = ref([]); // 私聊消息列表
// const unprivateMessages_p = ref([]); // 未读私聊消息列表

// const messages_p = ref([]); // 消息列表
// 实时在线人员情况
// const onlineUser_p = ref([]); // 在线用户列表
const chatAllPopupState = ref(false); // 群聊弹出层状态
const privateChatAllPopupState = ref(false); // 私聊弹出层状态
const chat_all_bottom = ref(null); // 底部栏ref
const chat_all_content = ref(null); // 内容区域ref
const private_chat_all_content = ref(null); // 私聊内容区域ref

onMounted(() => {
  // 随机用户名
  username.value = userInfo.value.u_name;
  // 连接
  connect();

  // 未读消息合并到 messages_p 中
  if (unReadMessages_p.value.length > 0) {
    unReadMessages_p.value.forEach((item) => {
      messages_p.value.push({
        text: item.message,
        isMine: item.from === username.value,
        username: item.from,
        create_time: item.create_time,
        user_img: item.user_img,
      });
    });
  }

  // 本地获取在线用户列表
  getOnlineUser().then((res) => {
    // console.log("首次进入页面加载数据", res.data);
    if (res.code === 200) {
      // 排除自己,不可以和自己单聊
      onlineUser_p.value = res.data.filter((user) => user.user_people !== username.value);
    }
  });
});
// 函数 websockit连接
function connect() {
  if (!username.value) {
    alert("请输入用户名");
    return;
  }
  // 局域网测试
  ws.value = new WebSocket(CONFIG.development.WS_API);

  // 用户连接成功
  ws.value.onopen = () => {
    connected.value = true;
    ws.value.send(JSON.stringify({ type: "join", username: username.value, create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"), user_img: userInfo.value.u_avatar }));
  };

  // 广播消息
  ws.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("h5收到消息", data);

    // 如果是在线用户列表更新
    if (data.type === "info") {
      if (data.user_state === "join") {
        const exists = onlineUser_p.value.some((user) => user.user_people === data.user_people);
        if (!exists) {
          // 添加到数据库
          chat_updateOnlineUser(data);
        }
      } else if (data.user_state === "close") {
        // 用户退出
        onlineUser_p.value = onlineUser_p.value.filter((user) => user.user_people !== data.user_people);
        // 从数据库删除用户
        deleteOnlineUser({ user_people: data.user_people }).then((res) => {
          console.log("删除在线用户", res);
        });
      }
      // 排除自己,不可以和自己单聊
      onlineUser_p.value = onlineUser_p.value.filter((user) => user.user_people !== username.value);
    }

    // 先判断聊天弹出层是否打开
    if (data.type !== "info") {
      if (data.type === "group" && !chatAllPopupState.value) {
        // 如果聊天弹出层没有打开，则将消息添加到未读消息列表
        unReadMessages_p.value.push(data);
        // 播放消息提示音效
        const messageAudio = document.getElementById("messageAudio");
        if (messageAudio) {
          messageAudio.play().catch((error) => {
            console.error("播放音频失败:", error);
          });
        }
      } else if (data.type === "private" && !privateChatAllPopupState.value) {
        // 如果私聊弹出层没有打开，则将消息添加到未读私聊消息列表
        unprivateMessages_p.value.push(data);

        // 播放消息提示音效
        const messageAudio = document.getElementById("messageAudio");
        if (messageAudio) {
          messageAudio.play().catch((error) => {
            console.error("播放音频失败:", error);
          });
        }
      }
    }

    // 私聊消息
    if (data.type === "private") {
      // 私聊消息
      // console.log(data.to, data.from);
      // 如果是私聊消息且是发给自己的
      private_messages_p.value.push({
        text: data.message,
        to: data.to,
        isMine: data.from === username.value,
        username: data.from,
        create_time: data.create_time,
        user_img: data.user_img,
      });
      privateMessageText.value = ""; // 清空私聊输入框

      // console.log("私聊消息列表", private_messages_p.value);
      setTimeout(() => {
        // 私聊弹出层打开时，滚动到底部
        if (privateChatAllPopupState.value) {
          private_chat_all_content.value.scrollTop = private_chat_all_content.value.scrollHeight;
        }
      }, 100);
    }
    // 群聊消息
    if (data.type === "group") {
      // 群消息和私聊消息
      messages_p.value.push({ text: `${data.message}`, isMine: data.from === username.value, username: data.from, create_time: data.create_time, user_img: data.user_img });

      // chat_all_content //监测下方是否有最新消息,不应该直接滚动到最底部
      setTimeout(() => {
        // 如果群聊弹出层是打开状态，则滚动到最底部
        if (chatAllPopupState.value) {
          chat_all_content.value.scrollTop = chat_all_content.value.scrollHeight;
        }
      }, 100);
    }
  };
}

// 函数 发送群聊消息
function sendGroupMessage() {
  console.log("发送群聊消息", messages_p.value);
  if (ws.value && messageText.value) {
    ws.value.send(
      JSON.stringify({
        type: "group",
        from: username.value,
        message: messageText.value,
        username: username.value,
        create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        user_img: userInfo.value.u_avatar,
      })
    );
    messages_p.value.push({ text: messageText.value, isMine: true, username: username.value, create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"), user_img: userInfo.value.u_avatar });
    messageText.value = "";
  }

  // chat_all_content 滚动到最底部
  setTimeout(() => {
    chat_all_content.value.scrollTop = chat_all_content.value.scrollHeight;
  }, 100);
}

// 函数 发送私聊消息
const sendPrivateMessage = () => {
  if (ws.value && privateTo.value && privateMessageText.value) {
    ws.value.send(
      JSON.stringify({
        type: "private",
        from: username.value, // 发送者
        to: privateTo.value, // 接收者
        message: privateMessageText.value,
        username: username.value,
        create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        user_img: userInfo.value.u_avatar,
      })
    );

    private_messages_p.value.push({
      text: privateMessageText.value,
      isMine: true,
      to: privateTo.value,
      username: username.value,
      create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      user_img: userInfo.value.u_avatar,
    });
    privateMessageText.value = "";
    console.log("发送私聊消息", private_messages_p.value);
  }
  // 私聊消息列表滚动到最底部
  setTimeout(() => {
    private_chat_all_content.value.scrollTop = private_chat_all_content.value.scrollHeight;
  }, 100);
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

  setTimeout(() => {
    // 滚动到最底部
    chat_all_content.value.scrollTop = chat_all_content.value.scrollHeight;
  }, 100);

  // 计算未读消息
  if (!chat_all_content.value) return false; // 如果 chat_all_content 没有被正确引用，返回 false
  // console.log("是否显示未读消息", chat_all_content?.value.scrollHeight, chat_all_content?.value.clientHeight);
  // 先判断一下当前消息是否有超过内容区域高度,如果超过了就显示未读消息
  if (chat_all_content.value.scrollHeight > chat_all_content.value.clientHeight) {
    // 如果超过了就显示未读消息
    unReadMessages_p.value = messages_p.value.slice(-1 * (chat_all_content.value.scrollHeight / chat_all_content.value.clientHeight));
  } else {
    // 如果没有超过就清空未读消息
    unReadMessages_p.value = [];
  }
}
// 函数 关闭群聊弹出层
function closeChatAllPopup() {
  chatAllPopupState.value = false;
  // 清空未读消息
  unReadMessages_p.value = [];
}
// 函数 激活输入框时的高度变化
function activePlaceholderHeight(value) {
  // 隐藏菜单
  hideMenuFn();
  // 群聊输入框
  const textarea = document.querySelector("#textarea_message");
  if (textarea) {
    // 设置高度为自动
    textarea.style = `line-height: ${value}vw;transition: all 0.3s;`;
  }
  // 获取私聊输入框
  const private_textarea = document.querySelector("#private_textarea_message");
  if (private_textarea) {
    // 设置高度为自动
    private_textarea.style = `line-height: ${value}vw;transition: all 0.3s;`;
  }
}
// 函数 取消激活输入框时的高度变化
function cancelPlaceholderHeight(value) {
  // 群聊输入框
  const textarea = document.querySelector("#textarea_message");
  if (textarea) {
    // 设置高度为自动
    textarea.style = `line-height: ${value}vw;transition: all 0.3s;`;
  }
  // 私聊输入框
  const private_textarea = document.querySelector("#private_textarea_message");
  if (private_textarea) {
    // 设置高度为自动
    private_textarea.style = `line-height: ${value}vw;transition: all 0.3s;`;
  }
}
// 函数 根据传入的时间 设置成今天 • 10:30 这种格式 23:4 设置成23:04
function formatTime(date) {
  if (!date) return ""; // 如果没有日期，返回空字符串
  const now = new Date();
  const messageDate = new Date(date);
  if (now.toDateString() === messageDate.toDateString()) {
    return `今天 • ${messageDate.getHours()}:${messageDate.getMinutes().toString().padStart(2, "0")}`;
  } else {
    return `${messageDate.getFullYear()}-${(messageDate.getMonth() + 1).toString().padStart(2, "0")}-${messageDate.getDate().toString().padStart(2, "0")} • ${messageDate.getHours()}:${messageDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
}
// 函数 取消未读消息
function cancelUnreadMessage() {
  unReadMessages_p.value = [];

  // 如果聊天弹出层是打开状态，则滚动到最底部
  if (chatAllPopupState.value) {
    chat_all_content.value.scrollTop = chat_all_content.value.scrollHeight;
  }
  // 点击其他地方,也要隐藏菜单
  hideMenuFn();
}

// 函数 打开私聊弹出层
function openPrivateChatPopup(user) {
  privateChatAllPopupState.value = true;
  privateTo.value = user.user_people; // 设置私聊对象
  private_user.value = user; // 设置私聊对象用户
  // console.log("打开私聊弹出层", private_user.value);

  // 删除  unprivateMessages_p.value中 user.user_people 的所有消息
  unprivateMessages_p.value = unprivateMessages_p.value.filter((item) => item.from !== user.user_people);
  // 私聊消息列表滚动到最底部
  setTimeout(() => {
    private_chat_all_content.value.scrollTop = private_chat_all_content.value.scrollHeight;
  }, 100);
}
// 函数 关闭私聊弹出层
function closePrivateChatPopup() {
  privateChatAllPopupState.value = false;
}

// 函数 私聊消息条数
function private_format_count(username) {
  let data = unprivateMessages_p.value.filter((item) => {
    return item.from === username;
  });
  // 计算未读私聊消息数量
  return data.length;
}
// 函数 更新在线用户列表
function chat_updateOnlineUser(user) {
  // 查询数据库是否存在用户,不存在就添加
  getOnlineUser().then((res) => {
    // console.log("添加数据库用户先查询", res.data);
    if (res.code === 200) {
      // 检查当前添加的用户是不是自己登录的这个账号 是就添加  u.user_people === username.value 相同元素条数没有添加 >1不添加
      const exists = res.data.filter((u) => u.user_people === username.value);
      if (exists.length === 0) {
        // 添加到数据库
        addOnlineUser(user).then((res) => {
          // console.log("添加在线用户", res.data);
          // 排除自己,不可以和自己单聊
          if (user.user_people !== username.value) {
            onlineUser_p.value.push(user); // 更新在线用户列表
          }
        });
      } else {
        setTimeout(() => {
          // 查询数据库存在用户更新onlineUser_p
          getOnlineUser().then((ress) => {
            if (ress.code === 200) {
              console.log("用户已存在，不添加", ress.data);
              // 排除自己,不可以和自己单聊
              onlineUser_p.value = ress.data.filter((user) => user.user_people !== username.value);
            }
          });
        }, 2000);
      }
    }
  });
}

// 函数  v-show 显示私聊消息数量
function show_private_count(user, item) {
  let data = unprivateMessages_p.value.filter((res) => res.user_people === user.username);
  data = data.filter((res) => res.from === item.username);

  if (unprivateMessages_p.value.length > 0 && user.user_people === item.username && data.length > 0) {
    return true;
  } else {
    return false;
  }
}
</script>

<style lang="scss" scoped>
.Chat {
  .ellipsis {
    overflow: hidden; /* 隐藏溢出内容 */
    white-space: nowrap; /* 禁止文本换行 */
    text-overflow: ellipsis; /* 超出部分显示省略号 */
    width: 100%; /* 必须设置宽度（或max-width）*/
  }
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
      .private_chat_content_info_block {
      }
      .chat_all_content_info_createtime {
        position: absolute;
        top: 0;
        font-size: 2.6667vw;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(175, 175, 175, 1);
      }
      img {
        width: 8.5333vw;
        height: 8.5333vw;
        border-radius: 50%;
        margin-right: 2.1333vw;
        object-fit: cover;
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
        color: rgba(175, 175, 175, 1);
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
    position: relative;
    .chat_all_unread_message {
      display: flex;
      align-items: center;
      position: absolute;
      top: -25%;
      right: 3%;
      background-color: #fff;
      color: #3f51b5;
      font-size: 3.7333vw;
      padding: 2.1333vw 4.2667vw;
      border-radius: 10.3333vw;
      box-shadow: 0px 0px 2.1333vw rgba(0, 0, 0, 0.08);
    }
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
      object-fit: cover;
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
        position: relative;
        width: 65vw;
        .chat_all_top_dot {
          display: inline-block;
          width: 2.1333vw;
          height: 2.1333vw;
          background-color: rgba(70, 209, 145, 1);
          border-radius: 50%;
          margin-right: 1.0667vw;
        }
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
          .qunliao_list_info_txt_time {
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
      position: absolute;
      right: 6.6667vw;
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
  .private_qunliao_list {
    margin-bottom: 2.6667vw;
    position: relative;
    .private_qunliao_list_message2 {
      background-color: red;
      border-radius: 50%;
    }
    .private_qunliao_list_message {
      position: absolute;
      right: 6.6667vw;
      width: 6.4vw;
      height: 6.4vw;
      text-align: center;
      color: #fff;
      font-size: 3.2vw;
      line-height: 6.4vw;
      margin-right: 4.2667vw;
    }
  }
}
</style>
