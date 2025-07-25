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

// // 获取用户信息
// export function getInfo() {
//   return request({
//     url: "/user/info",
//     method: "get",
//     params
//   });
// }
