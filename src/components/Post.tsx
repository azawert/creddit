import { formatTimeToNow } from "@/lib/utils";
import { Comment, Post, User, Vote, VoteType } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import { FC, useRef } from "react";
import EditorOutput from "./EditorOutput";
import PostVoteClient from "./post-vote/PostVoteClient";

interface PostProps {
  post: Post & {
    author: User;
    votes: Vote[];
    comments: Comment[];
  };
  subcredditName?: string | null;
  currentVote?: VoteType;
  votesAmt: number;
}

const Post: FC<PostProps> = ({
  post,
  subcredditName,
  currentVote,
  votesAmt,
}) => {
  const postRef = useRef<HTMLDivElement>(null);
  return (
    <div className='rounded-md bg-white shadow'>
      <div className='px-6 py-4 flex justify-between'>
        <PostVoteClient
          initialVotesAmt={votesAmt}
          postId={post.id}
          initialVote={currentVote}
        />
        <div className='w-0 flex-1'>
          <div className='max-h-40 mt-1 text-xs text-gray-500'>
            {subcredditName ? (
              <>
                <a
                  className='underline text-zinc-900 text-sm underline-offset-2'
                  href={`/cr/${subcredditName}`}
                >
                  cr/{subcredditName}
                </a>
                <span className='px-1'>*</span>
              </>
            ) : null}
            <span>Posted by u/{post.author.username}</span>{" "}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>
          <a href={`/cr/${subcredditName}/post/${post.id}`}>
            <h1 className='text-lg font-semibold py-2 leading-6 text-gray-900'>
              {post.title}
            </h1>
          </a>
          <div
            className='relative text-sm max-h-40 w-full overflow-clip'
            ref={postRef}
          >
            <EditorOutput content={post.content} />
            {postRef.current?.clientHeight === 160 ? (
              <div className='absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent' />
            ) : null}
          </div>
        </div>
      </div>
      <div className='bg-gray-50 z-20 text-sm p-4 sm:px-6'>
        <a
          className='w-fit flex items-center gap-2'
          href={`/cr/${subcredditName}/post/${post.id}`}
        >
          <MessageSquare className='h-4 w-4' /> {post.comments.length} comments
        </a>
      </div>
    </div>
  );
};

export default Post;
