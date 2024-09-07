const users = []

const addUser = ({id,username,room})=>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error: 'username and room are required!'
        }
    }

    const existenceUser = users.find((user)=>{
        return user.room=== room && user.username === username
    })

    if(existenceUser){
        return {
            error:'Usename is use!'
        }
    }

    const user = {id ,username,room}
    users.push(user)
    return { user }

}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index!==-1){
        return users.splice(index , 1 )[0]
    }
}

const getUser = (id)=>{
    const user = users.find((user)=>user.id===id)

    if(!user){
        return {
            error:'This is user is not exist'
        }
    }

    return user
}

const getUserInRoom = (room) => {
    room = room.trim().toLowerCase()
    const usersInRoom = users.filter((user) => {
        return user.room === room;
    });
    return usersInRoom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}