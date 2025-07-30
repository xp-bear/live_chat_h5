# 聊天室的数据库设计与实现

## users表

|  id  | u_name  | u_password | u_sex              | u_createtime |         u_token         | u_avatar         | u_money  | u_saying     | u_location     |
| :--: | :-----: | :--------: | ------------------ | :----------: | :---------------------: | ---------------- | -------- | ------------ | -------------- |
| 主键 | varchar |  varchar   | int                |     time     |         varchar         | varchar          | int      | varchar      | varchar        |
| 自增 | 用户名  |    密码    | 性别<br />0-男1-女 | 用户创建时间 | 用户登录的过期token时间 | 用户默认头像链接 | 用户金币 | 用户个性签名 | 用户的位置信息 |

## online_user表

|  id  | create_time | message      | type   | user_img     | user_people    | user_state           |      |
| :--: | ----------- | ------------ | ------ | ------------ | -------------- | -------------------- | ---- |
| 主键 | 更新时间    | varchar      | info   | varchar      | varchar        | varchar              |      |
| 自增 |             | 提示用户信息 | 固定值 | 头像图片链接 | 加入聊天的用户 | 判断是否加入还是离开 |      |

## user_emoji表

| id   | create_time | user_id                | user_emoji_img      |
| ---- | ----------- | ---------------------- | ---------------- |
| 主键 | 创建时间    | int                    | varchar          |
| 自增 |             | 对应是哪一个用户的表情 | 对应表情图片链接 |









































































































































