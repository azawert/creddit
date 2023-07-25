import { Post, Vote, VoteType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import PostVoteClient from "./PostVoteClient";

interface PostVoteServerProps {
  postId: string;
  initialVotesAmt?: number | null;
  initialVote?: VoteType | null;
  getData?: () => Promise<(Post & { votes: Vote[] }) | null>;
}

const PostVoteServer = async ({
  postId,
  getData,
  initialVote,
  initialVotesAmt,
}: PostVoteServerProps) => {
  const session = await getServerSession();
  let _votesAmt: number = 0;
  let _currentVote: VoteType | null | undefined = undefined;

  if (getData) {
    const post = await getData();
    if (!post) return notFound();

    _votesAmt = post.votes?.reduce((acc, v) => {
      if (v.type === "UP") acc + 1;
      if (v.type === "DOWN") acc - 1;
      return acc;
    }, 0);
    _currentVote = post.votes?.find((v) => v.userId === session?.user.id)?.type;
  } else {
    _votesAmt = initialVotesAmt!;
    _currentVote = initialVote;
  }
  return (
    <PostVoteClient
      initialVotesAmt={_votesAmt}
      postId={postId}
      initialVote={_currentVote}
    />
  );
};

export default PostVoteServer;
