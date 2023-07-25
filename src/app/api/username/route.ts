import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsernameValidator } from "@/lib/validators/username";
import { z } from "zod";

export const PATCH = async (req: Request) => {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const body = await req.json();
    const { name } = UsernameValidator.parse(body);
    const isUsernameAlreadyExists = await db.user.findFirst({
      where: {
        username: name,
      },
    });
    if (!!isUsernameAlreadyExists) {
      return new Response("Username is taken already", { status: 409 });
    }
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username: name,
      },
    });
    return new Response("OK");
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return new Response(e.message, { status: 400 });
    }
    return new Response(e.message ?? e, { status: 500 });
  }
};
