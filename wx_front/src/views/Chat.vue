<template>
  <div class="Chat">
    <!-- 美化的头部区域 -->
    <header class="chat-header">
      <div class="header-bg-decoration"></div>
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">💬</div>
          <div class="header-text">
            <div class="title">消息中心</div>
            <div class="subtitle">与好友畅聊，分享快乐时光</div>
          </div>
        </div>
        <div class="header-right">
          <div class="online-count">{{ onlineUser_p.length + 1 }}人在线</div>
        </div>
      </div>
    </header>

    <!-- 搜索框 -->
    <!-- <div class="search_all">
      <input class="search" placeholder="搜索消息" />
      <img class="search_img" src="../assets/icons/fangdajing.svg" />
    </div> -->

    <!-- tab 标签页切换 -->
    <nut-tabs v-model="tabIndexValue" swipeable background="transparent" size="large" color="#667eea">
      <nut-tab-pane title="全部群聊" pane-key="1">
        <!-- 列表展示 -->
        <div class="qunliao_list modern-card" @click="openCahtAllFn">
          <div class="qunliao_list_info">
            <div class="avatar-wrapper">
              <img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/cookies/quanyuan.jpeg" alt="" />
            </div>
            <div class="qunliao_list_info_txt">
              <div class="chat-name-row">
                <span class="chat-name">全员群({{ onlineUser_p.length + 1 }})</span>
                <span class="qunliao_list_info_txt_time">{{ formatTime(messages_p[messages_p.length - 1]?.create_time) }}</span>
              </div>
              <span class="ellipsis chat-preview"> {{ format_last_message_text(messages_p[messages_p.length - 1]) }} </span>
            </div>
          </div>
          <div class="qunliao_list_message badge-notification" v-show="unReadMessages_p.length > 0">{{ unReadMessages_p.length }}</div>
        </div>
      </nut-tab-pane>
      <nut-tab-pane title="个人单聊" pane-key="2">
        <div v-if="allChatUsers.length === 0" style="padding: 20px; text-align: center; color: #999">暂无聊天对象</div>
        <div @click="openPrivateChatPopup(user)" v-for="user in allChatUsers" :key="user.user_people" class="qunliao_list private_qunliao_list modern-card">
          <div class="qunliao_list_info">
            <div class="avatar-wrapper">
              <img :src="user.user_img" alt="" />
              <span v-if="user.online" class="online-indicator"></span>
              <span v-else class="offline-indicator"></span>
            </div>
            <div class="qunliao_list_info_txt">
              <div class="chat-name-row">
                <span class="chat-name">{{ user.user_people }}</span>
                <span class="online-status-text" :class="{ 'status-online': user.online, 'status-offline': !user.online }">
                  {{ user.online ? "在线" : "离线" }}
                </span>
                <span class="qunliao_list_info_txt_time">{{ formatTime(get_last_private_message(user)?.create_time || user?.create_time) }}</span>
              </div>
              <span class="ellipsis chat-preview"> {{ format_last_message_text(get_last_private_message(user)) }} </span>
            </div>
          </div>
          <div class="private_qunliao_list_message" v-if="getUnreadCount(user.user_people) > 0">
            <div class="private_qunliao_list_message2 badge-notification">
              {{ getUnreadCount(user.user_people) }}
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
      <div class="chat_all_top modern-header">
        <div class="chat_all_top_txt">
          <RectLeft @click="closeChatAllPopup" width="4.8vw" height="4.8vw" color="#fff" />
          <div class="avatar-wrapper">
            <img src="https://xp-cdn-oss.oss-cn-wuhan-lr.aliyuncs.com/cookies/quanyuan.jpeg" alt="" />
          </div>
          <div class="chat_all_top_state">
            <span>全员群({{ onlineUser_p.length + 1 }})</span>
            <span><i class="chat_all_top_dot"></i>在线</span>
          </div>
        </div>
        <MoreX width="4.8vw" height="4.8vw" color="#fff" />
      </div>
      <!-- 内容区域 -->
      <div @touchstart="onPopupTouchStart" @touchmove="onPopupTouchMove" @touchend="onPopupTouchEnd" @click="hideMenuFn()" class="chat_all_content modern-chat-bg" ref="chat_all_content">
        <!-- 别人发消息 -->
        <div class="chat_all_content_info" v-for="(message, index) in messages_p" :key="index" :class="{ 'my-message': message.isMine }">
          <!-- 时间显示 -->
          <div class="chat_all_content_info_createtime">{{ formatChatTime(message.create_time) }}</div>
          <div class="avatar-wrapper small">
            <img :src="message.user_img" alt="" />
          </div>
          <div class="chat_all_content_info_block">
            <div class="chat_all_content_info_time">{{ message.username }}</div>
            <div v-show="message.msg_type == 'text'" class="chat_all_content_text modern-bubble">{{ message.text }}</div>
            <img @click="showBigImg(message.text)" v-show="message.msg_type == 'image'" class="chat_all_content_img modern-image" :src="message.text" alt="" />
          </div>
        </div>
        <!-- 点击图片遮罩层 -->
        <!-- <nut-overlay v-model:visible="showBigImgFlag">
          <div class="overlay-body">
            <img class="overlay-content" :src="showBigImgUrl" alt="" />
          </div>
        </nut-overlay> -->
        <!-- 图片预览区域 -->
        <nut-image-preview :show-index="false" :show="showBigImgFlag" :images="[{ src: showBigImgUrl }]" @close="hideBigImg" />
      </div>
      <!-- 底部栏 -->
      <div class="chat_all_bottom modern-input-area" ref="qun_chat_all_bottom">
        <!-- 发送消息 -->
        <div class="chat_all_bottom_list">
          <textarea id="textarea_message" v-model="messageText" type="text" placeholder="说点什么..." rows="1" @focus="activePlaceholderHeight(6.4)" @blur="cancelPlaceholderHeight(12.8)"></textarea>
          <img @click="showSmile" src="../assets/icons/smile.svg" class="chat_all_bottom_smile" alt="" />
          <Check v-if="messageText.length > 0" @click="sendGroupMessage" width="7.2vw" height="7.2vw" :color="messageText.length > 0 ? '#667eea' : '#979797'" />
          <CircleClose v-else @click="showMenuFn" width="7.2vw" height="7.2vw" style="transform: rotate(45deg)" :color="addBtnFlag ? '#667eea' : '#979797'" />
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
          <!-- 群聊 表情列表 -->
          <div class="chat_bottom_tool_smile_list">
            <!-- 渲染表情 -->
            <div class="smile_list_item_like" v-show="smileTitleIndex == 0">
              <div class="smile_list_item_like_add">
                <Uploader style="width: 6.4vw; height: 6.4vw; color: #ccc"></Uploader>
                <input type="file" accept="image/*" @change="changeSelectEmojiImg" />
              </div>
              <div class="smile_list_item_content" v-for="(item, index) in userEmojiData" :key="index">
                <div class="mile_list_item_container">
                  <img @click="selectEmojiImg(item.user_emoji_img)" :src="emoji_display_fn(item.user_emoji_img)" alt="" />
                  <div @click="delete_emoji_img(item.id, item.user_emoji_img, index)" class="del_smile_list_item">删除</div>
                </div>
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
        <div @click="cancelUnreadMessage" class="chat_all_unread_message modern-badge animate__animated animate__pulse animate__infinite" v-show="unReadMessages_p.length > 0">
          <DouArrowUp style="transform: rotate(180deg)" />
          &nbsp; {{ unReadMessages_p.length }} 条新消息
        </div>
      </div>
    </nut-popup>

    <!-- ///////////////////////////////私聊 弹出层///////////////////////////////////////////// -->
    <nut-popup v-model:visible="privateChatAllPopupState" position="right" :style="{ width: '100%', height: '100%' }">
      <!-- 顶部栏 -->
      <div class="chat_all_top modern-header">
        <div class="chat_all_top_txt">
          <RectLeft @click="closePrivateChatPopup" width="4.8vw" height="4.8vw" color="#fff" />
          <div class="avatar-wrapper">
            <img :src="private_user.user_img" alt="" />
            <span v-if="private_user.online" class="online-indicator"></span>
            <span v-else class="offline-indicator"></span>
          </div>
          <div class="chat_all_top_state">
            <span>{{ private_user.user_people }}</span>
            <span><i :class="private_user.online ? 'chat_all_top_dot' : 'chat_all_top_dot_offline'"></i>{{ private_user.online ? "在线" : "离线" }}</span>
          </div>
        </div>
        <MoreX width="4.8vw" height="4.8vw" color="#fff" />
      </div>

      <!-- 私聊内容区域 -->
      <div @touchstart="onPopupTouchStart" @touchmove="onPopupTouchMove" @touchend="onPopupTouchEnd" @click="p_hideAddMenu()" class="chat_all_content modern-chat-bg" ref="private_chat_all_content">
        <!-- 私聊消息列表 -->
        <div class="chat_all_content_info" v-for="(message, index) in private_messages_p" :key="index" :class="{ 'my-message': message.isMine }">
          <div v-show="message.to === private_user.user_people || message.username === private_user.user_people" class="chat_all_content_info_createtime">
            {{ formatChatTime(message.create_time) }}
          </div>
          <div v-show="message.to === private_user.user_people || message.username === private_user.user_people" class="avatar-wrapper small">
            <img :src="message.user_img" alt="" />
          </div>
          <div v-show="message.to === private_user.user_people || message.username === private_user.user_people" class="chat_all_content_info_block">
            <div class="chat_all_content_info_time">{{ message.username }}</div>
            <!-- <div class="chat_all_content_text">{{ message.text }}</div> -->
            <div v-show="message.msg_type == 'text'" class="chat_all_content_text modern-bubble">{{ message.text }}</div>
            <img @click="showBigImg(message.text)" v-show="message.msg_type == 'image'" class="chat_all_content_img modern-image" :src="message.text" alt="" />
          </div>
        </div>
        <!-- 点击图片遮罩层 -->
        <!-- <nut-overlay v-model:visible="showBigImgFlag">
          <div class="overlay-body">
            <img class="overlay-content" :src="showBigImgUrl" alt="" />
          </div>
        </nut-overlay> -->

        <!-- 图片预览区域 -->
        <nut-image-preview :show-index="false" :show="showBigImgFlag" :images="[{ src: showBigImgUrl }]" @close="hideBigImg" />
      </div>
      <!--  私聊  底部栏 -->
      <div class="chat_all_bottom modern-input-area" ref="chat_all_bottom">
        <!--私聊  发送消息 -->
        <div class="chat_all_bottom_list">
          <textarea
            id="private_textarea_message"
            v-model="privateMessageText"
            type="text"
            placeholder="说点什么..."
            rows="1"
            @focus="p_activePlaceholderHeight(6.4)"
            @blur="p_cancelPlaceholderHeight(12.8)"
          ></textarea>
          <img @click="p_showSmile" src="../assets/icons/smile.svg" class="private_chat_all_bottom_smile chat_all_bottom_smile" alt="" />
          <Check v-if="privateMessageText.length > 0" @click="sendPrivateMessage" width="7.2vw" height="7.2vw" :color="privateMessageText.length > 0 ? '#667eea' : '#979797'" />
          <CircleClose v-else @click="p_showAddMenu" width="7.2vw" height="7.2vw" style="transform: rotate(45deg)" :color="addBtnFlag ? '#667eea' : '#979797'" />
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
          <!-- 私聊 表情列表 -->
          <div class="chat_bottom_tool_smile_list">
            <!-- 渲染表情 -->
            <div class="smile_list_item_like" v-show="smileTitleIndex == 0">
              <div class="smile_list_item_like_add private_smile_list_item_like_add">
                <Uploader style="width: 6.4vw; height: 6.4vw; color: #ccc"></Uploader>
                <input type="file" accept="image/*" @change="p_changeSelectEmojiImg" />
              </div>
              <div class="smile_list_item_content" v-for="(item, index) in userEmojiData" :key="index">
                <div class="mile_list_item_container">
                  <img @click="p_selectEmojiImg(item.user_emoji_img)" :src="emoji_display_fn(item.user_emoji_img)" alt="" />
                  <div @click="delete_emoji_img(item.id, item.user_emoji_img, index)" class="del_smile_list_item">删除</div>
                </div>
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
import { ref, onMounted, onUnmounted, computed, createVNode, watch } from "vue";
import "animate.css"; // 引入 Animate.css
import { useRouter } from "vue-router"; // 引入路由
// 引入 Pinia store
import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";
const store = useCounterStore(); // 可以在组件中的任意位置访问 `store` 变量 ✨
const { userInfo, unReadMessages_p, messages_p, onlineUser_p, unprivateMessages_p, private_messages_p } = storeToRefs(store); // 使用 storeToRefs 解构 store 中的响应式属性
const router = useRouter(); // 路由实例

