import { getIssue } from '@/http/get-issue'
import { ImageResponse } from 'next/og'

interface IssueImageProps {
  params: {
    id: string
  }
}

export async function IssueImage({ params }: IssueImageProps) {
  'use cache'

  const { id } = params

  const issue = await getIssue({ id })

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        background: '#101720',
        padding: '80px',
      }}
    >
      <p
        style={{
          fontSize: 48,
          fontWeight: 600,
          color: '#9aabbc',
        }}
      >
        ISS-{issue.issueNumber}
      </p>
      <p
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: '#edf2f5',
          textAlign: 'center',
          maxWidth: 1000,
        }}
      >
        {issue.title}
      </p>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
