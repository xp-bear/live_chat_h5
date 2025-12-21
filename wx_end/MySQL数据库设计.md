# 聊天室的数据库设计与实现

## users 表

|  id  | u_name  | u_password | u_sex               | u_createtime |          u_token          | u_avatar         | u_money  | u_saying     | u_location     |
| :--: | :-----: | :--------: | ------------------- | :----------: | :-----------------------: | ---------------- | -------- | ------------ | -------------- |
| 主键 | varchar |  varchar   | int                 |     time     |          varchar          | varchar          | int      | varchar      | varchar        |
| 自增 | 用户名  |    密码    | 性别<br />0-男 1-女 | 用户创建时间 | 用户登录的过期 token 时间 | 用户默认头像链接 | 用户金币 | 用户个性签名 | 用户的位置信息 |

## online_user 表

|  id  | create_time | message      | type   | user_img     | user_people    | user_state           |     |
| :--: | ----------- | ------------ | ------ | ------------ | -------------- | -------------------- | --- |
| 主键 | 更新时间    | varchar      | info   | varchar      | varchar        | varchar              |     |
| 自增 |             | 提示用户信息 | 固定值 | 头像图片链接 | 加入聊天的用户 | 判断是否加入还是离开 |     |

## user_emoji 表

| id   | create_time | user_id                | user_emoji_img   |
| ---- | ----------- | ---------------------- | ---------------- |
| 主键 | 创建时间    | int                    | varchar          |
| 自增 |             | 对应是哪一个用户的表情 | 对应表情图片链接 |

## chat_messages 表（聊天记录表）

|   字段名    |     类型     |                说明                |
| :---------: | :----------: | :--------------------------------: |
|     id      |     INT      |       消息 ID（主键，自增）        |
|    type     | VARCHAR(20)  | 消息类型：group-群聊, private-私聊 |
|  from_user  | VARCHAR(100) |            发送者用户名            |
|   to_user   | VARCHAR(100) |     接收者用户名（仅私聊使用）     |
|   message   |     TEXT     |              消息内容              |
|  msg_type   | VARCHAR(20)  |  消息格式：text-文本, image-图片   |
|  user_img   | VARCHAR(500) |           发送者头像 URL           |
| create_time |   DATETIME   |              发送时间              |
|   is_read   |   TINYINT    |      是否已读：0-未读, 1-已读      |

**索引：**

- idx_type: 消息类型索引
- idx_from_user: 发送者索引
- idx_to_user: 接收者索引
- idx_create_time: 时间索引

**功能说明：**

- 存储所有群聊和私聊消息记录
- 支持文本和图片消息
- 自动通过 WebSocket 保存消息
- 支持按用户、时间、类型查询历史记录
