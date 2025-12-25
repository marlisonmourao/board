"use client"

import { Input } from "@/components/input"
import { SearchIcon } from "lucide-react"
import { debounce, parseAsString, useQueryState } from "nuqs"
import type { ChangeEvent } from "react"

export function SearchInput() {
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""))

  function handleSearchUpdate(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value, {
      limitUrlUpdates: event.target.value !== "" ? debounce(500) : undefined,
    })
  }

  return (
    <div className="relative">
      <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-navy-200 pointer-events-none" />
      <Input
        type="text"
        placeholder="Search for features..."
        className="w-[270px] pl-8"
        value={search}
        onChange={(e) => handleSearchUpdate(e)}
      />
    </div>
  )
}
