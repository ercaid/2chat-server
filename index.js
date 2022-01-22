const io = require('socket.io')(3000, {
  // 配置跨域
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
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
    socket.name = name
    socket.room = room
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

  // 断开连接
  socket.on('disconnect', () => {
    const roomli = socket.adapter.rooms.get(socket.room)
    let count
    if (roomli) {
      count = roomli.size
    }
    // 发给房间里其他人
    socket.to(socket.room).emit('receive-msg', { name: socket.name, count: count, state: 3 })
  })
})
