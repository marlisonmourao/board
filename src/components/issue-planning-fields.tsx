import { Input } from '@/components/input'

export function IssuePlanningFields({ labels = [], dueDate = null }: { labels?: string[]; dueDate?: string | null }) {
  return <>
    <label className="block space-y-2 text-sm font-medium text-navy-100">Etiquetas <span className="font-normal text-navy-300">(separadas por vírgula)</span>
      <Input name="labels" defaultValue={labels.join(', ')} placeholder="Ex.: melhoria, interface" className="w-full" />
      <span className="block text-xs font-normal text-navy-300">Até 10 etiquetas, com até 40 caracteres cada.</span>
    </label>
    <label className="block space-y-2 text-sm font-medium text-navy-100">Prazo
      <Input name="dueDate" type="date" defaultValue={dueDate ?? ''} className="w-full" />
    </label>
  </>
}

export function IssuePlanningDisplay({ labels, dueDate }: { labels: string[]; dueDate: string | null }) {
  if (!labels.length && !dueDate) return null
  return <div className="flex flex-wrap items-center gap-2 text-xs text-navy-200">
    {labels.map((label) => <span key={label} className="rounded bg-navy-700 px-2 py-1">{label}</span>)}
    {dueDate && <span>Prazo: {dueDate.split('-').reverse().join('/')}</span>}
  </div>
}
