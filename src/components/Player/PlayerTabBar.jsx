import { Home, ListMusic, Settings2, Timer } from 'lucide-react'
import { Button } from '../ui'

const TABS = [
  { icon: Home, label: 'Home', value: 0 },
  { icon: Timer, label: 'Times', value: 1 },
  { icon: ListMusic, label: 'Loops', value: 2 },
  { icon: Settings2, label: 'Settings', value: 3 },
]

export function PlayerTabBar({ activeTab, onTabChange, onClose }) {
  return (
    <div className='flex border-t sm:hidden'>
      {TABS.map(({ icon: Icon, label, value }) => {
        const isHome = value === 0
        const isActive = !isHome && activeTab === value

        return (
          <Button
            key={label}
            variant='ghost'
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
              isActive ? 'text-foreground' : 'text-muted-foreground'
            }`}
            onClick={() => (isHome ? onClose() : onTabChange(value))}
            aria-label={label}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
          </Button>
        )
      })}
    </div>
  )
}
