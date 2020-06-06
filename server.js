const express = require('express')
const app = express()
const http = require('http').Server(app)

const io = require('socket.io')(http)
const PORT = process.env.PORT || 3000

const {createUser, getUserCountByRoomId, addUserToList, removeUser} = require('./utility/userManager');

app.use(express.static(__dirname + '/public'))


io.on('connection', (socket) => {
    
    socket.on('NewClient', ({username, roomId}) => {
        
        let clients = getUserCountByRoomId(roomId);
        
        if(clients < 2) {
            const user = createUser(socket.id, username, roomId);

            socket.join(user.roomId);

            if(clients == 1) {
                socket.to(user.roomId).emit('CreatePeer');
            }

            addUserToList(user);
        }
        else {
            socket.emit('SessionActive');
        }
    })

    socket.on('Offer', sendOffer)
    socket.on('Answer', sendAnswer)
    socket.on('disconnect', disconnect)
})


function disconnect() {
    const user = removeUser(this.id);
       if(user) {
        this.broadcast.to(user.roomId).emit('RemoveVideo');
       }
}

function sendOffer(offer) {
    this.broadcast.to(offer.roomId).emit("BackOffer", offer.data)
}

function sendAnswer(resp) {
    this.broadcast.to(resp.roomId).emit("BackAnswer", resp.data)
}

http.listen(PORT, () => console.log(`Active on ${PORT} port`))