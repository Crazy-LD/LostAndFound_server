const mongoose = require('mongoose');
mongoose.connect('mongodb://@localhost:27017/lost_found', { useNewUrlParser: true });
const conn = mongoose.connection;

conn.on('connected', function () {
  console.log('database is connected successfully !!!');
});

const UserSchema = mongoose.Schema({
  username: {type: String, required: true}, // 用户名
  password: {type: String, required: true}, // 密码
  name: {type: String},
  header: {type: String}, // 头像名称
  phone: {type: String} // 手机号
});
const UserModel = new mongoose.model('user', UserSchema);
exports.UserModel = UserModel;
// 定义 chats 集合的文档结构
const ChatSchema = mongoose.Schema({
  from: {type: String, required: true}, // 发送用户的 id
  to: {type: String, required: true}, // 接收用户的 id
  chat_id: {type: String, required: true}, // from 和 to 组成的字符串
  content: {type: String, required: true}, // 内容
  read: {type:Boolean, default: false}, // 标识是否已读
  create_time: {type: Number} // 创建时间
});
// 定义能操作 chats 集合数据的 Model
const ChatModel = mongoose.model('chat', ChatSchema);
// 向外暴露 Model
exports.ChatModel = ChatModel;
/*失物列表*/
const LostFoodSchema = mongoose.Schema({
  _lostId: {type: String, required: true},
  username: {type: String, required: true},
  status: {type: Number}, // 当期那状态 0:正在找寻,1:已经找到,3:删除
  lName: {type: String, required: true},
  address: {type: String, required: true},
  isLost: {type: Boolean, required: true},
  images: {type: Array},
  desc: {type: String},
  contact: {type: String},
  create_time: {type: Number} // 创建时间
});
const LostFoodModel = mongoose.model('lostfood', LostFoodSchema);
exports.LostFoodModel = LostFoodModel;
