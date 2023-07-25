"use client";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { PostVoteRequest } from "@/lib/validators/vote";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface PostVoteClientProps {
  postId: string;
  initialVotesAmt: number;
  initialVote?: VoteType | null;
}

const PostVoteClient: FC<PostVoteClientProps> = ({
  initialVotesAmt,
  postId,
  initialVote,
}) => {
  const { loginToast } = useCustomToast();
  const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const router = useRouter();
  const { toast } = useToast();
  const prevVote = usePrevious(currentVote);
  const { mutate: handleVoteClick } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteRequest = {
        postId,
        voteType,
      };
      await axios.patch("/api/subcreddit/post/vote", payload);
    },
    onMutate: (type: VoteType) => {
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
    <div className='flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0'>
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

export default PostVoteClient;
