import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentValidator } from "@/lib/validators/comment";
import { z } from "zod";

export const PATCH = async (req: Request) => {
  try {
    const body = await req.json();
    const { postId, text, replyToId } = CommentValidator.parse(body);
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    await db.comment.create({
      data: {
        text,
        postId,
        authorId: session.user.id,
        replyToId,
      },
    });
    return new Response("OK");
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return new Response(e.message, { status: 400 });
    }
    return new Response(e, { status: 500 });
  }
};