import { CONFIG } from "../config"; // 引入配置文件
import { getOnlineUser, addOnlineUser, deleteOnlineUser, addUserEmoji, getUserEmoji, deleteUserEmoji, getGroupMessagesAPI, getPrivateMessagesAPI } from "../api/allApi"; // 引入所有 API
// 导入dayjs
import dayjs from "dayjs";
import { uploadFile, deleteFile } from "../utils/oss";
import emojiCategories from "../utils/emoji"; // 引入表情工具函数
import { showToast } from "@nutui/nutui";

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

const showBigImgFlag = ref(false); // 是否显示大图
const showBigImgUrl = ref(""); // 大图 URL

// 存储每个用户的最后一条私聊消息
const userLastMessages = ref({}); // { username: message }

// 在线状态映射表
const onlineStatusMap = ref({}); // { username: boolean }

// 所有聊天过的用户(包含在线和离线)
const allChatUsers = computed(() => {
  // 获取所有有私聊消息的用户
  const chatUsernames = new Set();

  // 从私聊消息中提取用户
  private_messages_p.value.forEach((msg) => {
    if (msg.username !== username.value) {
      chatUsernames.add(msg.username);
    }
    if (msg.to && msg.to !== username.value) {
      chatUsernames.add(msg.to);
    }
  });

  // 从未读消息中提取用户
  unprivateMessages_p.value.forEach((msg) => {
    if (msg.from && msg.from !== username.value) {
      chatUsernames.add(msg.from);
    }
  });

  // 合并在线用户
  const allUsers = [];
  const processedUsers = new Set();

  // 先添加在线用户
  onlineUser_p.value.forEach((user) => {
    if (!processedUsers.has(user.user_people)) {
      allUsers.push({
        ...user,
        online: true,
      });
      processedUsers.add(user.user_people);
      chatUsernames.delete(user.user_people);
    }
  });

  // 再添加离线用户(有聊天记录但不在线的)
  chatUsernames.forEach((userName) => {
    if (!processedUsers.has(userName)) {
      // 从最后的消息中获取用户头像
      const lastMsg = userLastMessages.value[userName] || [...private_messages_p.value].reverse().find((msg) => msg.username === userName || msg.to === userName);

      allUsers.push({
        user_people: userName,
        user_img: lastMsg?.user_img || userInfo.value.u_avatar,
        create_time: lastMsg?.create_time || new Date().toISOString(),
        online: false,
      });
      processedUsers.add(userName);
    }
  });

  // 按最后消息时间排序
  return allUsers.sort((a, b) => {
    const timeA = get_last_private_message(a)?.create_time || a.create_time;
    const timeB = get_last_private_message(b)?.create_time || b.create_time;
    return new Date(timeB) - new Date(timeA);
  });
});

