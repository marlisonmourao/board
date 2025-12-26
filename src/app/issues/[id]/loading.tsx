import { Skeleton } from "@/components/skeleton"
import { MoveLeftIcon } from "lucide-react"
import Link from "next/link"

export default function IssuesLoading() {
  return (
    <main className="max-w-[900px] mx-auto w-full flex flex-col gap-4 p-6 bg-navy-800 border-[0.5px] border-navy-500 rounded-xl">
      <Link
        href="/"
        className="flex items-center gap-2 text-navy-200 hover:text-navy-100 transition-colors"
      >
        <MoveLeftIcon className="size-4" />
        <span className="text-xs">Back to board</span>
      </Link>

      <div className="flex items-center gap-2">
        <Skeleton className="rounded-lg h-7 w-24" />
        <Skeleton className="rounded-lg h-7 w-16" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-8 w-2/3 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 rounded-lg w-full" />
          <Skeleton className="h-4 rounded-lg w-full" />
          <Skeleton className="h-4 rounded-lg w-full" />
          <Skeleton className="h-4 rounded-lg w-full" />
          <Skeleton className="h-4 rounded-lg w-full" />
          <Skeleton className="h-4 rounded-lg w-3/5" />
        </div>
      </div>
    </main>
  )
}
