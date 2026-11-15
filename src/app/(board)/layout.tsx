import { Header } from "./header"

export default function BoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1620px] flex-col gap-7 px-4 py-6 sm:px-6 sm:py-8 xl:px-8">
      <Header />

      {children}
    </div>
  )
}
