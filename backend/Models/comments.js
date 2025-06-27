import mongoose from "mongoose";

const commentsSchema=new mongoose.Schema({
    isbn:String,
    text:String,
    fullName:String,
    userId:String,
    parentId:mongoose.Schema.Types.ObjectId, 
    createdAt:{
        type: Date,
        default: Date.now
    },
})

export const commentsModel = mongoose.model("comments", commentsSchema);