import { Comment } from "@/components/comment"
import { listIssuesComments } from "@/http/list-issue-comments"

import { formatDistanceToNow } from "date-fns"

interface IssueCommentListProps {
  issueId: string
}

export async function IssueCommentList({ issueId }: IssueCommentListProps) {
  const { comments } = await listIssuesComments({ issueId })

  if (comments.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-navy-400 text-sm text-center py-2">
          No comments yet
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <Comment.Root key={comment.id}>
          <Comment.Avatar src={comment.author.avatar} />
          <Comment.Content>
            <Comment.Header>
              <Comment.Author>{comment.author.name}</Comment.Author>
              <Comment.Time>
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </Comment.Time>
            </Comment.Header>
            <Comment.Text>{comment.text}</Comment.Text>
          </Comment.Content>
        </Comment.Root>
      ))}
    </div>
  )
}
