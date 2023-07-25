import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubcredditSubscriptionValidator } from "@/lib/validators/subcreddit";
import { z } from "zod";

export const POST = async (req: Request) => {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = await req.json();
    const { subcredditId } = SubcredditSubscriptionValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId: subcredditId,
        userId: session.user.id,
      },
    });
    if (subscriptionExists) {
      await db.subscription.delete({
        where: {
          userId_subredditId: {
            subredditId: subcredditId,
            userId: session.user.id,
          },
        },
      });
      return new Response("UNSUBSCRIBED");
    } else {
      await db.subscription.create({
        data: {
          subredditId: subcredditId,
          userId: session.user.id,
        },
      });
      return new Response("SUBSCRIBED");
    }

    return new Response(subcredditId);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return new Response(err.message, { status: 400 });
    }
    return new Response(err, { status: 500 });
  }
};
