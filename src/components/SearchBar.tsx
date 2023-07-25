"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/Command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Prisma, Subreddit } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { Loader, Users } from "lucide-react";
import debounce from "lodash.debounce";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

const SearchBar = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const request = debounce(async () => {
    refetchSearch();
  }, 500);
  const {
    data: searchResults,
    refetch: refetchSearch,
    isFetched: isSearchFetched,
    isFetching: isSearchFetching,
  } = useQuery(["get communities"], {
    queryFn: async () => {
      if (!inputValue) return [];
      const { data } = await axios.get(`/api/search?q=${inputValue}`);
      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType;
      })[];
    },
    enabled: false,
  });
  const debounceRequest = useCallback(() => {
    request();
  }, [request]);
  const router = useRouter();
  const commandRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useOnClickOutside(commandRef, () => {
    setInputValue("");
  });
  useEffect(() => {
    setInputValue("");
  }, [pathname]);
  return (
    <Command
      ref={commandRef}
      className='relative rounded-lg border max-w-lg z-50 overflow-visible'
    >
      <CommandInput
        className='outline-none border-none focus:border-none focus:outline-none ring-0'
        placeholder='Search communities'
        onValueChange={(text) => {
          setInputValue(text);
          debounceRequest();
        }}
        value={inputValue}
      />
      {inputValue.length > 0 ? (
        !isSearchFetching ? (
          <CommandList className='absolute bg-white top-full inset-x-0 shadow rounded-b-md '>
            {searchResults?.length === 0 && isSearchFetched && (
              <CommandEmpty>No results found</CommandEmpty>
            )}
            {(searchResults?.length ?? 0) > 0 ? (
              <CommandGroup heading='Communities'>
                {searchResults?.map((sub) => (
                  <CommandItem
                    key={sub.id}
                    onSelect={(e) => {
                      router.push(`/cr/${e}`);
                      router.refresh();
                    }}
                    value={sub.name}
                  >
                    <Users className='mr-2 h-4 w-4' />
                    <a href={`/cr/${sub.name}`}>cr/{sub.name}</a>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        ) : (
          <div>
            <Loader className='animate-spin' />
          </div>
        )
      ) : null}
    </Command>
  );
};

export default SearchBar;
