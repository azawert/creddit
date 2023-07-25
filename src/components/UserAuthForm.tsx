"use client";

import { FC, HTMLAttributes, useState } from "react";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { Icons } from "./Icons";
import { useToast } from "@/hooks/use-toast";
interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {}

const UserAuthForm: FC<UserAuthFormProps> = ({ className, ...rest }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signIn("google");
    } catch (e: any) {
      toast({
        title: "An error occurred",
        description: e.message ?? e,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={cn("flex justify-center", className)} {...rest}>
      <Button
        onClick={loginWithGoogle}
        isLoading={isLoading}
        className='w-full'
        size='sm'
      >
        {isLoading ? null : <Icons.google className='h-4 w-4 mr-2 ' />}
        Google
      </Button>
    </div>
  );
};

export default UserAuthForm;
