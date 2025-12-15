import { Slider } from '@components/ui/slider'

export const Bar = ({
  title,
  currentTime,
  duration,
  handleSeek,
  handleIntervalChange,
  sectionStart,
  sectionEnd,
  timestampFormatter,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="truncate text-sm font-medium">{title}</div>

      <div className="flex items-center gap-3">
        <div className="w-16 shrink-0 text-xs text-muted-foreground">
          {timestampFormatter(currentTime)}
        </div>

        <div className="relative flex-1">
          {/* loop range */}
          <div className="absolute inset-0 flex items-center">
            <Slider
              min={0}
              max={duration}
              step={0.1}
              value={[sectionStart, sectionEnd]}
              onValueChange={handleIntervalChange}
              className="opacity-80"
            />
          </div>

          {/* playback position */}
          <Slider
            min={0}
            max={duration}
            step={0.1}
            value={[currentTime]}
            onValueChange={val => handleSeek(val[0])}
          />
        </div>

        <div className="w-16 shrink-0 text-right text-xs text-muted-foreground">
          {timestampFormatter(duration)}
        </div>
      </div>
    </div>
  )
}
