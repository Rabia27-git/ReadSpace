import React from 'react'
import "./styles.css"
import CommentForm from './CommentForm'

function Comment({comment, replies, userId, deleteComment, addComment, activeComment, setActiveComment, parentId=null, updateComment}){
  const canReply=Boolean(userId)
  const canEdit=userId===comment.userId
  const isReplying=activeComment && activeComment.type==="replying" && activeComment.id===comment._id
  const isEditing=activeComment && activeComment.type==="editing" && activeComment.id===comment._id
  const replyId=parentId ? parentId : comment._id

  return (
    <div className="comment">
        <div className="comment-image-container">
            <img src="./user-icon.png"/>
        </div>
        <div className="comment-right-part">
            <div className="comment-content">
                <div className="comment-author">{comment.fullName}</div>
            </div>

            {!isEditing && <div className="comment-text">{comment.text}</div>}
            {isEditing && (
              <CommentForm submitLabel="Update" hasCancelButton initialText={comment.text} handleSubmit={(text)=>updateComment(text,comment._id)} handleCancel={()=>setActiveComment(null)}/>
            )}

            <div className="comment-actions">
             {canReply && <div className="comment-action" onClick={()=>setActiveComment({id:comment._id, type:"replying"})}>Reply</div> }
             {canEdit && <div className="comment-action" onClick={()=>setActiveComment({id:comment._id, type:"editing"})}>Edit</div> }
             {canEdit && <div className="comment-action" onClick={()=>deleteComment(comment._id)}>Delete</div> }
            </div>

            {isReplying && (
              <CommentForm submitLabel="Reply" handleSubmit={(text)=>addComment(text,replyId)}/>
            )}
            {replies.length>0 && (
              <div className="replies">
                {replies.map(reply=>(
                  <Comment comment={reply} key={reply._id} replies={[]} userId={userId} deleteComment={deleteComment}  activeComment={activeComment} setActiveComment={setActiveComment} parentId={comment._id} addComment={addComment} updateComment={updateComment}/>
                ))}
              </div>
            )}
        </div>
    </div>
  )
}

export default Comment