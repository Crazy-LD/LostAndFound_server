module.exports = function (server) {
  const io = require('socket.io')(server)
  io.on('connection', function (socket) {
    console.log('有一个客户端连接到服务器')
    socket.on('sendMsg', function (data) {
      console.log('客户端向服务器发来一个消息', data)
      data.name = data.name.toUpperCase()
      socket.emit('receiveMsg', data)
      console.log('服务器向客户端发送一个消息', data)
    })
  })
}