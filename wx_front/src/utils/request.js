import axios from "axios";

// 创建一个axios实例
const instance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 3000,
  headers: { "Content-Type": "application/json;charset=UTF-8" },
});

// 请求拦截
instance.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截
instance.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response.data;
    }
    return Promise.reject(response.data);
  },
  (error) => {
    const status = error.response.status;
    switch (status) {
      case 401:
        // 用户没有权限
        break;
      case 500:
        // 服务器发生错误
        break;
      case 404:
        // Not Found
        break;
      case 504:
        // 网关超时
        break;
      case 400:
        // 请求有误
        break;
    }
    return Promise.reject(error);
  }
);

// 封装Post和Get请求
export function request(method = "GET", url = "", params = {}) {
  return new Promise((resolve, reject) => {
    let promise;
    if (method.toUpperCase() === "GET") {
      promise = instance({
        url,
        params,
      });
    } else if (method.toUpperCase() === "POST") {
      promise = instance({
        method,
        url,
        data: params,
      });
    }

    promise
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// 封装取消请求的函数
export function createCancelToken() {
  const source = axios.CancelToken.source();
  return source;
}

/*使用示例

import { request, createCancelToken } from "@/utils/request";

const cancelTokenSource = createCancelToken();

request("GET", "/some-endpoint", {}, cancelTokenSource.token)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    if (axios.isCancel(error)) {
      console.log("Request canceled", error.message);
    } else {
      console.error(error);
    }
  });

// 取消请求
cancelTokenSource.cancel("Operation canceled by the user.");

 */
