'use client'

import { Input } from '@/components/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon, MessageCirclePlusIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import z from 'zod'

const createCommentSchema = z.object({
  text: z.string().trim().min(1, 'Escreva um comentário antes de publicar.'),
})

type CreateCommentSchema = z.infer<typeof createCommentSchema>

interface IssueCommentProps {
  onCreateComment: (text: string) => void
  isAuthenticated: boolean
}

export function IssueCommentForm({
  onCreateComment,
  isAuthenticated,
}: IssueCommentProps) {
  const [submitError, setSubmitError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCommentSchema>({
    resolver: zodResolver(createCommentSchema),
  })

  async function handleCreateComment(data: CreateCommentSchema) {
    setSubmitError('')
    try {
      await onCreateComment(data.text)
      reset()
    } catch {
      setSubmitError('Não foi possível publicar o comentário. Tente de novo.')
    }
  }

  return (
    <form
      className="relative w-full"
      onSubmit={handleSubmit(handleCreateComment)}
    >
      <Input
        aria-label="Escreva um comentário"
        className="h-11 w-full bg-navy-900 pr-28"
        placeholder={
          isAuthenticated
            ? 'Escreva um comentário…'
            : 'Entre para comentar'
        }
        disabled={!isAuthenticated || isSubmitting}
        {...register('text')}
      />

      {(errors.text?.message || submitError) && (
        <span role="alert" className="mt-1 block text-xs text-amber-300">
          {submitError || 'Escreva um comentário antes de publicar.'}
        </span>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !isAuthenticated}
        className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center gap-2 text-xs text-accent hover:text-navy-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Comentar
        {isSubmitting ? (
          <Loader2Icon className="size-3 animate-spin" />
        ) : (
          <MessageCirclePlusIcon className="size-3" />
        )}
      </button>
    </form>
  )
}
