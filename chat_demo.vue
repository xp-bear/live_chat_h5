<template>
  <div>
    <h2>WebSocket Chat</h2>
    <input v-model="username" placeholder="输入用户名" />
    <button @click="connect">连接</button>

    <div v-if="connected">
      <input v-model="message" placeholder="输入消息" />
      <button @click="sendGroupMessage">发送群聊</button>
      <input v-model="privateTo" placeholder="私聊对象" />
      <button @click="sendPrivateMessage">发送私聊</button>

      <div>
        <h3>消息列表</h3>
        <div v-for="(msg, index) in messages" :key="index">{{ msg }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const ws = ref(null);
    const username = ref("");
    const message = ref("");
    const privateTo = ref("");
    const messages = ref([]);
    const connected = ref(false);

    const connect = () => {
      if (!username.value) {
        alert("请输入用户名");
        return;
      }
      ws.value = new WebSocket("ws://localhost:5200");

      ws.value.onopen = () => {
        connected.value = true;
        ws.value.send(JSON.stringify({ type: "join", username: username.value }));
      };

      ws.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        messages.value.push(`${data.from ? data.from + ": " : ""}${data.message}`);
      };
    };

    const sendGroupMessage = () => {
      if (ws.value && message.value) {
        ws.value.send(JSON.stringify({ type: "group", from: username.value, message: message.value }));
        message.value = "";
      }
    };

    const sendPrivateMessage = () => {
      if (ws.value && privateTo.value && message.value) {
        ws.value.send(JSON.stringify({ type: "private", from: username.value, to: privateTo.value, message: message.value }));
        messages.value.push(`(私聊给 ${privateTo.value}): ${message.value}`);
        message.value = "";
      }
    };

    return { username, message, privateTo, messages, connected, connect, sendGroupMessage, sendPrivateMessage };
  },
};
</script>