// *************************************************************************************************

// 格式化最后一条消息文本
function format_last_message_text(message) {
  if (!message || !message.msg_type) {
    return "暂无新消息";
  }
  if (message.msg_type === "text") {
    return message.text || "暂无新消息";
  } else if (message.msg_type === "image") {
    return "[图片]";
  } else {
    return "未知消息类型";
  }
}

// 获取指定用户的未读消息数量
function getUnreadCount(userName) {
  return unprivateMessages_p.value.filter((msg) => msg.from === userName).length;
}

// 删除表情包图片
async function delete_emoji_img(id, url, index) {
  const path = url.split(".com/")[1].split("?")[0];
  // console.log("删除表情包图片", id, path);

  try {
    await deleteFile(path);
    // console.log("OSS上的表情包图片已删除");

    const res = await deleteUserEmoji(id);
    if (res.code === 200) {
      // 删除成功后从 userEmojiData 中移除对应的表情
      userEmojiData.value = userEmojiData.value.filter((item) => item.id !== id);
      showToast.success("表情包图片已删除");
    } else {
      console.error("删除表情包图片失败", res);
    }
  } catch (error) {
    // console.error("删除OSS上的表情包图片失败", error);
    showToast.error("删除OSS图片失败");
  }
}

// 点击图片显示大图
function showBigImg(url) {
  showBigImgUrl.value = url; // 设置大图 URL
  showBigImgFlag.value = true; // 显示大图弹出层
}

