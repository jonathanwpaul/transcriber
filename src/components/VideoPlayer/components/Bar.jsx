import { Slider, useTheme } from '@mui/material'

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
  const theme = useTheme()
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[4],
        paddingBottom: 20,
        paddingTop: 10,
        paddingLeft: 30,
        paddingRight: 30,
      }}
    >
      <p>{title}</p>
      <div
        style={{
          display: 'flex',
          gap: 20,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {timestampFormatter(currentTime)}
        <div style={{ flex: 1, position: 'relative' }}>
          <Slider
            color='secondary'
            disableSwap
            min={0}
            max={duration}
            onChange={handleIntervalChange}
            size='large'
            step={0.1}
            style={{
              position: 'absolute',
            }}
            sx={{
              '& .MuiSlider-thumb': {
                '&[data-index="0"]': {
                  color: 'green',
                  transform: 'translateX(-50%) translateY(-150%)', //rotate(-135deg)',
                },

                '&[data-index="1"]': {
                  color: 'red',
                  transform: 'translateX(-50%) translateY(-150%)', //rotate(-135deg)',
                },
                /* Border */
                // borderRadius: '0px 50% 50% 50%',

                /* Size */
                height: '2rem',
                width: '2rem',
              },
              '& .MuiSlider-track': {
                boxSizing: 'border-box',
                borderRadius: '5px',
                borderLeft: '5px solid green',
                borderRight: '5px solid red',
                color: '#eeeeee95',
                opacity: 0.8,
                height: 30,
              },
              '.MuiSlider-rail': {
                height: 0,
              },
            }}
            value={[sectionStart, sectionEnd]}
            valueLabelDisplay='auto'
            valueLabelFormat={timestampFormatter}
          />
          {/* the playback slider (mirrors video playback slider) */}
          <Slider
            min={0}
            max={duration}
            onChange={handleSeek}
            size='large'
            step={0.1}
            value={currentTime}
            valueLabelDisplay='auto'
            valueLabelFormat={timestampFormatter}
          />
        </div>
        {timestampFormatter(duration)}
      </div>
    </div>
  )
}
