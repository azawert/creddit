"use client";
import { FC, startTransition } from "react";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { SubscribeToSubcredditPayload } from "@/lib/validators/subcreddit";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePathname, useRouter } from "next/navigation";

interface SubscribeLeaveToogleProps {
  isSubscribed: boolean;
  subcredditId: string;
  subredditName: string;
}

const SubscribeLeaveToogle: FC<SubscribeLeaveToogleProps> = ({
  isSubscribed,
  subcredditId,
  subredditName,
}) => {
  const { loginToast } = useCustomToast();
  const router = useRouter();
  const { mutate: handleSubscribeClick, isLoading: isSubscriptionLoading } =
    useMutation({
      mutationFn: async () => {
        const payload: SubscribeToSubcredditPayload = { subcredditId };
        const { data } = await axios.post("/api/subcreddit/subscribe", payload);
        return data as string;
      },
      onError: (e) => {
        if (e instanceof AxiosError) {
          if (e.response?.status === 400) {
            return toast({
              title: e.response?.data,
              description: "Yummy",
              variant: "destructive",
            });
          }
          if (e.response?.status === 401) {
            return loginToast();
          }
        }
        toast({
          title: "Internal server error",
          description: "Try again later",
          variant: "destructive",
        });
      },
      onSuccess: (d) => {
        startTransition(() => {
          router.refresh();
        });
        return toast({
          title: d,
          description: `You are now ${d.toLowerCase()} ${
            d === "SUBSCRIBED" ? "to an" : "from"
          } /cr ${subredditName}`,
        });
      },
    });
  const path = usePathname();
  return isSubscribed ? (
    <Button
      className={"w-full mt-1 mb-4"}
      onClick={() => handleSubscribeClick()}
      isLoading={isSubscriptionLoading}
      disabled={path.includes("/submit")}
    >
      Leave community
    </Button>
  ) : (
    <Button
      className={"w-full mt-1 mb-4"}
      onClick={() => handleSubscribeClick()}
      isLoading={isSubscriptionLoading}
    >
      Join community for posting
    </Button>
  );
};

export default SubscribeLeaveToogle;
