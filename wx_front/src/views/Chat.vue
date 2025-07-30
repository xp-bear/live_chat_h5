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

    <!-- [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[群聊 弹出层]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]] -->
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
      <div @touchstart="onPopupTouchStart" @touchmove="onPopupTouchMove" @touchend="onPopupTouchEnd" @click="hideMenuFn()" class="chat_all_content" ref="chat_all_content">
        <!-- 别人发消息 -->
        <div class="chat_all_content_info" v-for="(message, index) in messages_p" :key="index" :class="{ 'my-message': message.isMine }">
          <!-- 时间显示 -->
          <div class="chat_all_content_info_createtime">{{ message.create_time }}</div>
          <img :src="message.user_img" alt="" />
          <div class="chat_all_content_info_block">
            <div class="chat_all_content_info_time">{{ message.username }}</div>
            <div v-show="message.msg_type == 'text'" class="chat_all_content_text">{{ message.text }}</div>
            <img v-show="message.msg_type == 'image'" class="chat_all_content_img" :src="message.text" alt="" />
          </div>
        </div>
      </div>
      <!-- 底部栏 -->
      <div class="chat_all_bottom" ref="qun_chat_all_bottom">
        <!-- 发送消息 -->
        <div class="chat_all_bottom_list">
          <textarea id="textarea_message" v-model="messageText" type="text" placeholder="在此处键入" rows="1" @focus="activePlaceholderHeight(6.4)" @blur="cancelPlaceholderHeight(12.8)"></textarea>
          <img @click="showSmile" src="../assets/icons/smile.svg" class="chat_all_bottom_smile" alt="" />
          <Check v-if="messageText.length > 0" @click="sendGroupMessage" width="7.2vw" height="7.2vw" :color="messageText.length > 0 ? '#3f51b5' : '#979797'" />
          <CircleClose v-else @click="showMenuFn" width="7.2vw" height="7.2vw" style="transform: rotate(45deg)" :color="addBtnFlag ? '#3f51b5' : '#979797'" />
        </div>

        <!-- 群聊 功能区域 -->
        <!-- 点击加号 出来的内容 -->
        <div v-show="addBtnFlag === true" class="chat_all_bottom_tool">
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/toolimg/xaingce.svg" alt="" />
            <span>相册</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/toolimg/paishe.svg" alt="" />
            <span>拍摄</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/toolimg/dingwei.svg" alt="" />
            <span>位置</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/toolimg/yuyin.svg" alt="" />
            <span>语音输入</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/toolimg/geren.svg" alt="" />
            <span>个人名片</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/toolimg/wenjian.svg" alt="" />
            <span>文件</span>
          </div>
        </div>

        <!-- 表情出来内容 -->
        <div v-show="smileBtnFlag === true" class="chat_bottom_tool_smile">
          <!-- 表情标题 -->
          <div class="chat_bottom_tool_smile_title">
            <span @click="smile_title_index(0)" :class="smileTitleIndex == 0 ? 'checked_tool_smile_title' : ''">❤️</span>
            <span @click="smile_title_index(1)" :class="smileTitleIndex == 1 ? 'checked_tool_smile_title' : ''">😁</span>
            <span @click="smile_title_index(2)" :class="smileTitleIndex == 2 ? 'checked_tool_smile_title' : ''">✌️</span>
            <span @click="smile_title_index(3)" :class="smileTitleIndex == 3 ? 'checked_tool_smile_title' : ''">🐶</span>
            <span @click="smile_title_index(4)" :class="smileTitleIndex == 4 ? 'checked_tool_smile_title' : ''">🍏</span>
            <span @click="smile_title_index(5)" :class="smileTitleIndex == 5 ? 'checked_tool_smile_title' : ''">🥎</span>
            <span @click="smile_title_index(6)" :class="smileTitleIndex == 6 ? 'checked_tool_smile_title' : ''">🚐</span>
            <span @click="smile_title_index(7)" :class="smileTitleIndex == 7 ? 'checked_tool_smile_title' : ''">🎁</span>
          </div>
          <!-- 表情列表 -->
          <div class="chat_bottom_tool_smile_list">
            <!-- 渲染表情 -->
            <div class="smile_list_item_like" v-show="smileTitleIndex == 0">
              <div class="smile_list_item_like_add">
                <Uploader style="width: 6.4vw; height: 6.4vw; color: #ccc"></Uploader>
                <input type="file" accept="image/*" @change="changeSelectEmojiImg" />
              </div>
              <div class="smile_list_item_content" @click="selectEmojiImg(item.user_emoji_img)" v-for="(item, index) in userEmojiData" :key="index">
                <img :src="item.user_emoji_img" alt="" />
              </div>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 1">
              <span @click="selectEmoji(item)" v-for="(item, index) in emojiCategories.faces" :key="index">{{ item }}</span>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 2">
              <span @click="selectEmoji(item)" v-for="(item, index) in emojiCategories.gestures" :key="index">{{ item }}</span>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 3">
              <span @click="selectEmoji(item)" v-for="(item, index) in emojiCategories.animals" :key="index">{{ item }}</span>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 4">
              <span @click="selectEmoji(item)" v-for="(item, index) in emojiCategories.foods" :key="index">{{ item }}</span>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 5">
              <span @click="selectEmoji(item)" v-for="(item, index) in emojiCategories.activities" :key="index">{{ item }}</span>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 6">
              <span @click="selectEmoji(item)" v-for="(item, index) in emojiCategories.travel" :key="index">{{ item }}</span>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 7">
              <span @click="selectEmoji(item)" v-for="(item, index) in emojiCategories.objects" :key="index">{{ item }}</span>
            </div>
          </div>
        </div>

        <!-- 弹出层里面 2未读新消息提示 -->
        <div @click="cancelUnreadMessage" class="chat_all_unread_message animate__animated animate__pulse animate__infinite" v-show="unReadMessages_p.length > 0">
          <DouArrowUp style="transform: rotate(180deg)" />
          &nbsp; {{ unReadMessages_p.length }} 条新消息
        </div>
      </div>
    </nut-popup>

    <!-- ///////////////////////////////私聊 弹出层///////////////////////////////////////////// -->
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
      <div @touchstart="onPopupTouchStart" @touchmove="onPopupTouchMove" @touchend="onPopupTouchEnd" @click="p_hideAddMenu()" class="chat_all_content" ref="private_chat_all_content">
        <!-- 私聊消息列表 -->
        <div class="chat_all_content_info" v-for="(message, index) in private_messages_p" :key="index" :class="{ 'my-message': message.isMine }">
          <div v-show="message.to === private_user.user_people || message.username === private_user.user_people" class="chat_all_content_info_createtime">{{ message.create_time }}</div>
          <img v-show="message.to === private_user.user_people || message.username === private_user.user_people" :src="message.user_img" alt="" />
          <div v-show="message.to === private_user.user_people || message.username === private_user.user_people" class="chat_all_content_info_block">
            <div class="chat_all_content_info_time">{{ message.username }}</div>
            <!-- <div class="chat_all_content_text">{{ message.text }}</div> -->
            <div v-show="message.msg_type == 'text'" class="chat_all_content_text">{{ message.text }}</div>
            <img v-show="message.msg_type == 'image'" class="chat_all_content_img" :src="message.text" alt="" />
          </div>
        </div>
      </div>

      <!--  私聊  底部栏 -->
      <div class="chat_all_bottom" ref="chat_all_bottom">
        <!--私聊  发送消息 -->
        <div class="chat_all_bottom_list">
          <textarea
            id="private_textarea_message"
            v-model="privateMessageText"
            type="text"
            placeholder="在此处键入"
            rows="1"
            @focus="p_activePlaceholderHeight(6.4)"
            @blur="p_cancelPlaceholderHeight(12.8)"
          ></textarea>
          <img @click="p_showSmile" src="../assets/icons/smile.svg" class="private_chat_all_bottom_smile chat_all_bottom_smile" alt="" />
          <Check v-if="privateMessageText.length > 0" @click="sendPrivateMessage" width="7.2vw" height="7.2vw" :color="privateMessageText.length > 0 ? '#3f51b5' : '#979797'" />
          <CircleClose v-else @click="p_showAddMenu" width="7.2vw" height="7.2vw" style="transform: rotate(45deg)" :color="addBtnFlag ? '#3f51b5' : '#979797'" />
        </div>
        <!--私聊 功能区域 -->
        <div v-show="addBtnFlag === true" class="chat_all_bottom_tool">
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/toolimg/xaingce.svg" alt="" />
            <span>相册</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/toolimg/paishe.svg" alt="" />
            <span>拍摄</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/toolimg/dingwei.svg" alt="" />
            <span>位置</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/toolimg/yuyin.svg" alt="" />
            <span>语音输入</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/toolimg/geren.svg" alt="" />
            <span>个人名片</span>
          </div>
          <div class="chat_all_bottom_tool_item">
            <img src="../assets/toolimg/wenjian.svg" alt="" />
            <span>文件</span>
          </div>
        </div>
        <!-- 表情出来内容 -->
        <div v-show="smileBtnFlag === true" class="chat_bottom_tool_smile">
          <!-- 表情标题 -->
          <div class="chat_bottom_tool_smile_title">
            <span @click="smile_title_index(0)" :class="smileTitleIndex == 0 ? 'checked_tool_smile_title' : ''">❤️</span>
            <span @click="smile_title_index(1)" :class="smileTitleIndex == 1 ? 'checked_tool_smile_title' : ''">😁</span>
            <span @click="smile_title_index(2)" :class="smileTitleIndex == 2 ? 'checked_tool_smile_title' : ''">✌️</span>
            <span @click="smile_title_index(3)" :class="smileTitleIndex == 3 ? 'checked_tool_smile_title' : ''">🐶</span>
            <span @click="smile_title_index(4)" :class="smileTitleIndex == 4 ? 'checked_tool_smile_title' : ''">🍏</span>
            <span @click="smile_title_index(5)" :class="smileTitleIndex == 5 ? 'checked_tool_smile_title' : ''">🥎</span>
            <span @click="smile_title_index(6)" :class="smileTitleIndex == 6 ? 'checked_tool_smile_title' : ''">🚐</span>
            <span @click="smile_title_index(7)" :class="smileTitleIndex == 7 ? 'checked_tool_smile_title' : ''">🎁</span>
          </div>
          <!-- 表情列表 -->
          <div class="chat_bottom_tool_smile_list">
            <!-- 渲染表情 -->
            <div class="smile_list_item_like" v-show="smileTitleIndex == 0">
              <div class="smile_list_item_like_add private_smile_list_item_like_add">
                <Uploader style="width: 6.4vw; height: 6.4vw; color: #ccc"></Uploader>
                <input type="file" accept="image/*" @change="p_changeSelectEmojiImg" />
              </div>
              <div class="smile_list_item_content" @click="p_selectEmojiImg(item.user_emoji_img)" v-for="(item, index) in userEmojiData" :key="index">
                <img :src="item.user_emoji_img" alt="" />
              </div>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 1">
              <span @click="p_selectEmoji(item)" v-for="(item, index) in emojiCategories.faces" :key="index">{{ item }}</span>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 2">
              <span @click="p_selectEmoji(item)" v-for="(item, index) in emojiCategories.gestures" :key="index">{{ item }}</span>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 3">
              <span @click="p_selectEmoji(item)" v-for="(item, index) in emojiCategories.animals" :key="index">{{ item }}</span>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 4">
              <span @click="p_selectEmoji(item)" v-for="(item, index) in emojiCategories.foods" :key="index">{{ item }}</span>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 5">
              <span @click="p_selectEmoji(item)" v-for="(item, index) in emojiCategories.activities" :key="index">{{ item }}</span>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 6">
              <span @click="p_selectEmoji(item)" v-for="(item, index) in emojiCategories.travel" :key="index">{{ item }}</span>
            </div>
            <div class="smile_list_item" v-show="smileTitleIndex == 7">
              <span @click="p_selectEmoji(item)" v-for="(item, index) in emojiCategories.objects" :key="index">{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </nut-popup>
  </div>
</template>

<script setup>
import { MoreX, RectLeft, Uploader, Check, DouArrowUp, CircleClose } from "@nutui/icons-vue";
import { ref, onMounted, computed } from "vue";
import "animate.css"; // 引入 Animate.css
// 引入 Pinia store
import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";
const store = useCounterStore(); // 可以在组件中的任意位置访问 `store` 变量 ✨
const { userInfo, unReadMessages_p, messages_p, onlineUser_p, unprivateMessages_p, private_messages_p } = storeToRefs(store); // 使用 storeToRefs 解构 store 中的响应式属性

import { CONFIG } from "../config"; // 引入配置文件
import { getOnlineUser, addOnlineUser, deleteOnlineUser, addUserEmoji, getUserEmoji } from "../api/allApi"; // 引入所有 API
// 导入dayjs
import dayjs from "dayjs";
import { uploadFile } from "../utils/oss";
import emojiCategories from "../utils/emoji"; // 引入表情工具函数

const ws = ref(null); // websocket
const username = ref(""); // 用户名
const privateTo = ref(""); // 私聊对象
const connected = ref(false); // 是否连接

const tabIndexValue = ref("1"); // tab 标签页切换索引
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
const qun_chat_all_bottom = ref(null); // 群聊底部栏ref

const chat_all_content = ref(null); // 内容区域ref
const private_chat_all_content = ref(null); // 私聊内容区域ref

const addBtnFlag = ref(false); // 是否显示添加按钮
const smileBtnFlag = ref(false); // 是否显示表情状态按钮

const smileTitleIndex = ref(0); // 表情标题索引

const selectedFileImg = ref(null); // 选择的表情图片
const emojiImageUrl = ref(""); // 表情图片 URL
const userEmojiData = ref([]); // 用户表情数据

const touch = ref({ x: 0, y: 0, moved: false }); // 触摸事件相关数据

// *************************************************************************************************

function onPopupTouchStart(e) {
  const touchObj = e.touches[0];
  touch.value = { x: touchObj.clientX, y: touchObj.clientY, moved: false };
  console.log("onPopupTouchStart", touch.value);
}

function onPopupTouchMove(e) {
  const touchObj = e.touches[0];
  // 判断是否为右滑
  if (touchObj.clientX - touch.value.x > 60 && Math.abs(touchObj.clientY - touch.value.y) < 40) {
    touch.value.moved = true;
  }
}

function onPopupTouchEnd() {
  if (touch.value.moved) {
    closeChatAllPopup(); // 关闭群聊弹出层
    closePrivateChatPopup(); // 关闭私聊弹出层
  }
}
// 群聊 点击表情包发送
function selectEmojiImg(url) {
  // console.log("点击了", url);
  if (ws.value) {
    ws.value.send(
      JSON.stringify({
        type: "group",
        from: username.value,
        message: url,
        username: username.value,
        create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        user_img: userInfo.value.u_avatar,
        msg_type: "image", // 消息类型
      })
    );
    messages_p.value.push({ msg_type: "image", text: url, isMine: true, username: username.value, create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"), user_img: userInfo.value.u_avatar });
    hideMenuFn(); // 发送消息后隐藏菜单
  }
  // chat_all_content 滚动到最底部
  setTimeout(() => {
    chat_all_content.value.scrollTop = chat_all_content.value.scrollHeight;
  }, 100);
}

// 私聊 点击表情包发送
function p_selectEmojiImg(url) {
  if (ws.value) {
    ws.value.send(
      JSON.stringify({
        type: "private",
        from: username.value, // 发送者
        to: privateTo.value, // 接收者
        message: url,
        username: username.value,
        create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        user_img: userInfo.value.u_avatar,
        msg_type: "image", // 消息类型
      })
    );

    private_messages_p.value.push({
      text: url,
      isMine: true,
      to: privateTo.value,
      username: username.value,
      create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      user_img: userInfo.value.u_avatar,
      msg_type: "image", // 消息类型
    });
    console.log("发送私聊消息", private_messages_p.value);
  }
  p_hideAddMenu(); // 发送消息后隐藏菜单
  // 私聊消息列表滚动到最底部
  setTimeout(() => {
    private_chat_all_content.value.scrollTop = private_chat_all_content.value.scrollHeight;
  }, 100);
}

// 函数 群聊选择表情图片
async function changeSelectEmojiImg() {
  const input = document.querySelector(".smile_list_item_like_add input[type='file']");
  if (input && input.files && input.files.length > 0) {
    const file = input.files[0];
    selectedFileImg.value = file;
    try {
      const url = await uploadFile(selectedFileImg.value, "images/");
      emojiImageUrl.value = url; // 设置表情图片 URL
      selectedFileImg.value = null; // 清空选择的文件
      // console.log("上传成功:", url);
      // 添加表情到数据库
      addUserEmoji({ user_id: userInfo.value.id, emoji_url: url }).then((res) => {
        if (res.code === 200) {
          // console.log("添加表情成功", res);
          // 更新用户表情数据
          userEmojiData.value.push({ user_emoji_img: url });
        } else {
          console.error("添加表情失败", res);
        }
      });
    } catch (error) {
      console.error("上传失败:", error);
    }
  }
}

// 函数 私聊选择表情图片
async function p_changeSelectEmojiImg() {
  const input = document.querySelector(".private_smile_list_item_like_add input[type='file']");
  if (input && input.files && input.files.length > 0) {
    const file = input.files[0];
    selectedFileImg.value = file;
    try {
      const url = await uploadFile(selectedFileImg.value, "images/");
      emojiImageUrl.value = url; // 设置表情图片 URL
      selectedFileImg.value = null; // 清空选择的文件
      // console.log("上传成功:", url);
      // 添加表情到数据库
      addUserEmoji({ user_id: userInfo.value.id, emoji_url: url }).then((res) => {
        if (res.code === 200) {
          // console.log("添加表情成功", res);
          // 更新用户表情数据
          userEmojiData.value.push({ user_emoji_img: url });
        } else {
          console.error("添加表情失败", res);
        }
      });
    } catch (error) {
      console.error("上传失败:", error);
    }
  }
}

// 函数 群聊点击表情的时候
function selectEmoji(item) {
  // 获取 textarea 元素
  const textarea = document.getElementById("textarea_message");
  if (textarea) {
    // 在光标位置插入表情
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = textarea.value.substring(0, start);
    const textAfter = textarea.value.substring(end);
    textarea.value = textBefore + item + textAfter;
    // 设置光标位置到插入的表情后面
    textarea.selectionStart = textarea.selectionEnd = start + item.length;
    // 触发 input 事件以更新 v-model
    textarea.dispatchEvent(new Event("input"));
  }
}
// 函数 私聊点击表情的时候
function p_selectEmoji(item) {
  // 获取 textarea 元素
  const textarea = document.getElementById("private_textarea_message");
  if (textarea) {
    // 在光标位置插入表情
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = textarea.value.substring(0, start);
    const textAfter = textarea.value.substring(end);
    textarea.value = textBefore + item + textAfter;
    // 设置光标位置到插入的表情后面
    textarea.selectionStart = textarea.selectionEnd = start + item.length;
    // 触发 input 事件以更新 v-model
    textarea.dispatchEvent(new Event("input"));
  }
}

// 函数 表情标题索引
function smile_title_index(index) {
  smileTitleIndex.value = index;
}

//  首次进入页面加载数据
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

  // 获取用户表情数据
  getUserEmoji(userInfo.value.id).then((res) => {
    if (res.code === 200) {
      userEmojiData.value = res.data;
      // console.log("用户表情数据", userEmojiData.value);
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
        msg_type: data.msg_type, // 消息类型
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
      messages_p.value.push({ msg_type: data.msg_type, text: `${data.message}`, isMine: data.from === username.value, username: data.from, create_time: data.create_time, user_img: data.user_img });

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
        msg_type: "text", // 消息类型
      })
    );
    messages_p.value.push({ msg_type: "text", text: messageText.value, isMine: true, username: username.value, create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"), user_img: userInfo.value.u_avatar });
    messageText.value = "";
    hideMenuFn(); // 发送消息后隐藏菜单
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
        msg_type: "text", // 消息类型
      })
    );

    private_messages_p.value.push({
      text: privateMessageText.value,
      isMine: true,
      to: privateTo.value,
      username: username.value,
      create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      user_img: userInfo.value.u_avatar,
      msg_type: "text", // 消息类型
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
import smile_img from "../assets/icons/smile.svg"; // 引入表情图片
// 函数 点击表情切换svg图片
import smiledImg from "../assets/icons/smiled.svg"; // 引入表情图片

// 群聊 隐藏加号和表情功能区域
function hideMenuFn() {
  // 隐藏加号功能区域
  if (addBtnFlag.value) {
    addBtnFlag.value = false;
    // 群聊  隐藏加号功能区域
    qun_chat_all_bottom.value.style.transform = "translateY(43.6667vw)";
    qun_chat_all_bottom.value.style.transition = "all 0.3s";
  }

  // 隐藏表情功能区域
  if (smileBtnFlag.value) {
    smileBtnFlag.value = false;
    const smileImg = document.querySelector(".chat_all_bottom_smile");
    smileImg.src = smile_img; // 恢复表情图片

    //群聊 表情功能区
    qun_chat_all_bottom.value.style.transform = "translateY(78vw)";
    qun_chat_all_bottom.value.style.transition = "all 0.3s";
  }
}

// 群聊 显示添加函数菜单
function showMenuFn() {
  smileBtnFlag.value = false; // 隐藏表情功能区域
  addBtnFlag.value = true; // 显示加号功能区域
  // 群聊  移动加号功能区
  qun_chat_all_bottom.value.style.transform = "translateY(0)";
  qun_chat_all_bottom.value.style.transition = "all 0.3s";

  if (!smileBtnFlag.value) {
    // 修改 qun_chat_all_bottom 高度65vw
    qun_chat_all_bottom.value.style.height = "65vw"; // 恢复高度
    const smileImg = document.querySelector(".chat_all_bottom_smile");
    smileImg.src = smile_img; // 恢复表情图片
  }
}

// 群聊 显示表情功能区域
function showSmile() {
  addBtnFlag.value = false; // 隐藏加号功能区域
  smileBtnFlag.value = true; // 显示表情功能区域
  if (smileBtnFlag.value) {
    // 修改 qun_chat_all_bottom 高度100vw
    qun_chat_all_bottom.value.style.height = "100vw";
    const smileImg = document.querySelector(".chat_all_bottom_smile");
    smileImg.src = smiledImg; // 切换表情图片
  }

  qun_chat_all_bottom.value.style.transform = "translateY(0)";
  qun_chat_all_bottom.value.style.transition = "all 0.3s";
}

// 私聊 隐藏加号和表情功能区域
function p_hideAddMenu() {
  // 隐藏加号功能区域
  if (addBtnFlag.value) {
    addBtnFlag.value = false;
    // 群聊  隐藏加号功能区域
    chat_all_bottom.value.style.transform = "translateY(43.6667vw)";
    chat_all_bottom.value.style.transition = "all 0.3s";
  }

  // 隐藏表情功能区域
  if (smileBtnFlag.value) {
    smileBtnFlag.value = false;
    const smileImg = document.querySelector(".private_chat_all_bottom_smile");
    smileImg.src = smile_img; // 恢复表情图片

    //群聊 表情功能区
    chat_all_bottom.value.style.transform = "translateY(78vw)";
    chat_all_bottom.value.style.transition = "all 0.3s";
  }
}

function p_showAddMenu() {
  smileBtnFlag.value = false; // 隐藏表情功能区域
  addBtnFlag.value = true; // 显示加号功能区域
  // 群聊  移动加号功能区
  chat_all_bottom.value.style.transform = "translateY(0)";
  chat_all_bottom.value.style.transition = "all 0.3s";

  if (!smileBtnFlag.value) {
    // 修改 chat_all_bottom 高度65vw
    chat_all_bottom.value.style.height = "65vw"; // 恢复高度
    const smileImg = document.querySelector(".private_chat_all_bottom_smile");
    smileImg.src = smile_img; // 恢复表情图片
  }
}

function p_showSmile() {
  addBtnFlag.value = false; // 隐藏加号功能区域
  smileBtnFlag.value = true; // 显示表情功能区域
  if (smileBtnFlag.value) {
    // 修改 qun_chat_all_bottom 高度100vw
    chat_all_bottom.value.style.height = "100vw";
    const smileImg = document.querySelector(".private_chat_all_bottom_smile");
    smileImg.src = smiledImg; // 切换表情图片
  }

  chat_all_bottom.value.style.transform = "translateY(0)";
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
}

// 函数 取消激活输入框时的高度变化
function cancelPlaceholderHeight(value) {
  // 群聊输入框
  const textarea = document.querySelector("#textarea_message");
  if (textarea) {
    // 设置高度为自动
    textarea.style = `line-height: ${value}vw;transition: all 0.3s;`;
  }
}

// 函数 私聊激活输入框时的高度变化
function p_activePlaceholderHeight(value) {
  // 隐藏菜单
  p_hideAddMenu();

  // 私聊输入框
  const private_textarea = document.querySelector("#private_textarea_message");
  if (private_textarea) {
    // 设置高度为自动
    private_textarea.style = `line-height: ${value}vw;transition: all 0.3s;`;
  }
}

function p_cancelPlaceholderHeight(value) {
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
  :deep(.nut-tabs__content) {
    height: calc(100vh - 21.3333vw - 14.9333vw);
  }
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
      .chat_all_content_img {
        width: 26.6667vw;
        height: 26.6667vw;
        border-radius: 0%;
        object-fit: contain;
        object-position: left center;
      }
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
        .chat_all_content_img {
          width: 26.6667vw;
          height: 26.6667vw;
          border-radius: 0%;
          object-fit: contain;
          object-position: right center;
        }
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
    position: fixed;
    bottom: 0;
    width: 100vw;
    height: 65vw;
    border-radius: 4.2667vw 4.2667vw 0 0;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0vw 0vw 2.1333vw rgba(0, 0, 0, 0.08);
    padding: 4.2667vw 0;
    box-sizing: border-box;
    transform: translateY(43.6667vw);
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

    .chat_bottom_tool_smile {
      width: 100%;
      height: 180vw;
      .checked_tool_smile_title {
        border-radius: 1.8vw 1.8vw 0 0;
        background-color: #ccc;
      }
      .chat_bottom_tool_smile_title {
        display: flex;
        align-items: center;
        width: 100%;
        height: 8.8vw;
        padding-left: 2.6667vw;
        span {
          width: 11.8vw;
          height: 8.8vw;
          line-height: 8.8vw;
          font-size: 6.4vw;
          text-align: center;
        }
      }
      .chat_bottom_tool_smile_list {
        background-color: #f7f7f7;
        height: 106.6667vw;
        .smile_list_item_like {
          display: flex;
          flex-wrap: wrap;
          .smile_list_item_like_add {
            border: #ccc dashed 0.5333vw;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 12.8vw;
            height: 12.8vw;
            margin: 2.6667vw;
            position: relative;
            input {
              width: 12.8vw;
              height: 12.8vw;
              opacity: 0;
              position: absolute;
              top: 0;
              left: 0;
              z-index: 1;
            }
          }
          .smile_list_item_content {
            width: 12.8vw;
            height: 12.8vw;
            margin: 2.6667vw;
            img {
              width: 12.8vw;
              height: 12.8vw;
            }
          }
        }
        .smile_list_item {
          overflow-y: auto;
          height: 68vw;
          width: 94.6667vw;
          margin: 0 auto;
          span {
            display: inline-block;
            width: 6.4vw;
            height: 6.4vw;
            font-size: 6.4vw;
            margin: 2.6667vw;
            text-align: center;
            line-height: 6.4vw;
          }
        }
      }
    }
    .chat_all_bottom_tool {
      display: flex;
      flex-wrap: wrap;
      padding: 2.6667vw;
      background-color: #f7f7f7;
      .chat_all_bottom_tool_item {
        width: 23.4667vw;
        /* height: 23.4667vw; */
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        color: rgba(175, 175, 175, 1);
        vertical-align: top;
        margin-bottom: 2.6667vw;
        span {
          font-size: 3.2vw;
          margin-top: 1.3333vw;
        }
        img {
          width: 35%;
          height: 35%;
          padding: 2.6667vw;
          background-color: #fff;
          border-radius: 2.6667vw;
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
      .chat_all_bottom_smile {
        width: 8.2vw;
        height: 8.2vw;
      }
    }

    textarea {
      width: 72.2667vw;
      height: 12.8vw;
      line-height: 12.8vw;
      outline: none;
      border: 0;
      border-radius: 6.4vw;
      background: rgba(249, 249, 249, 1);
      padding: 0 4.2667vw;
      /* margin-left: 3.2vw; */
      /* margin-right: 4.2667vw; */
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
