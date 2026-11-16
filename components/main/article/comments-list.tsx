"use client";

import { Comment } from "@/components/main/article/comment";

interface CommentsListProps {
  comments: any[];
}

export function CommentsList({ comments }: CommentsListProps) {
  return (
    <div className="space-y-6">
      {comments.map((comment: any) => (
        <Comment
          key={comment.id}
          comment={comment}
          onReply={(commentId) => {
            console.log("Reply to comment:", commentId);
          }}
          onLike={(commentId) => {
            console.log("Like comment:", commentId);
          }}
        />
      ))}
    </div>
  );
}
