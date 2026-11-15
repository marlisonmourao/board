import { Skeleton } from '@/components/skeleton'
import { issueStatusOptions } from '@/lib/issue-status'

export default function BoardLoading() {
  return (
    <div className="grid min-h-[420px] flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {issueStatusOptions.map((status) => (
        <section
          key={status.value}
          aria-label={`Carregando coluna ${status.label}`}
          className="flex h-[calc(100dvh-260px)] min-h-[420px] flex-col overflow-hidden rounded-xl border border-navy-600 bg-navy-800/80 p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-6 w-8 rounded-md" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={`${status.value}-${item}`} className="space-y-3 rounded-lg border border-navy-600 bg-navy-800 p-4">
                <Skeleton className="h-3 w-14 rounded-sm" />
                <Skeleton className="h-4 w-4/5 rounded-sm" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
