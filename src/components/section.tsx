import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

interface SectionRootProps extends ComponentProps<"div"> {}

function SectionRoot({ className, ...props }: SectionRootProps) {
  return (
    <div
      className={twMerge(
        "bg-navy-800/80 rounded-xl border border-navy-600 flex min-h-0 flex-col overflow-hidden",
        className,
      )}
      {...props}
    />
  )
}

interface SectionHeaderProps extends ComponentProps<"div"> {}

function SectionHeader({ className, ...props }: SectionHeaderProps) {
  return (
    <div
      className={twMerge("flex items-center justify-between gap-3 px-4 py-3", className)}
      {...props}
    />
  )
}

interface SectionTitleProps extends ComponentProps<"span"> {}

function SectionTitle({ className, ...props }: SectionTitleProps) {
  return (
    <span
      className={twMerge(
        "flex items-center gap-2 text-sm font-medium text-navy-100",
        className,
      )}
      {...props}
    />
  )
}

interface SectionIssueCountProps extends ComponentProps<"span"> {}

function SectionIssueCount({ className, ...props }: SectionIssueCountProps) {
  return (
    <span
      className={twMerge(
        "rounded-md bg-navy-700 px-2 py-1 text-xs tabular-nums text-navy-200",
        className,
      )}
      {...props}
    />
  )
}

interface SectionContentProps extends ComponentProps<"div"> {}

function SectionContent({ className, ...props }: SectionContentProps) {
  return (
    <div
      className={twMerge(
        "flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-navy-600 scrollbar-track-transparent",
        className,
      )}
      {...props}
    />
  )
}

export const Section = {
  Root: SectionRoot,
  Header: SectionHeader,
  Title: SectionTitle,
  IssueCount: SectionIssueCount,
  Content: SectionContent,
}
