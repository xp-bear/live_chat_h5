const OSS = require("ali-oss");
require("dotenv").config();
(async () => {
  try {
    if (!process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET || !process.env.OSS_BUCKET) {
      console.log("NOT_CONFIGURED");
      process.exit(0);
    }
    const client = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
    });
    const key = `posts/test_upload_${Date.now()}.txt`;
    const result = await client.put(key, Buffer.from("hello oss test"));
    console.log("PUT_OK", result && result.url ? result.url : result);
  } catch (err) {
    console.error("ERR", err && err.message ? err.message : err);
    if (err && err.code) console.error("CODE", err.code);
    process.exit(1);
  }
})();
