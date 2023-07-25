"use client";
import { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { FC } from "react";
import UserAvatar from "./UserAvatar";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { ImageIcon, Link2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MiniCreatePostProps {
  session: Session | null;
  isUserJoinedSubreddit?: boolean;
}

const MiniCreatePost: FC<MiniCreatePostProps> = ({
  session,
  isUserJoinedSubreddit,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <li className='overflow-hidden rounded-md bg-white shadow'>
      <div className='h-full px-6 py-4 flex justify-between gap-6'>
        <div className='relative'>
          <UserAvatar
            user={{ image: session?.user.image, name: session?.user.name }}
          />
          <span className='absolute bottom-0 right-0 rounded-full w-3 h-3 bg-green-500 outline outline-2 outline-white' />
        </div>
        <Input
          readOnly
          onClick={
            isUserJoinedSubreddit
              ? () => router.push(pathname + "/submit")
              : () => toast({ title: "Join subcreddit before posting" })
          }
          placeholder='Create post'
        />
        <Button
          variant={"ghost"}
          onClick={() => router.push(pathname + "/submit")}
        >
          <ImageIcon className='text-zinc-600' />
        </Button>
        <Button
          variant={"ghost"}
          onClick={() => router.push(pathname + "/submit")}
        >
          <Link2 className='text-zinc-600' />
        </Button>
      </div>
    </li>
  );
};

export default MiniCreatePost;
