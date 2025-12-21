export const CONFIG = {
  development: {
    BASE_API: "http://192.168.1.4:5201", // API 地址
    WS_API: "ws://192.168.1.4:5200", // WebSocket 地址
  },
  oss: {
    region: "your-oss-region", // 你的OSS region
    accessKeyId: "your-access-key-id", // 替换为你的accessKeyId
    accessKeySecret: "your-access-key-secret", // 替换为你的accessKeySecret
    bucket: "your-bucket-name", // 替换为你的bucket名称
  },
};
