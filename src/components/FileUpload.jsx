import React, { useRef, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useTheme } from '@emotion/react'
import { UploadFile } from '@mui/icons-material'

export default function FileUpload({ onFileSelect, accept = '*', stackProps }) {
  const theme = useTheme()
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState('')

  const handleDragOver = e => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = e => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = e => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name)
      onFileSelect && onFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = e => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name)
      onFileSelect && onFileSelect(e.target.files[0])
    }
  }

  return (
    <Stack gap='1rem' {...stackProps}>
      <Box
        sx={{
          border: `0.125rem dashed ${theme.palette.grey[800]}`,
          borderRadius: 2,
          display: 'flex',
          height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: dragActive
            ? theme.palette.background.paper
            : theme.palette.background.default,
          cursor: 'pointer',
          transition: 'background 0.2s',
          position: 'relative',
          padding: '1rem',
        }}
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        <Stack gap='0.5rem' alignItems='center'>
          <input
            ref={inputRef}
            type='file'
            accept={accept}
            style={{ display: 'none' }}
            onChange={handleInputChange}
          />
          <UploadFile sx={{ fontSize: '4rem' }} />
          <Typography variant='body1' sx={{ mb: 1 }}>
            upload media file
          </Typography>
        </Stack>
      </Box>
      {fileName && <Typography variant='body1'>{fileName}</Typography>}
    </Stack>
  )
}
