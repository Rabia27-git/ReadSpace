import React, { useState, useEffect } from 'react'
import axios from "axios"
import "./styles.css"
import Comment from './Comment.jsx'
import CommentForm from './CommentForm.jsx'

function Comments({userId,clubId,clubName}){
    const [comments,setComments]=useState([])
    const [activeComment,setActiveComment]=useState(null)
    const rootComments=comments.filter((comment) => comment.parentId === null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const getCommentsFromBackend=async()=>{
        try{
            const response=await axios.get(`http://localhost:3000/${clubId}/comments`)
            setComments(response.data)
        }
        catch(error){
            console.error("Failed to fetch comments:", error);
        }
    }

    const getReplies=(commentparentId)=>{
        return comments.filter((comment)=>comment.parentId && comment.parentId.toString()===commentparentId.toString()).
        sort((a,b)=>new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime())
    }

    const addComment=async(text,parentId)=>{
        try{
            const response=await axios.post(`http://localhost:3000/${clubId}/addComment`,{
              text,
              userId,
              parentId,
            });
            setComments((prevComments)=>[response.data,...prevComments]);
            setActiveComment(null)
          } 
          catch(error){
            console.error("Failed to add comment:", error);
          }
    }

    const deleteComment=async(commentId)=>{
      try{
      if(window.confirm("Are you sure that you want to remove comment?")){
        axios.post(`http://localhost:3000/deleteComment/${commentId}`)
        const updatedComments=comments.filter((comment)=>(
          comment._id!==commentId
        ))
        setComments(updatedComments)
      }}
      catch(error){
        console.error("Failed to delete comment:", error);
      }
    }

    const updateComment=async(text,commentId)=>{
      try{
        axios.put(`http://localhost:3000/updateComment/${commentId}`,{
          text: text,
        })
        const updatedComments=comments.map((comment)=>{
          if(comment._id==commentId){
            return {...comment,text:text}
          }
          return comment
        })
        setComments(updatedComments)
        setActiveComment(null)
      }
      catch(error){
        console.error("Failed to update comment:", error);
      }
    }

    useEffect(()=>{
      if (clubId) {
        getCommentsFromBackend();
      }
      },[clubId])
    
      useEffect(()=>{
        if(comments.length>0){
          console.log(comments)
        }
      },[comments])

  return (
    <div className="comments">
        <h3 className="comments-title">{clubName} - Discussion</h3>
        <div className="comment-form-title">Write comment</div>
        <CommentForm submitLabel="Write" handleSubmit={addComment}/>
        <div className="comments-container">
            {rootComments.map((rootComment)=>(
                <Comment key={rootComment._id} comment={rootComment} replies={getReplies(rootComment._id)} userId={userId} deleteComment={deleteComment} activeComment={activeComment} setActiveComment={setActiveComment} addComment={addComment} updateComment={updateComment}/>
            ))}
        </div>
    </div>
  )
}

export default Comments