function hideBigImg() {
  showBigImgFlag.value = false; // 隐藏大图弹出层
}

function onPopupTouchStart(e) {
  const touchObj = e.touches[0];
  touch.value = { x: touchObj.clientX, y: touchObj.clientY, moved: false };
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
    showBigImgFlag.value = false; // 关闭大图弹出层
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

// 私聊 表情包显示
function emoji_display_fn(url) {
  if (url.split(".").pop() != "jpg" && url.split(".").pop() != "png") {
    return url;
  }

  return url + "?x-oss-process=image/resize,l_100";
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
  // 重置滚动位置到顶部
  window.scrollTo(0, 0);

  // 禁止页面滚动
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  // 随机用户名
  username.value = userInfo.value.u_name;

  // 加载群聊历史消息
  loadGroupHistory();

  // 连接
  connect();

  // 未读消息合并到 messages_p 中
  // if (unReadMessages_p.value.length > 0) {
  //   unReadMessages_p.value.forEach((item) => {
  //     messages_p.value.push({
  //       text: item.message,
  //       isMine: item.from === username.value,
  //       username: item.from,
  //       create_time: item.create_time,
  //       user_img: item.user_img,
  //     });
  //   });
  // }

  // 本地获取在线用户列表
  getOnlineUser().then((res) => {
    console.log("首次进入页面加载数据", res.data);
    if (res.code === 200) {
      // 排除自己,不可以和自己单聊
      onlineUser_p.value = res.data.filter((user) => user.user_people !== username.value);
      console.log("过滤后的在线用户列表", onlineUser_p.value);

      // 为每个在线用户加载最后一条私聊消息
      loadAllUsersLastMessages();
    }
  });

  // 获取用户表情数据
  getUserEmoji(userInfo.value.id).then((res) => {
    if (res.code === 200) {
      userEmojiData.value = res.data;
      // console.log("用户表情数据", userEmojiData.value);
    }
  });

  // 监听浏览器返回按钮
  window.addEventListener("popstate", handlePopState);
});

// 处理浏览器返回事件
function handlePopState(event) {
  // 检查是否有弹窗打开
  if (showBigImgFlag.value) {
    // 如果大图弹窗打开，关闭它
    event.preventDefault();
    hideBigImg();
    history.pushState(null, "", location.href); // 保持在当前页面
  } else if (chatAllPopupState.value) {
    // 如果群聊弹窗打开，关闭它
    event.preventDefault();
    closeChatAllPopup();
    history.pushState(null, "", location.href); // 保持在当前页面
  } else if (privateChatAllPopupState.value) {
    // 如果私聊弹窗打开，关闭它
    event.preventDefault();
    closePrivateChatPopup();
    history.pushState(null, "", location.href); // 保持在当前页面
  }
  // 如果没有弹窗打开，则允许正常返回
}

// 监听弹窗状态变化，当弹窗打开时添加历史记录
watch([chatAllPopupState, privateChatAllPopupState, showBigImgFlag], ([chatAll, privateChat, bigImg], [oldChatAll, oldPrivateChat, oldBigImg]) => {
  // 如果任何弹窗从关闭变为打开，添加一个历史记录
  if ((chatAll && !oldChatAll) || (privateChat && !oldPrivateChat) || (bigImg && !oldBigImg)) {
    history.pushState(null, "", location.href);
  }
});

// 组件卸载时恢复页面滚动
onUnmounted(() => {
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
  // 移除返回按钮监听
  window.removeEventListener("popstate", handlePopState);
});

