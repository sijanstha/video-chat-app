
class User {
    constructor(id, username, roomId) {
        this.id = id;
        this.username = username;
        this.roomId = roomId;
    }
}

const users = [];

function createUser(id, username, roomId) {

    const user = new User(id, username, roomId);
    return user;

}

function addUserToList(user) {
    users.push(user);
}


function getUserCountByRoomId(roomId) {
    let count = 0
    users.forEach(u => {
        if (u.roomId === roomId) {
            count++;
        }
    })

    return count;
}

function removeUser(id) {
    let index = users.findIndex(user => user.id === id);
    console.log(`index = ${index}`)
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}


module.exports = {
    createUser,
    addUserToList,
    getUserCountByRoomId,
    removeUser
}