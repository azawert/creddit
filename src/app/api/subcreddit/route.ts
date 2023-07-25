import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubcredditValidator } from "@/lib/validators/subcreddit";
import { z } from "zod";

export const POST = async (req: Request) => {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = SubcredditValidator.parse(body);
    const subcredditExists = await db.subreddit.findFirst({
      where: {
        name,
      },
    });
    if (subcredditExists) {
      return new Response("This subcreddit already exists", { status: 409 });
    }
    const createdSubcreddit = await db.subreddit.create({
      data: {
        name,
        creatorId: session?.user.id,
      },
    });
    await db.subscription.create({
      data: {
        userId: session.user.id,
        subredditId: createdSubcreddit.id,
      },
    });
    return new Response(createdSubcreddit.name);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return new Response(err.message, { status: 400 });
    }
    return new Response(err, { status: 500 });
  }
};
