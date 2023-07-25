"use client";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { CommentVoteRequest } from "@/lib/validators/vote";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/Button";

interface CommentVotesProps {
  commentId: string;
  initialVotesAmt: number;
  initialVote?: VoteType;
}

const CommentVotes: FC<CommentVotesProps> = ({
  initialVotesAmt,
  commentId,
  initialVote,
}) => {
  const { loginToast } = useCustomToast();
  const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const { toast } = useToast();
  const prevVote = usePrevious(currentVote);
  const { mutate: handleVoteClick } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType,
      };
      await axios.patch("/api/subcreddit/post/comment/vote", payload);
    },
    onMutate: (type) => {
      if (currentVote === type) {
        setCurrentVote(undefined);
        if (type === "UP") {
          setVotesAmt((prev) => prev - 1);
        } else {
          setVotesAmt((prev) => prev + 1);
        }
      } else {
        setCurrentVote(type);
        if (type === "UP") {
          setVotesAmt((prev) => prev + (currentVote ? 2 : 1));
        } else {
          setVotesAmt((prev) => prev - (currentVote ? 2 : 1));
        }
      }
    },
    onError: (e, voteType) => {
      if (voteType === "UP") setVotesAmt((prev) => prev - 1);
      if (voteType === "DOWN") setVotesAmt((prev) => prev + 1);

      setCurrentVote(prevVote);
      if (e instanceof AxiosError) {
        e.response?.status === 401 && loginToast();
        e.response?.status === 404 &&
          toast({ title: "Post not found", variant: "destructive" });
      } else {
        toast({
          title: "Internal server error",
          variant: "destructive",
          description: "Try again later",
        });
      }
    },
  });
  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);
  return (
    <div className='flex gap-1'>
      <Button
        size={"sm"}
        variant={"ghost"}
        aria-label='upvote'
        onClick={() => handleVoteClick("UP")}
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>
      <p className='text-center py-2 font-medium text-sm text-zinc-900'>
        {votesAmt}
      </p>
      <Button
        size={"sm"}
        variant={"ghost"}
        aria-label='downvote'
        onClick={() => handleVoteClick("DOWN")}
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default CommentVotes;
