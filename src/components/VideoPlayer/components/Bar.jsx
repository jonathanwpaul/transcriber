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
  const theme = useTheme()
  const flexProperty = { flex: '0 0 6rem' }
  return (
    <>
      <Typography>{title}</Typography>
      <Stack
        sx={{
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <Box sx={flexProperty}>
          <Typography>{timestampFormatter(currentTime)}</Typography>
        </Box>
        <Stack sx={{ flexBasis: '90%', position: 'relative', width: '100%' }}>
          <Slider
            disableSwap
            min={0}
            max={duration}
            onChange={handleIntervalChange}
            size='large'
            step={0.1}
            sx={{
              color: theme.palette.slider.background,
              position: 'absolute',
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
                height: 20,
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
            color={theme.palette.slider.main}
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
        <Box sx={flexProperty}>
          <Typography>{timestampFormatter(duration)}</Typography>
        </Box>
      </Stack>
    </>
  )
}
