import { Skeleton } from "@/components/skeleton"
import { MoveLeftIcon } from "lucide-react"
import Link from "next/link"

export default function IssuesLoading() {
  return (
    <main className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 rounded-xl border border-navy-600 bg-navy-800/80 p-5 sm:p-8">
      <Link
        href="/"
        className="flex items-center gap-2 text-navy-200 hover:text-navy-100 transition-colors"
      >
        <MoveLeftIcon className="size-4" />
        <span className="text-xs">Voltar ao quadro</span>
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