// 函数 加载群聊历史消息
async function loadGroupHistory() {
  try {
    const res = await getGroupMessagesAPI(100, 0);
    if (res.success) {
      console.log("加载群聊历史消息", res.data);
      // 将历史消息转换为前端格式
      const historyMessages = res.data.map((msg) => ({
        msg_type: msg.msg_type,
        text: msg.message,
        isMine: msg.from_user === username.value,
        username: msg.from_user,
        create_time: msg.create_time,
        user_img: msg.user_img,
      }));
      // 将历史消息添加到消息列表（在前面）
      messages_p.value = [...historyMessages];
      console.log("群聊历史消息加载完成", messages_p.value);
    }
  } catch (error) {
    console.error("加载群聊历史消息失败:", error);
  }
}

// 函数 加载私聊历史消息
async function loadPrivateHistory(otherUser) {
  try {
    const res = await getPrivateMessagesAPI(username.value, otherUser, 100, 0);
    if (res.success) {
      console.log("加载私聊历史消息", res.data);
      // 将历史消息转换为前端格式
      const historyMessages = res.data.map((msg) => ({
        msg_type: msg.msg_type,
        text: msg.message,
        isMine: msg.from_user === username.value,
        to: msg.to_user,
        username: msg.from_user,
        create_time: msg.create_time,
        user_img: msg.user_img,
      }));
      // 清空当前私聊消息列表，替换为历史消息
      private_messages_p.value = [...historyMessages];
      console.log("私聊历史消息加载完成", private_messages_p.value);

      // 滚动到底部
      setTimeout(() => {
        if (private_chat_all_content.value) {
          private_chat_all_content.value.scrollTop = private_chat_all_content.value.scrollHeight;
        }
      }, 100);
    }
  } catch (error) {
    console.error("加载私聊历史消息失败:", error);
  }
}

