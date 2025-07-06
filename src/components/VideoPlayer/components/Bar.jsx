import { Box, Slider, Typography, useTheme } from '@mui/material'
import { Stack } from '../../Stack'

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
    <Box>
      <Typography>{title}</Typography>
      <Stack
        sx={{
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <Typography>{timestampFormatter(currentTime)}</Typography>
        <Stack sx={{ width: '100%', position: 'relative' }}>
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
        </Stack>
        <Typography>{timestampFormatter(duration)}</Typography>
      </Stack>
    </Box>
  )
}
