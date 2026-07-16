import { LoaderCircle } from 'lucide-react'

import { Card } from '@components/ui'

export function MediaCard({ mediaPlayerRef, isLoading, isVideo }) {
  const mediaComponent = mediaPlayerRef.current?.renderComponent({
    constrainHeight: isVideo,
  })

  return (
    <Card className='flex h-auto aspect-video flex-col gap-4 border-card overflow-hidden'>
      {isLoading && <LoaderCircle className='animate-spin' />}
      {mediaPlayerRef.current && (
        <div className='relative flex min-h-0 flex-1 justify-center'>
          <div className='h-full min-h-0 min-w-0 max-w-full'>
            {mediaComponent}
          </div>
        </div>
      )}
    </Card>
  )
}
