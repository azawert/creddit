import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export const POST = async (req: Request) => {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = await req.json();
    const { subcredditId, title, content } = PostValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId: subcredditId,
        userId: session.user.id,
      },
    });
    if (!subscriptionExists) {
      return new Response("Before posting, subscribe", { status: 400 });
    }
    const post = await db.post.create({
      data: {
        title,
        subredditId: subcredditId,
        content,
        authorId: session.user.id,
      },
    });
    return new Response("Ok");
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return new Response(err.message, { status: 400 });
    }
    return new Response(err, { status: 500 });
  }
};
