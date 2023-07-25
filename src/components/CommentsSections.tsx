import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import PostComment from "./PostComment";
import CreateComment from "./CreateComment";

interface CommentsSectionsProps {
  postId: string;
}

const CommentsSections = async ({ postId }: CommentsSectionsProps) => {
  const session = await getAuthSession();

  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null,
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });
  return (
    <div className='flex flex-col gap-y-4 mt-4'>
      <hr className='w-full h-px my-6' />
      <CreateComment postId={postId} />

      <div className='flex flex-col gap-y-6 mt-4'>
        {comments
          .filter((c) => !c.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVotesAmt = topLevelComment.votes.reduce(
              (acc, v) => {
                if (v.type === "DOWN") return acc - 1;
                if (v.type === "UP") return acc + 1;
                return acc;
              },
              0
            );
            const topLevelCommentVoteType = topLevelComment.votes.find(
              (v) => v.userId === session?.user.id
            );

            return (
              <div key={topLevelComment.id} className='flex flex-col'>
                <div className='mb-2'>
                  <PostComment
                    comment={topLevelComment}
                    initialVotesAmt={topLevelCommentVotesAmt}
                    initialVoteType={topLevelCommentVoteType}
                    postId={postId}
                  />
                </div>
                {/* replies */}
                {topLevelComment.replies
                  .sort((a, b) => {
                    return b.votes.length - a.votes.length;
                  })
                  .map((r) => {
                    const rVotesAmt = r.votes.reduce((acc, v) => {
                      if (v.type === "DOWN") return acc - 1;
                      if (v.type === "UP") return acc + 1;
                      return acc;
                    }, 0);
                    const rVoteType = r.votes.find(
                      (v) => v.userId === session?.user.id
                    );

                    return (
                      <div
                        key={r.id}
                        className='ml-2 py-2 pl-4 border-l-2 border-zinc-200'
                      >
                        <PostComment
                          comment={r}
                          initialVoteType={rVoteType}
                          initialVotesAmt={rVotesAmt}
                          postId={postId}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentsSections;
