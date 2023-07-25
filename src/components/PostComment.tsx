"use client";
import { Comment, CommentVote, User } from "@prisma/client";
import { FC, useRef, useState } from "react";
import UserAvatar from "./UserAvatar";
import { formatTimeToNow } from "@/lib/utils";
import CommentVotes from "./CommentVotes";
import { Button } from "./ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

interface PostCommentProps {
  initialVotesAmt: number;
  postId: string;
  initialVoteType?: CommentVote | null;
  comment: Comment & {
    votes: CommentVote[];
    author: User;
  };
}

const PostComment: FC<PostCommentProps> = ({
  comment,
  initialVoteType,
  initialVotesAmt,
  postId,
}) => {
  const commentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const { mutate: postComment, isLoading: postCommentIsLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = { postId, text, replyToId };
      const { data } = await axios.patch(
        "/api/subcreddit/post/comment",
        payload
      );
      return data;
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        variant: "destructive",
        description: "Try again later",
      });
    },
    onSuccess: () => {
      router.refresh();
      setIsReplying(false);
    },
  });
  const { data: session } = useSession();
  return (
    <div className='flex flex-col' ref={commentRef}>
      <div className='flex items-center'>
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className='w-6 h-6'
        />
        <div className='ml-2 flex items-center gap-x-2'>
          <p className='text-sm font-medium text-gray-900'>
            u/{comment.author.username}
          </p>
          <p className='max-h-40 truncate text-xs text-gray-500'>
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>
      <p className='text-sm text-zinc-900 mt-2'>{comment.text}</p>
      <div className='flex gap-2 items-center flex-wrap'>
        <CommentVotes
          commentId={comment.id}
          initialVotesAmt={initialVotesAmt}
          initialVote={initialVoteType?.type}
        />
        <Button
          variant={"ghost"}
          size='xs'
          onClick={() => {
            if (!session) {
              return router.push("/sign-in");
            }
            setIsReplying(true);
          }}
        >
          <MessageSquare className='w-4 h-4 mr-1.5' />
          Reply
        </Button>
        {isReplying && (
          <div className='grid w-full gap-1.5'>
            <Label htmlFor='comment'>Your comment</Label>
            <div className='mt-2'>
              <Textarea
                id='comment'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What's your thought"
              />
              <div className='mt-2 flex justify-end gap-2'>
                <Button
                  tabIndex={-1}
                  variant='subtle'
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    postComment({
                      postId,
                      text: inputValue,
                      replyToId: comment.replyToId ?? comment.id,
                    })
                  }
                  isLoading={postCommentIsLoading}
                  disabled={postCommentIsLoading || inputValue.length === 0}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostComment;
