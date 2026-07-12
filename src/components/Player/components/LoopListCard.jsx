import { Card } from '@components/ui'
import { SavedSection } from './SavedSection'

export function LoopListCard({
  loops,
  loopStart,
  loopEnd,
  collapsedLoops,
  setCollapsedLoops,
  onLoadLoop,
  onDeleteLoop,
  onTitleChange,
  className,
}) {
  const renderLoop = (loop, pathKey) => {
    const hasChildren = !!(
      loop.children && Object.keys(loop.children).length > 0
    )
    const isCollapsed = !!collapsedLoops[pathKey]

    return (
      <div key={pathKey} className='flex flex-col gap-2'>
        <SavedSection
          endTime={loop.loopEnd}
          isSelected={loop.loopStart === loopStart && loop.loopEnd === loopEnd}
          onClick={() => onLoadLoop(loop)}
          onDelete={() => onDeleteLoop(loop)}
          onTitleChange={title => onTitleChange(pathKey, title)}
          startTime={loop.loopStart}
          title={loop.title}
          hasChildren={hasChildren}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => {
            setCollapsedLoops(prev => ({ ...prev, [pathKey]: !prev[pathKey] }))
          }}
        />

        {hasChildren && !isCollapsed && (
          <div className='pl-4'>
            {Object.values(loop.children).map(child => {
              const childKey = `${child.loopStart}-${child.loopEnd}`
              return renderLoop(child, `${pathKey}/${childKey}`)
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={`flex flex-col overflow-hidden p-2 pb-6 ${className ?? 'min-h-[50%]'}`}>
      {loops && Object.keys(loops).length > 0 ? (
        <div className='flex flex-col'>
          {Object.values(loops)
            .sort((a, b) => a.loopStart - b.loopStart)
            .map(loop => {
              const key = `${loop.loopStart}-${loop.loopEnd}`
              return renderLoop(loop, key)
            })}
        </div>
      ) : (
        <div className='p-3 text-sm text-muted-foreground'>
          Save a loop to see it here
        </div>
      )}
    </Card>
  )
}
