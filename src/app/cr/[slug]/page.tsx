import MiniCreatePost from "@/components/MiniCreatePost";
import PostFeed from "@/components/PostFeed";
import { Button } from "@/components/ui/Button";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, useRouter } from "next/navigation";

interface PageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { slug } = params;
  const session = await getAuthSession();

  const subcreddit = await db.subreddit.findFirst({
    where: {
      name: slug,
    },
    include: {
      posts: {
        include: {
          author: true,
          comments: true,
          votes: true,
          subreddit: true,
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
        orderBy: {
          createdAt: "desc",
        },
      },
      subscribers: true,
    },
  });
  if (!subcreddit) {
    return notFound();
  }
  const isUserJoinedSubreddit = subcreddit.subscribers.some(
    (s) => s.userId === session?.user.id
  );
  return (
    <>
      <h1 className='font-bold text-3xl md:text-4xl h-14'>
        cr/{subcreddit.name}
      </h1>
      <MiniCreatePost
        session={session}
        isUserJoinedSubreddit={isUserJoinedSubreddit}
      />

      <PostFeed subcredditName={slug} initialPosts={subcreddit.posts} />
    </>
  );
};

export default page;
