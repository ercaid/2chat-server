const io = require('socket.io')(3000, {
  cors: {
    origin: ['http://localhost:8080']
  }
})

io.on('connection', (socket) => {
  console.log(socket.id)

  socket.on('send-msg', (room, msg) => {
    if (room === '') {
      // 广播消息
      // socket.broadcast.emit('receive-msg', msg)
    } else {
      socket.to(room).emit('receive-msg', msg)
    }
  })

  // 加入房间
  socket.on('join-room', (room, name) => {
    socket.join(room)
    const count = socket.adapter.rooms.get(room).size
    // 发给自己
    socket.emit('receive-msg', { name: name, count: count, state: 2 })
    // 发给房间里其他人
    socket.to(room).emit('receive-msg', { name: name, count: count, state: 2 })
  })

  // 离开房间
  socket.on('leave-room', (room, name) => {
    socket.leave(room)
    const roomli = socket.adapter.rooms.get(room)
    let count
    if (roomli) {
      count = roomli.size
    }
    // 发给房间里其他人
    socket.to(room).emit('receive-msg', { name: name, count: count, state: 3 })
  })
})
