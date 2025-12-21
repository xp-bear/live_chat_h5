<template>
  <div class="new-post">
    <textarea ref="textareaRef" v-model="content" placeholder="说点什么..." rows="3"></textarea>

    <div class="controls">
      <div class="left-controls">
        <label class="upload-btn" :aria-disabled="images.length >= 9">
          🖼️ 图片 <small v-if="images.length < 9">(还可传 {{ 9 - images.length }} 张)</small>
          <input type="file" accept="image/*" multiple @change="onFileChange" :disabled="images.length >= 9" />
        </label>
        <button class="emoji-btn" @click="showEmojiPicker = !showEmojiPicker">😀 表情</button>
      </div>
      <button class="primary-btn" :disabled="!canPublish || uploading" @click="publish">{{ uploading ? "上传中..." : "发布" }}</button>
    </div>

    <!-- 表情选择器 -->
    <transition name="emoji-slide">
      <div class="emoji-picker" v-if="showEmojiPicker">
        <div class="emoji-tabs">
          <button v-for="(cat, key) in emojiCategoryNames" :key="key" :class="{ active: activeCategory === key }" @click="activeCategory = key">
            {{ cat.icon }}
          </button>
        </div>
        <div class="emoji-grid">
          <button v-for="(emoji, idx) in currentEmojis" :key="idx" class="emoji-item" @click="insertEmoji(emoji)">
            {{ emoji }}
          </button>
        </div>
      </div>
    </transition>

    <div class="previews" v-if="images.length">
      <div class="thumb" v-for="(img, i) in images" :key="i">
        <img :src="img" />
        <button class="del" @click="removeImage(i)">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useCounterStore } from "@/stores/counter";
import { uploadImageAPI, createPostAPI } from "@/api/allApi";
import emojiCategories from "@/utils/emoji.js";

const emit = defineEmits(["close"]);

const content = ref("");
const images = ref([]); // store urls
const uploading = ref(false);
const store = useCounterStore();
const textareaRef = ref(null);
const showEmojiPicker = ref(false);
const activeCategory = ref("faces");

// 表情分类名称和图标
const emojiCategoryNames = {
  faces: { name: "笑脸", icon: "😀" },
  gestures: { name: "手势", icon: "👋" },
  animals: { name: "动物", icon: "🐶" },
  foods: { name: "食物", icon: "🍔" },
  activities: { name: "活动", icon: "⚽" },
  travel: { name: "旅行", icon: "✈️" },
  objects: { name: "物品", icon: "💡" },
  symbols: { name: "符号", icon: "❤️" },
  flags: { name: "旗帜", icon: "🏁" },
};

// 当前分类的表情
const currentEmojis = computed(() => emojiCategories[activeCategory.value] || []);

