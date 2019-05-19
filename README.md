
## 项目简介

这个项目所用的技术框架为react + express + mongodb + antd_mobile，运用socket实现聊天功能，其应用的功能为发布失物的信息，然后失主可以直接和拾到失物的人进行聊天

## 项目运行
```
git clone https://github.com/Crazy-LD/LostAndFound_server.git

cd LostAndFound_server

npm install

npm start

访问http://localhost:3000
```

## 前端代码

[前端代码](https://github.com/Crazy-LD/LostAndFound_client)

## 功能

- [x] 用户(管理员)登录
- [x] 注册
- [x] 修改密码
- [x] 修改用户信息
- [x] 发失物招领信息
- [x] 改变失物招领的状态
- [x] 聊天

## 项目结构

```
weibo_server
  - bin
    - www               // 配置网络
  - db
    - models.js         // 创建各个表
  - node_modules
  - public              // 公共资源
    -images             // 公共图片
  - routes
    - index.js          // 路由配置
    - users.js          // users监听
  -socketIO             // socketIO监听
  - uploads             // 上传的文件
  - views               // ejs模板引擎
  - app.js              // 应用配置
```

