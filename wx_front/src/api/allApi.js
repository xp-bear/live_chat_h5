import request from "./request";

// 1.创建用户
export function createUser(data) {
  return request({
    url: "/api/create_user",
    method: "post",
    data,
  });
}
// 2.登录用户
export function loginUser(data) {
  return request({
    url: "/api/login_user",
    method: "post",
    data,
  });
}

// 添加用户到在线用户表
export function addOnlineUser(data) {
  return request({
    url: "/api/add_online_user",
    method: "post",
    data,
  });
}
// 清空在线用户表
export function clearOnlineUser() {
  return request({
    url: "/api/clear_online_user",
    method: "post",
  });
}
// 获取在线用户列表
export function getOnlineUser() {
  return request({
    url: "/api/get_online_user",
    method: "get",
  });
}
// 删除在线用户
export function deleteOnlineUser(data) {
  return request({
    url: "/api/delete_online_user",
    method: "post",
    data,
  });
}

// 添加用户表情包
export function addUserEmoji(data) {
  return request({
    url: "/api/add_user_emoji",
    method: "post",
    data,
  });
}

// 获取用户表情包
export function getUserEmoji(userId) {
  return request({
    url: "/api/get_user_emoji",
    method: "get",
    params: { user_id: userId },
  });
}

// 删除用户表情包
export function deleteUserEmoji(id) {
  return request({
    url: "/api/delete_user_emoji",
    method: "post",
    data: { id },
  });
}

// --- 帖子相关接口 ---
export function uploadImageAPI(file) {
  const fd = new FormData();
  fd.append("file", file);
  return request({
    url: "/api/upload_image",
    method: "post",
    data: fd,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function createPostAPI(data) {
  return request({ url: "/api/create_post", method: "post", data });
}

export function getPostsAPI(page = 1, pageSize = 10) {
  return request({ url: "/api/get_posts", method: "get", params: { page, pageSize } });
}

export function addCommentAPI(data) {
  return request({ url: "/api/add_comment", method: "post", data });
}

export function getCommentsAPI(post_id, page = 1, pageSize = 10) {
  return request({ url: "/api/get_comments", method: "get", params: { post_id, page, pageSize } });
}

export function likePostAPI(data) {
  return request({ url: "/api/like_post", method: "post", data });
}

export function deletePostAPI(data) {
  return request({ url: "/api/delete_post", method: "post", data });
}

export function getMyLikedPostsAPI(user_id) {
  return request({ url: "/api/get_my_liked_posts", method: "get", params: { user_id } });
}

export function getMyCommentedPostsAPI(user_id) {
  return request({ url: "/api/get_my_commented_posts", method: "get", params: { user_id } });
}

// --- 聊天记录相关接口 ---
// 获取群聊历史消息
export function getGroupMessagesAPI(limit = 100, offset = 0) {
  return request({
    url: "/api/chat/messages/group",
    method: "get",
    params: { limit, offset },
  });
}

// 获取私聊历史消息
export function getPrivateMessagesAPI(user1, user2, limit = 100, offset = 0) {
  return request({
    url: "/api/chat/messages/private",
    method: "get",
    params: { user1, user2, limit, offset },
  });
}

// 获取私聊会话列表
export function getPrivateChatListAPI(username) {
  return request({
    url: "/api/chat/conversations",
    method: "get",
    params: { username },
  });
}

// 保存消息（备用，主要通过WebSocket自动保存）
export function saveMessageAPI(data) {
  return request({
    url: "/api/chat/messages",
    method: "post",
    data,
  });
}

// 标记消息为已读
export function markMessagesAsReadAPI(messageIds) {
  return request({
    url: "/api/chat/messages/read",
    method: "put",
    data: { messageIds },
  });
}

// 更新用户头像
export function updateUserAvatarAPI(data) {
  return request({
    url: "/api/update_user_avatar",
    method: "post",
    data,
  });
}
