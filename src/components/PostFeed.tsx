"use client";
import { ExtendedPost } from "@/types/db";
import { FC, useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import axios from "axios";
import { useSession } from "next-auth/react";
import Post from "./Post";
import { VoteType } from "@prisma/client";
import { Loader } from "lucide-react";
import { Button } from "./ui/Button";

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subcredditName?: string;
}

const PostFeed: FC<PostFeedProps> = ({ initialPosts, subcredditName }) => {
  const lastPostRef = useRef<HTMLElement>(null);

  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });
  const { data: session } = useSession();
  const {
    data: posts,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["get posts infinite"],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!subcredditName ? `&subredditName=${subcredditName}` : "");
      const { data } = await axios.get<ExtendedPost[]>(query);
      return data;
    },
    {
      getNextPageParam: (_, pages) => pages.length + 1,
      initialData: { pages: [initialPosts], pageParams: [1] },
    }
  );
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const actualPosts = posts?.pages.flatMap((page) => page) ?? initialPosts;
  return (
    <ul className='flex flex-col col-span-2 space-y-6'>
      {actualPosts.map((p, i) => {
        const votesAmt = p.votes.reduce((acc, cur) => {
          if (cur.type === "UP") return acc + 1;
          if (cur.type === "DOWN") return acc - 1;
          return acc;
        }, 0);
        const currentVote = p.votes.find((v) => v.userId === session?.user.id);
        if (i === actualPosts.length - 1) {
          return (
            <li ref={ref} key={p.id}>
              <Post
                post={p}
                subcredditName={p.subreddit.name}
                currentVote={currentVote?.type}
                votesAmt={votesAmt}
              />

              {isFetchingNextPage && (
                <div className='flex items-center justify-center mt-5'>
                  <Loader className='animate-spin w-100' />
                </div>
              )}
            </li>
          );
        } else {
          return (
            <Post
              key={p.id}
              post={p}
              subcredditName={p.subreddit.name}
              currentVote={currentVote?.type}
              votesAmt={votesAmt}
            />
          );
        }
      })}
    </ul>
  );
};

export default PostFeed;
