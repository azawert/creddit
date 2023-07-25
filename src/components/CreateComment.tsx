"use client";
import { FC, useState } from "react";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";

interface CreateCommentProps {
  postId: string;
  replyToId?: string | null;
}

const CreateComment: FC<CreateCommentProps> = ({ postId, replyToId }) => {
  const [inputValue, setInputValue] = useState<string>("");
  const { loginToast } = useCustomToast();
  const router = useRouter();
  const { mutate: createComment, isLoading: isCreateCommentLoading } =
    useMutation({
      mutationFn: async ({ replyToId, postId, text }: CommentRequest) => {
        const payload: CommentRequest = {
          postId,
          text,
          replyToId,
        };
        const { data } = await axios.patch(
          `/api/subcreddit/post/comment`,
          payload
        );
        return data;
      },
      onError: (e: any) => {
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
      onSuccess: () => {
        router.refresh();
        setInputValue("");
      },
    });

  return (
    <div className='grid w-full gap-1.5'>
      <Label htmlFor='comment'>Your comment</Label>
      <div className='mt-2'>
        <Textarea
          id='comment'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What's your thought"
        />
        <div className='mt-2 flex justify-end'>
          <Button
            onClick={() => createComment({ postId, text: inputValue })}
            isLoading={isCreateCommentLoading}
            disabled={isCreateCommentLoading || inputValue.length === 0}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
