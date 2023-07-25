import { z } from "zod";

export const CommentValidator = z.object({
  replyToId: z.string().optional(),
  text: z.string(),
  postId: z.string(),
});

export type CommentRequest = z.infer<typeof CommentValidator>;
