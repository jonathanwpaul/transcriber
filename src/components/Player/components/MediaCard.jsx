import { Card } from '@components/ui'

export function MediaCard({ mediaPlayerRef, isVideo, showVideo }) {
  const mediaComponent = mediaPlayerRef.current?.renderComponent({
    constrainHeight: isVideo,
  })

  return (
    <Card
      className={`flex aspect-video flex-col gap-4 overflow-hidden ${
        showVideo ? '' : 'hidden'
      }`}
    >
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
