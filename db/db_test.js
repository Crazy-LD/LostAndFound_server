const md5 = require('blueimp-md5');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/gzhipin_test2');
const conn = mongoose.connection;
conn.on('connected', function () {
  console.log('数据库连接成功');
});

const userSchema = mongoose.Schema({
  username: {type: String, isRequired: true},
  password: {type: String, isRequired: true},
  type: {type: String, isRequired: true}, // 用户类型 dashen/laoban
});

const UserModel = mongoose.model('user', userSchema); // 集合名users
function testSave() {
  const user = {
    username: 'Tom',
    password: md5('123'),
    type: 'dashen'
  }
  const userModel = new UserModel(user);
  userModel.save(function (err, users) {
    console.log(err, users);
  })
}
testSave();