// 插入表情
const insertEmoji = (emoji) => {
  const textarea = textareaRef.value;
  if (textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content.value;
    content.value = text.substring(0, start) + emoji + text.substring(end);
    // 设置光标位置，但不触发focus避免弹出键盘
    setTimeout(() => {
      const newPos = start + emoji.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  } else {
    content.value += emoji;
  }
};

const onFileChange = async (e) => {
  const files = Array.from(e.target.files || []);
  const remaining = 9 - images.value.length; // allow up to 9 images
  if (files.length > remaining) {
    // notify user about limit
    try {
      const { showToast } = await import("@nutui/nutui");
      showToast.warn && showToast.warn("最多只能上传 9 张图片");
    } catch (e) {
      // fallback
      alert("最多只能上传 9 张图片");
    }
  }
  const pick = files.slice(0, remaining);
  if (!pick.length) return;
  uploading.value = true;
  for (const file of pick) {
    // show local preview while uploading
    const preview = URL.createObjectURL(file);
    images.value.push(preview);
    try {
      const res = await uploadImageAPI(file);
      if (res && res.code === 200 && res.data && res.data.url) {
        // replace preview with real url
        const idx = images.value.indexOf(preview);
        if (idx >= 0) images.value.splice(idx, 1, res.data.url);
      } else {
        // remove preview
        const idx = images.value.indexOf(preview);
        if (idx >= 0) images.value.splice(idx, 1);
        console.warn("upload failed", res);
      }
    } catch (err) {
      const idx = images.value.indexOf(preview);
      if (idx >= 0) images.value.splice(idx, 1);
      console.error("上传图片失败", err);
    }
  }
  uploading.value = false;
  e.target.value = null;
};

const removeImage = (idx) => {
  images.value.splice(idx, 1);
};

const canPublish = computed(() => content.value.trim() || images.value.length);

const publish = async () => {
  if (!canPublish.value || uploading.value) return;
  const user = store.userInfo || { name: "访客" };
  const payload = {
    user_id: user.id || null,
    author: user.name || user.u_name || "访客",
    u_avatar: user.u_avatar || null, // 添加用户头像
    content: content.value.trim(),
    images: images.value.slice(),
  };
  try {
    const res = await createPostAPI(payload);
    if (res && res.code === 200 && res.data) {
      // emit event with server-returned post
      const e = new CustomEvent("publish", { detail: res.data });
      window.dispatchEvent(e);
      content.value = "";
      images.value = [];
      showEmojiPicker.value = false;
      // 关闭弹窗
      emit("close");
      // 等待弹窗关闭动画完成后滚动到顶部
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 300);
    } else {
      alert("发布失败，请重试");
    }
  } catch (err) {
    console.error(err);
    alert("发布失败，请稍后再试");
  }
};
</script>

<style scoped>
.new-post {
  background: #fff;
  padding: 16px;
  padding-bottom: 80px; /* 增加底部padding，避免被底部导航栏遮挡 */
  border-radius: 0;
  box-sizing: border-box;
  width: 100%;
}
textarea {
  width: 100%;
  resize: none;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #e8e8e8;
  font-size: 3.6vw;
  line-height: 1.5;
  min-height: 120px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  max-width: 100%;
}
textarea:focus {
  outline: none;
  border-color: #1c55ff;
}
.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  gap: 8px;
}
.left-controls {
  display: flex;
  gap: 8px;
  flex: 1;
}
.upload-btn {
  background: rgba(28, 85, 255, 0.08);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 3.4vw;
  color: #1c55ff;
  transition: all 0.2s ease;
  font-weight: 500;
  white-space: nowrap;
}
.upload-btn:hover {
  background: rgba(28, 85, 255, 0.15);
}
.upload-btn small {
  color: #999;
  font-size: 2.8vw;
}
.upload-btn input {
  display: none;
}
.emoji-btn {
  background: rgba(255, 193, 7, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 3.4vw;
  color: #f57c00;
  transition: all 0.2s ease;
  font-weight: 500;
  border: none;
  white-space: nowrap;
}
.emoji-btn:hover {
  background: rgba(255, 193, 7, 0.2);
}
.primary-btn {
  background: var(--primary-gradient);
  color: #fff;
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 3.6vw;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(28, 85, 255, 0.3);
}
.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(28, 85, 255, 0.4);
}
.primary-btn:active {
  transform: translateY(0);
}
.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
.previews {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
}
.thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1; /* make square tiles */
  overflow: hidden;
  border-radius: 8px;
  animation: scaleIn 0.3s ease;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s ease;
}
.thumb:hover img {
  transform: scale(1.05);
}
.thumb .del {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  padding: 4px 8px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
}
.thumb .del:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 表情选择器 */
.emoji-picker {
  margin-top: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
  max-height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.emoji-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}
.emoji-tabs::-webkit-scrollbar {
  height: 2px;
}
.emoji-tabs::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}
.emoji-tabs button {
  background: #fff;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.emoji-tabs button:hover {
  background: #f0f0f0;
}
.emoji-tabs button.active {
  border-color: #1c55ff;
  background: rgba(28, 85, 255, 0.1);
}
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  max-height: 220px;
  overflow-y: auto;
  padding: 4px;
}
.emoji-grid::-webkit-scrollbar {
  width: 6px;
}
.emoji-grid::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}
.emoji-grid::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
.emoji-item {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.emoji-item:hover {
  background: #fff;
  transform: scale(1.2);
}
.emoji-item:active {
  transform: scale(1);
}

/* 表情选择器动画 */
.emoji-slide-enter-active {
  animation: slideDown 0.3s ease;
}
.emoji-slide-leave-active {
  animation: slideUp 0.2s ease;
}
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 300px;
    transform: translateY(0);
  }
}
@keyframes slideUp {
  from {
    opacity: 1;
    max-height: 300px;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
}

/* 移动端优化 */
@media (max-width: 600px) {
  .emoji-grid {
    grid-template-columns: repeat(7, 1fr);
  }
  .emoji-item {
    font-size: 20px;
    padding: 6px;
  }
}
</style>
