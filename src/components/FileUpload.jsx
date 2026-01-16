import React, { useRef, useState } from 'react'
import { Upload } from 'lucide-react'

import { cn } from '../lib/utils'

export default function FileUpload({ onFileSelect, accept = '*', className }) {
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
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        className={cn(
          'flex min-h-28 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors',
          dragActive ? 'border-primary bg-accent' : 'border-border bg-card',
        )}
        tabIndex={0}
        role='button'
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type='file'
          accept={accept}
          className='hidden'
          onChange={handleInputChange}
        />
        <div className='flex flex-col items-center gap-2 text-center'>
          <Upload className='h-10 w-10 text-muted-foreground' />
          <div className='text-sm font-medium'>Upload media file</div>
          <div className='text-xs text-muted-foreground'>
            Tap to browse or drag & drop
          </div>
        </div>
      </div>

      {fileName && (
        <div className='text-xs text-muted-foreground'>{fileName}</div>
      )}
    </div>
  )
}
