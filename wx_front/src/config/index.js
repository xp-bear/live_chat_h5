export const CONFIG = {
  development: {
    BASE_API: "http://192.168.1.4:5201", // API 地址
    WS_API: "ws://192.168.1.4:5200", // WebSocket 地址
  },
  production: {
    BASE_API: "https://api.example.com",
  },
  oss: {
    region: "oss-cn-wuhan-lr", // 你的OSS region
    accessKeyId: "", // 替换为你的accessKeyId
    accessKeySecret: "", // 替换为你的accessKeySecret
    bucket: "xp-cdn-oss", // 替换为你的bucket名称
  },
};
