import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FC } from "react";
import SignIn from "./SignIn";

interface pageProps {}

const SignInPage: FC<pageProps> = ({}) => {
  return (
    <div className='absolute inset-0'>
      <div className='h-full mx-auto flex flex-col max-w-2xl items-center justify-center gap-20'>
        <Link
          href='/'
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "self-start mt-20"
          )}
        >
          Home
        </Link>
        <SignIn />
      </div>
    </div>
  );
};

export default SignInPage;
