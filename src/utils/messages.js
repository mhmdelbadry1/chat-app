const generateMessage = (text , username , room , id)=>{
    return {
        text,
        createdAt: new Date().getTime(),
        username,
        room,
        id
    }
}


const generateLocation = (url , username , room, id)=>{
return{
    url,
    createdAt : new Date().getTime(),
    username,
    room,
    id

}
}

module.exports = {
    generateMessage,
    generateLocation
}