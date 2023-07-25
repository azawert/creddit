"use client";
import { UsernameRequest, UsernameValidator } from "@/lib/validators/username";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { FC } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { Label } from "./ui/Label";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";

interface UserNameFormProps {
  user: Pick<User, "id" | "username">;
}

const UserNameForm: FC<UserNameFormProps> = ({ user }) => {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UsernameRequest>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username ?? "",
    },
    mode: "onChange",
  });
  const { mutate: changeName, isLoading } = useMutation({
    mutationFn: async ({ name }: UsernameRequest) => {
      const payload: UsernameRequest = { name };
      const { data } = await axios.patch("/api/username", payload);
      return data;
    },
    onError(e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 409) {
          return toast({
            title: "Username already taken.",
            description: "Please choose another username",
            variant: "destructive",
          });
        }
      }
      toast({
        title: "Internal server error",
        description: "Try in 5 minutes",
        variant: "destructive",
      });
    },
    onSuccess() {
      toast({
        title: "Successfully updated",
      });
      router.refresh();
    },
  });
  const onSubmit = async (data: UsernameRequest) => {
    const payload: UsernameRequest = data;
    await changeName(payload);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} id='form_change_name'>
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>
            Please enter a display name you are comfortable with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='relative gap-1 grid'>
            <div className='absolute top-0 left-0 w-8 h-10 grid place-items-center'>
              <span className='text-sm text-zinc-400'>cr/</span>
            </div>
            <Label className='sr-only' htmlFor='name'>
              Name
            </Label>
            <Input
              id='name'
              className='w-[400px] pl-6'
              size={32}
              {...register("name")}
            />
            {errors?.name && (
              <p className='px-1 text-xs text-red-600'>{errors.name.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            form={"form_change_name"}
            type='submit'
            isLoading={isLoading}
            disabled={isLoading}
          >
            Change your name!
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UserNameForm;
