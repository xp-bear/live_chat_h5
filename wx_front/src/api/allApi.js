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
