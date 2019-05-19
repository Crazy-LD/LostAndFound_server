module.exports = function (server) {
  const {ChatModel} = require('../db/models');
  const io = require('socket.io')(server);
  io.on('connection', function (socket) {
    console.log('有一个客户端连接上服务器');
    socket.on('sendMsg', function ({from, to, content}) {
      console.log('服务器接受到客户端发送的消息', {from, to, content});
      const chat_id = [from, to].sort().join('_');
      const create_time = Date.now();
      new ChatModel({from, to, content, chat_id, create_time}).save(function (err, chatMsg) {
        io.emit('receiveMsg', chatMsg);
        console.log('服务器向客户端发送消息', chatMsg)
      })
    })
  })
};