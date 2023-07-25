"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { CreateSubcredditPayload } from "@/lib/validators/subcreddit";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
interface pageProps {}

const Page: FC<pageProps> = ({}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const router = useRouter();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const { loginToast } = useCustomToast();
  const { mutate: createSubcreddit, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: CreateSubcredditPayload = { name: inputValue };
      const { data } = await axios.post<string>("/api/subcreddit", payload);
      return data as string;
    },
    onError(e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 409) {
          return toast({
            title: "Subcreddit already exists",
            description: "Please choose another title",
            variant: "destructive",
          });
        }
        if (e.response?.status === 400) {
          return toast({
            title: "Invalid title",
            description:
              "Please choose another title between 3 and 21 characters",
            variant: "destructive",
          });
        }
        if (e.response?.status === 401) {
          return loginToast();
        }
      }
      toast({
        title: "Internal server error",
        description: "Try in 5 minutes",
        variant: "destructive",
      });
    },
    onSuccess: (d) => {
      router.push(`/cr/${d}`);
    },
  });
  return (
    <div className='container flex items-center h-full max-w-3xl mx-auto'>
      <div className='relative bg-white w-full h-fit p-4 rounded-lg space-y-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-xl font-semibold'>Create a community</h1>
        </div>
        <hr className='bg-zinc-500 h-px' />
        <div>
          <p className='text-lg font-medium'>Name</p>
          <p className='text-xs pb-2'>
            Community names including capitalization cannot be changed.
          </p>
          <div className='relative'>
            <p className='absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400'>
              cr/
            </p>
            <Input
              value={inputValue}
              onChange={handleInputChange}
              className='pl-6'
            />
          </div>
        </div>
        <div className='flex justify-end gap-4'>
          <Button variant={"subtle"} onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            disabled={inputValue.length === 0}
            isLoading={isLoading}
            onClick={() => createSubcreddit()}
          >
            Create Community
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
