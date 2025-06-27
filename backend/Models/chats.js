import mongoose from "mongoose";

const chatsSchema=new mongoose.Schema({
    clubId:String,
    text:String,
    fullName:String,
    userId:String,
    parentId:mongoose.Schema.Types.ObjectId, 
    createdAt:{
        type: Date,
        default: Date.now
    },
})

export const chatsModel = mongoose.model("chats", chatsSchema);