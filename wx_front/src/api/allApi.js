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

// // 获取用户信息
// export function getInfo() {
//   return request({
//     url: "/user/info",
//     method: "get",
//     params
//   });
// }
