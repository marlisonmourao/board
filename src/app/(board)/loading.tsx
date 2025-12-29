import { Loader2 } from 'lucide-react'

export default function BoardLoading() {
  return (
    <div className="max-w-[1620px] w-full mx-auto p-10 flex flex-col gap-8 h-dvh">
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin" />
      </div>
    </div>
  )
}
