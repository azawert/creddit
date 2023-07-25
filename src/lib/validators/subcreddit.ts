import { z } from "zod";

export const SubcredditValidator = z.object({
  name: z.string().min(2).max(32),
});

export const SubcredditSubscriptionValidator = z.object({
  subcredditId: z.string(),
});

export type CreateSubcredditPayload = z.infer<typeof SubcredditValidator>;
export type SubscribeToSubcredditPayload = z.infer<
  typeof SubcredditSubscriptionValidator
>;
