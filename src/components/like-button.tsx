import type { IssueInteractionsResponseSchema } from '@/api/routes/schemas/issue-interactions'
import { toggleLike } from '@/http/toggle-like'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ThumbsUpIcon } from 'lucide-react'
import type { ComponentProps, MouseEvent } from 'react'
import { twMerge } from 'tailwind-merge'
import type z from 'zod'
import { Button } from './button'

interface LikeButtonProps extends ComponentProps<'button'> {
  issueId: string
  initialLikes: number
  initialLiked?: boolean
}

type IssueInteractionsResponse = z.infer<typeof IssueInteractionsResponseSchema>

export function LikeButton({
  issueId,
  initialLikes,
  initialLiked,
  className,
  ...props
}: LikeButtonProps) {
  const queryClient = useQueryClient()

  const { mutate: onToggleLike, isPending } = useMutation({
    mutationFn: () => toggleLike({ issueId }),
    onMutate: async () => {
      const previousData =
        queryClient.getQueriesData<IssueInteractionsResponse>({
          queryKey: ['issue-likes'],
        })

      queryClient.setQueriesData<IssueInteractionsResponse>(
        {
          queryKey: ['issue-likes'],
        },
        (old) => {
          if (!old) return undefined

          return {
            ...old,
            interactions: old.interactions.map((interaction) => {
              if (interaction.issueId !== issueId) return interaction

              return {
                ...interaction,
                likesCount: interaction.isLiked
                  ? interaction.likesCount - 1
                  : interaction.likesCount + 1,
                isLiked: !interaction.isLiked,
              }
            }),
          }
        },
      )

      return { previousData }
    },
    onError: async (_record, _params, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData<IssueInteractionsResponse>(queryKey, data)
        }
      }
    },
  })

  const liked = initialLiked

  function handleToggleLike(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    onToggleLike()
  }

  return (
    <Button
      data-liked={liked}
      className={twMerge(
        'data-[liked=true]:bg-accent-strong data-[liked=true]:text-white data-[liked=true]:hover:bg-accent-strong/90',
        className,
      )}
      aria-label={liked ? 'Descurtir issue' : 'Curtir issue'}
      onClick={handleToggleLike}
      disabled={isPending}
      {...props}
    >
      <ThumbsUpIcon className="size-3" />

      <span className="text-sm">{initialLikes}</span>
    </Button>
  )
}
