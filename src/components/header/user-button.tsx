'use client'

import { authClient } from '@/lib/auth-client'
import { useHydrated } from '@/lib/use-hydrated'
import { Loader2, LogInIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function UserButton() {
  const router = useRouter()
  const isHydrated = useHydrated()

  const { data: session, isPending } = authClient.useSession()

  async function handleSignin() {
    const callbackURL = `${window.location.pathname}${window.location.search}`
    await authClient.signIn.social({ provider: 'github', callbackURL })
  }

  async function handleSignout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/')
        },
      },
    })
  }

  return (
    <>
      {!isHydrated || isPending ? (
        <div role="status" aria-label="Carregando sessão" className="flex size-8 items-center justify-center rounded-full border border-navy-500 bg-navy-700">
          <Loader2 aria-hidden="true" className="size-3.5 animate-spin text-navy-200" />
        </div>
      ) : session?.user ? (
        <div>
          <button
            type="button"
            onClick={handleSignout}
            aria-label={`Sair da conta de ${session.user.name}`}
            title="Sair"
            className="size-8 cursor-pointer overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
          >
            {/** biome-ignore lint/performance/noImgElement: github optimize the image */}
            <img
              src={session.user.image ?? ''}
              alt=""
              className="size-8 rounded-full"
            />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSignin}
          aria-label="Entrar com GitHub"
          title="Entrar com GitHub"
          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-navy-500 bg-navy-700 transition-colors duration-150 hover:bg-navy-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
        >
          <LogInIcon className="size-3.5 text-navy-200" />
        </button>
      )}
    </>
  )
}
