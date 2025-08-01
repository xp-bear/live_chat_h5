import OSS from "ali-oss";
import { CONFIG } from "../config/index.js";
export function createOSSClient() {
  return new OSS(CONFIG.oss);
}

/**
 * 上传文件到OSS
 * @param {File} file 文件对象
 * @param {string} path 存储路径
 * @returns {Promise<string>} 返回文件URL
 */
export async function uploadFile(file, path = "images/") {
  const client = createOSSClient();
  const fileName = `${path}${Date.now()}_${file.name}`;

  try {
    const result = await client.put(fileName, file);
    return result.url;
  } catch (error) {
    console.error("上传失败:", error);
    throw error;
  }
}

// 根据文件名删除oss对象文件
export async function deleteFile(fileName) {
  const client = createOSSClient();
  try {
    await client.delete(fileName);
    console.log(`文件 ${fileName} 删除成功`);
  } catch (error) {
    console.error(`删除文件 ${fileName} 失败:`, error);
    throw error;
  }
}