// 函数 为所有在线用户加载最后一条消息
async function loadAllUsersLastMessages() {
  for (const user of onlineUser_p.value) {
    try {
      const res = await getPrivateMessagesAPI(username.value, user.user_people, 1, 0);
      if (res.success && res.data.length > 0) {
        const lastMsg = res.data[0];
        userLastMessages.value[user.user_people] = {
          msg_type: lastMsg.msg_type,
          text: lastMsg.message,
          isMine: lastMsg.from_user === username.value,
          to: lastMsg.to_user,
          username: lastMsg.from_user,
          create_time: lastMsg.create_time,
          user_img: lastMsg.user_img,
        };
      }
    } catch (error) {
      console.error(`加载用户 ${user.user_people} 的最后一条消息失败:`, error);
    }
  }
}

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

    // 处理在线用户列表
    if (data.type === "online_users") {
      // 服务器返回的当前在线用户列表
      data.users.forEach((user) => {
        const exists = onlineUser_p.value.some((u) => u.user_people === user.user_people);
        if (!exists) {
          onlineUser_p.value.push(user);
        }
        onlineStatusMap.value[user.user_people] = true;
      });
      return;
    }

    // 如果是在线用户列表更新
    if (data.type === "info") {
      if (data.user_state === "join") {
        const exists = onlineUser_p.value.some((user) => user.user_people === data.user_people);
        if (!exists && data.user_people !== username.value) {
          onlineUser_p.value.push({
            user_people: data.user_people,
            user_img: data.user_img,
            create_time: data.create_time,
            online: true,
          });
        }
        onlineStatusMap.value[data.user_people] = true;
      } else if (data.user_state === "close") {
        // 用户退出 - 更新在线状态但不从列表中删除
        onlineUser_p.value = onlineUser_p.value.filter((user) => user.user_people !== data.user_people);
        onlineStatusMap.value[data.user_people] = false;
      }
      return;
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
      } else if (data.type === "private") {
        // 私聊弹窗 打开了
        if (privateChatAllPopupState.value) {
          if (privateTo.value !== data.from) {
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
        } else {
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
    }

    // 私聊消息
    if (data.type === "private") {
      const newMessage = {
        text: data.message,
        to: data.to,
        isMine: data.from === username.value,
        username: data.from,
        create_time: data.create_time,
        user_img: data.user_img,
        msg_type: data.msg_type,
      };

      private_messages_p.value.push(newMessage);

      // 更新发送者的最后一条消息缓存
      userLastMessages.value[data.from] = newMessage;

      setTimeout(() => {
        // 私聊弹出层打开时，滚动到底部
        if (privateChatAllPopupState.value) {
          private_chat_all_content.value.scrollTop = private_chat_all_content.value.scrollHeight;
        }
      }, 100);
    }
    // 群聊消息
    if (data.type === "group") {
      messages_p.value.push({ msg_type: data.msg_type, text: `${data.message}`, isMine: data.from === username.value, username: data.from, create_time: data.create_time, user_img: data.user_img });

      setTimeout(() => {
        // 如果群聊弹出层是打开状态，则滚动到最底部
        if (chatAllPopupState.value) {
          chat_all_content.value.scrollTop = chat_all_content.value.scrollHeight;
        }
      }, 100);
    }
  };

  ws.value.onerror = (error) => {
    console.error("WebSocket错误:", error);
  };

  ws.value.onclose = () => {
    console.log("WebSocket连接关闭");
    connected.value = false;
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
  console.log("发送私聊消息", private_messages_p.value);
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

    // 更新该用户的最后一条消息缓存
    userLastMessages.value[privateTo.value] = {
      text: privateMessageText.value,
      isMine: true,
      to: privateTo.value,
      username: username.value,
      create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      user_img: userInfo.value.u_avatar,
      msg_type: "text",
    };

    privateMessageText.value = "";
    p_hideAddMenu(); // 发送消息后隐藏菜单
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
  if (!date) return "";
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

// 函数 格式化聊天弹出层中的时间 - 年月日时分格式
function formatChatTime(date) {
  if (!date) return "";
  const messageDate = new Date(date);
  const year = messageDate.getFullYear();
  const month = (messageDate.getMonth() + 1).toString().padStart(2, "0");
  const day = messageDate.getDate().toString().padStart(2, "0");
  const hours = messageDate.getHours().toString().padStart(2, "0");
  const minutes = messageDate.getMinutes().toString().padStart(2, "0");

  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
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

  // 加载私聊历史消息
  loadPrivateHistory(user.user_people);

  // 清除该用户的未读消息
  unprivateMessages_p.value = unprivateMessages_p.value.filter((item) => item.from !== user.user_people);

  // 私聊消息列表滚动到最底部
  setTimeout(() => {
    if (private_chat_all_content.value) {
      private_chat_all_content.value.scrollTop = private_chat_all_content.value.scrollHeight;
    }
  }, 100);
}
// 函数 关闭私聊弹出层
function closePrivateChatPopup() {
  // 在关闭前，保存当前对话的最后一条消息到缓存
  if (privateTo.value && private_messages_p.value.length > 0) {
    const userMessages = private_messages_p.value.filter((msg) => {
      return msg.username === privateTo.value || msg.to === privateTo.value;
    });

    if (userMessages.length > 0) {
      userLastMessages.value[privateTo.value] = userMessages[userMessages.length - 1];
    }
  }

  privateChatAllPopupState.value = false;
}

// 函数 获取与特定用户的最后一条私聊消息
function get_last_private_message(user) {
  // 优先从当前私聊消息列表中查找
  const userMessages = private_messages_p.value.filter((msg) => {
    return msg.username === user.user_people || msg.to === user.user_people;
  });

  if (userMessages.length > 0) {
    return userMessages[userMessages.length - 1];
  }

  // 如果当前列表没有，从缓存中获取历史记录
  if (userLastMessages.value[user.user_people]) {
    return userLastMessages.value[user.user_people];
  }

  return null;
}
</script>

<style lang="scss" scoped>
.Chat {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(to bottom, #f8f9ff 0%, #ffffff 100%);
  font-family: "pingfang", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  /* Tab Pane 背景设置 - 与主题保持一致 */
  :deep(.nut-tab-pane) {
    background: transparent !important;
  }

  /* 头部样式 - 与首页一致 */
  .chat-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 20px 16px;
    border-radius: 0 0 24px 24px;
    margin: 0 0 16px 0;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  }

  .header-bg-decoration {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
  }

  .header-bg-decoration::before {
    content: "";
    position: absolute;
    bottom: -80px;
    left: -100px;
    width: 180px;
    height: 180px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    animation: float 8s ease-in-out infinite reverse;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .header-icon {
    font-size: 32px;
    animation: sparkle 3s ease-in-out infinite;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  .header-text {
    flex: 1;
  }

  .title {
    font-size: 5.6vw;
    font-weight: 700;
    margin-bottom: 4px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .subtitle {
    font-size: 3.2vw;
    opacity: 0.9;
    font-weight: 400;
  }

  .header-right {
    display: flex;
    align-items: center;
  }

  .online-count {
    font-size: 3.2vw;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
  }

  @keyframes sparkle {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
    50% {
      transform: scale(1.1) rotate(10deg);
      opacity: 0.8;
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0) translateX(0);
    }
    50% {
      transform: translateY(-20px) translateX(10px);
    }
  }

  :deep(.nut-tabs__content) {
    height: calc(100vh - 21.3333vw - 18.9333vw);
    background: transparent;
    overflow: visible;
  }

  :deep(.nut-tabs__titles) {
    background: transparent;
    padding: 0 16px;
  }

  :deep(.nut-tabs__titles-item) {
    font-weight: 600;
  }

  :deep(.nut-tabs__content__pane) {
    overflow-y: auto;
    height: 100%;
    padding-bottom: 20px;
  }
  .ellipsis {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: middle;
  }

  /* 搜索框样式 */
  .search_all {
    position: relative;
    margin: 0 12px 16px;

    .search {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      width: 100%;
      height: 10.9333vw;
      border-radius: 12px;
      border: none;
      background: #fff;
      box-shadow: 0 2px 12px rgba(102, 126, 234, 0.1);
      outline: none;
      padding-left: 12.8vw;
      font-size: 3.7333vw;
      transition: all 0.3s ease;

      &::placeholder {
        color: rgba(153, 153, 153, 1);
        font-size: 3.7333vw;
      }

      &:focus {
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
        transform: translateY(-1px);
      }
    }

    .search_img {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 4vw;
      width: 4.4453vw;
      height: 4.4453vw;
      opacity: 0.5;
    }
  }

  /* 现代化卡片样式 */
  .modern-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(102, 126, 234, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 12px;

    &:hover {
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  /* 头像包装器 */
  .avatar-wrapper {
    position: relative;
    width: 12.8vw;
    height: 12.8vw;
    margin-left: 4.2667vw;
    margin-right: 3.2vw;

    &.small {
      width: 8.5333vw;
      height: 8.5333vw;
      margin-right: 2.1333vw;
    }

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .online-indicator {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 3vw;
      height: 3vw;
      background: linear-gradient(135deg, #43e97b, #38f9d7);
      border: 2px solid #fff;
      border-radius: 50%;
      animation: pulse-indicator 2s ease-in-out infinite;
    }

    .offline-indicator {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 3vw;
      height: 3vw;
      background: #ccc;
      border: 2px solid #fff;
      border-radius: 50%;
    }
  }

  @keyframes pulse-indicator {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(67, 233, 123, 0.7);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(67, 233, 123, 0);
    }
  }

  /* 徽章通知 */
  .badge-notification {
    background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
    color: #fff;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(238, 90, 111, 0.4);
    animation: badge-pulse 2s ease-in-out infinite;
  }

  @keyframes badge-pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  /* 聊天名称和预览文本 */
  .chat-name-row {
    display: flex;
    justify-content: flex-start;
    align-items: baseline;
    width: 100%;
    margin-bottom: 0.8vw;
    gap: 1.3333vw;
  }

  .chat-name {
    font-size: 3.7333vw;
    font-weight: 600;
    color: #2c3e50;
  }

  .chat-preview {
    font-size: 2.9333vw;
    font-weight: 400;
    color: #8c8c8c;
    line-height: 1.4;
  }
  /* 聊天内容区域 */
  .chat_all_content {
    height: calc(100vh - 21.3333vw - 14.9333vw);
    overflow: auto;
    padding: 3.2vw 6.4vw 0;
    box-sizing: border-box;
    white-space: pre-wrap;

    &.modern-chat-bg {
      background: linear-gradient(to bottom, #fafbff 0%, #ffffff 100%);
    }
    .chat_all_content_noitfy {
      height: 5.3333vw;
      font-size: 4vw;
      font-weight: 400;
      letter-spacing: 0;
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
        border-radius: 12px;
        object-fit: cover;
        cursor: pointer;
        transition: transform 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        &.modern-image {
          border-radius: 12px;

          &:hover {
            transform: scale(1.05);
          }
        }
      }
      object-position: left center;
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
      border-radius: 12px 12px 12px 4px;
      background: #fff;
      padding: 2.6667vw 3.7333vw;
      font-size: 4.2667vw;
      line-height: 5.8667vw;
      box-sizing: border-box;
      max-width: 74.6667vw;
      word-wrap: break-word;
      min-height: 10.1333vw;
      text-align: left;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.2s ease;

      &.modern-bubble {
        background: #fff;
        border: 1px solid #f0f0f0;
      }
    }
    .chat_all_content_info_time {
      font-size: 3.2vw;
      transform: translateY(-1.6vw);
      color: rgba(175, 175, 175, 1);
      padding: 0 1.3333vw;
    }
  }
  .overlay-body {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    .overlay-content {
      width: 80%;
    }
  }
  .my-message {
    justify-content: flex-start;
    flex-direction: row-reverse;

    .avatar-wrapper {
      margin-left: 2.1333vw;
      margin-right: 0;
    }

    .chat_all_content_info_block {
      text-align: right;

      .chat_all_content_img {
        border-radius: 12px;

        &.modern-image {
          object-position: right center;
        }
      }

      .chat_all_content_text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border-radius: 12px 12px 4px 12px;
        border: none;
        box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);

        &.modern-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      }
    }
    .chat_all_content_info_time {
      text-align: right;
    }
  }
}
/* 底部输入区域 */
.chat_all_bottom {
  position: fixed;
  bottom: 0;
  width: 100vw;
  height: 65vw;
  border-radius: 20px 20px 0 0;
  background: #fff;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  padding: 4.2667vw 0;
  box-sizing: border-box;
  transform: translateY(43.6667vw);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.modern-input-area {
    background: #fff;
    border-top: 1px solid #f0f0f0;
  }

  .chat_all_unread_message {
    display: flex;
    align-items: center;
    position: absolute;
    top: -15%;
    right: 3%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    font-size: 3.7333vw;
    font-weight: 600;
    padding: 2.1333vw 4.2667vw;
    border-radius: 10.3333vw;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    cursor: pointer;

    &.modern-badge {
      background: linear-gradient(135deg, #667eea, #764ba2);

      &:active {
        transform: scale(0.95);
      }
    }
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
          overflow: auto;
          /* 透明滚动条 */
          &::-webkit-scrollbar {
            display: none; /* Chrome/Safari/Opera */
          }
          .mile_list_item_container {
            width: 25.6vw;
            height: 12.8vw;
            display: flex;
            img {
              width: 12.8vw;
              height: 12.8vw;
            }
            .del_smile_list_item {
              width: 12.8vw;
              height: 12.8vw;
              text-align: center;
              line-height: 12.8vw;
              background-color: #f92b25;
              color: #fff;
              font-weight: 600;
              font-size: 3.2vw;
              border-radius: 50%;
            }
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
    padding: 0 16px;

    .chat_all_bottom_smile {
      width: 8.2vw;
      height: 8.2vw;
      cursor: pointer;
      transition: transform 0.2s ease;

      &:active {
        transform: scale(0.9);
      }
    }
  }

  textarea {
    width: 72.2667vw;
    height: 12.8vw;
    line-height: 12.8vw;
    outline: none;
    border: 1px solid #e8e8e8;
    border-radius: 20px;
    background: #f8f9fa;
    padding: 0 4.2667vw;
    box-sizing: border-box;
    font-size: 4.2667vw;
    transition: all 0.3s ease;
    resize: none;
    overflow: hidden;

    /* 隐藏滚动条 */
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;

    &:focus {
      background: #fff;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      font-size: 4.2667vw;
      font-weight: 400;
      color: rgba(175, 175, 175, 1);
      text-align: left;
      vertical-align: top;
    }
  }
}
/* 聊天弹出层顶部栏 */
.chat_all_top {
  padding: 3.2vw 6.4vw;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 14.9333vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  color: #fff;

  &.modern-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .chat_all_top_txt {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .chat_all_top_state {
    display: flex;
    flex-direction: column;

    span {
      &:nth-child(1) {
        font-size: 4.2vw;
        font-weight: 600;
        color: #fff;
      }
      &:nth-child(2) {
        font-size: 3.2vw;
        color: rgba(255, 255, 255, 0.9);
        vertical-align: bottom;
      }

      .chat_all_top_dot {
        display: inline-block;
        width: 2.1333vw;
        height: 2.1333vw;
        background: linear-gradient(135deg, #43e97b, #38f9d7);
        border-radius: 50%;
        margin-right: 1.0667vw;
        box-shadow: 0 0 6px rgba(67, 233, 123, 0.5);
      }

      .chat_all_top_dot_offline {
        display: inline-block;
        width: 2.1333vw;
        height: 2.1333vw;
        background: #ccc;
        border-radius: 50%;
        margin-right: 1.0667vw;
      }
    }
  }
}

/* 聊天列表卡片 */
.qunliao_list {
  width: calc(100% - 24px);
  height: 21.3333vw;
  margin: 0 12px 12px;
  padding: 3.2vw;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  cursor: pointer;

  .qunliao_list_info {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;

    .qunliao_list_info_txt {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;

      .chat_all_top_dot {
        display: inline-block;
        width: 2.1333vw;
        height: 2.1333vw;
        background: linear-gradient(135deg, #43e97b, #38f9d7);
        border-radius: 50%;
        margin-right: 1.0667vw;
        box-shadow: 0 0 6px rgba(67, 233, 123, 0.5);
      }

      span {
        display: block;

        &:nth-child(1) {
          font-size: 3.7333vw;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.8vw;
        }

        &:nth-child(2) {
          font-size: 2.9333vw;
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1.4;
          color: #8c8c8c;
        }
      }

      .qunliao_list_info_txt_time {
        font-size: 2.6667vw;
        font-weight: 400;
        letter-spacing: 0;
        line-height: 3.7333vw;
        color: rgba(160, 160, 160, 1);
        white-space: nowrap;
        flex-shrink: 0;
      }

      .online-status-text {
        font-size: 2.6667vw;
        font-weight: 500;
        padding: 0.5333vw 1.6vw;
        border-radius: 8px;
        flex-shrink: 0;

        &.status-online {
          color: #43e97b;
          background: rgba(67, 233, 123, 0.1);
        }

        &.status-offline {
          color: #999;
          background: rgba(153, 153, 153, 0.1);
        }
      }
    }
  }

  .qunliao_list_message {
    position: absolute;
    right: 4vw;
    top: 50%;
    margin-top: -3.2vw;
    min-width: 6.4vw;
    height: 6.4vw;
    padding: 0 2vw;
    border-radius: 10px;
    background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
    text-align: center;
    color: #fff;
    font-size: 3.2vw;
    font-weight: 600;
    line-height: 6.4vw;
    box-shadow: 0 2px 8px rgba(238, 90, 111, 0.4);
  }
}

.private_qunliao_list {
  .private_qunliao_list_message2 {
    min-width: 6.4vw;
    height: 6.4vw;
    padding: 0 2vw;
    border-radius: 10px;
    background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
    text-align: center;
    color: #fff;
    font-size: 3.2vw;
    font-weight: 600;
    line-height: 6.4vw;
    box-shadow: 0 2px 8px rgba(238, 90, 111, 0.4);
  }

  .private_qunliao_list_message {
    position: absolute;
    right: 4vw;
    top: 50%;
    transform: translateY(-50%);
  }

  /* PC端适配：固定宽度为375px */
  @media (min-width: 768px) {
    .chat_all_bottom {
      width: 375px;
      left: 50%;
      transform: translateX(-50%) translateY(43.6667vw);
    }
  }
}
</style>
