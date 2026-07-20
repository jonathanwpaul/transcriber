import { useEffect, useRef, useState } from 'react'
import {
  ChevronRight,
  Edit2,
  Folder,
  FolderPlus,
  Plus,
  Trash2,
} from 'lucide-react'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

const songLabel = song =>
  song.display_name || song.name || song.file_name || song.id

function SongRow({ song, isSelected, onToggleSelect, onOpen, onRename, onDelete, onFolders }) {
  return (
    <div className='flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent'>
      <input
        type='checkbox'
        className='h-4 w-4 shrink-0 cursor-pointer accent-primary'
        checked={isSelected}
        onChange={() => onToggleSelect(song.id)}
        onClick={e => e.stopPropagation()}
        aria-label={`Select ${songLabel(song)}`}
      />
      <Button
        variant='ghost'
        className='min-w-0 flex-1 justify-start truncate text-left text-sm font-medium'
        onClick={() => onOpen(song.id, song.type)}
      >
        {songLabel(song)}
      </Button>
      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        onClick={() => onFolders(song)}
        aria-label={`Manage folders for ${songLabel(song)}`}
      >
        <Folder />
      </Button>
      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        onClick={() => onRename(song)}
        aria-label={`Rename ${songLabel(song)}`}
      >
        <Edit2 />
      </Button>
      <Button
        variant='ghost'
        size='icon'
        className='h-8 w-8 text-destructive'
        onClick={() => onDelete(song)}
        aria-label={`Delete ${songLabel(song)}`}
      >
        <Trash2 />
      </Button>
    </div>
  )
}

export const SongBrowser = ({
  songs,
  folders,
  onOpen,
  onRename,
  onDelete,
  onFolders,
  onCreateFolder,
  onBulkDelete,
  onBulkMove,
}) => {
  const [collapsed, setCollapsed] = useState({})
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [folderPickerOpen, setFolderPickerOpen] = useState(false)

  const songsByFolder = folderId =>
    songs.filter(song => song.folders?.some(folder => folder.id === folderId))
  const unfiledSongs = songs.filter(song => !song.folders?.length)

  const toggleSong = id => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleFolder = (folderId, folderSongIds) => {
    const allSelected = folderSongIds.every(id => selectedIds.has(id))
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) {
        folderSongIds.forEach(id => next.delete(id))
      } else {
        folderSongIds.forEach(id => next.add(id))
      }
      return next
    })
  }

  const selectedSongs = songs.filter(s => selectedIds.has(s.id))

  const singleSelected =
    selectedIds.size === 1 ? songs.find(s => selectedIds.has(s.id)) : null

  const createFolder = async event => {
    event.preventDefault()
    await onCreateFolder(folderName)
    setFolderName('')
    setNewFolderOpen(false)
  }

  const handleBulkDelete = () => {
    onBulkDelete(selectedSongs)
  }

  const handleFolderPick = folder => {
    setFolderPickerOpen(false)
    onBulkMove(selectedSongs, folder)
  }

  return (
    <div className='flex flex-col gap-5'>
      <section>
        <div className='mb-2'>
          <CardTitle>Song library</CardTitle>
        </div>

        {selectedIds.size > 0 && (
          <Card className='mb-2'>
            <CardContent className='flex items-center justify-between gap-2 py-3'>
              <span className='text-sm text-muted-foreground'>
                {selectedIds.size} selected
              </span>
              <div className='flex items-center gap-1'>
                {singleSelected && (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => onRename(singleSelected)}
                    aria-label='Rename selected song'
                  >
                    <Edit2 />
                  </Button>
                )}
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => setFolderPickerOpen(true)}
                  aria-label='Move selected songs to folder'
                >
                  <Folder />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-destructive'
                  onClick={handleBulkDelete}
                  aria-label='Delete selected songs'
                >
                  <Trash2 />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center justify-between gap-2 text-sm'>
              <span>/</span>
              <Button
                variant='ghost'
                size='sm'
                className='h-7 gap-1 px-2 text-xs text-muted-foreground'
                onClick={() => setNewFolderOpen(true)}
              >
                <FolderPlus className='h-3.5 w-3.5' /> New folder
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-1 pt-0'>
            {folders.map(folder => {
              const folderSongs = songsByFolder(folder.id)
              const folderSongIds = folderSongs.map(s => s.id)
              const isCollapsed = collapsed[folder.id]
              const allSelected =
                folderSongIds.length > 0 &&
                folderSongIds.every(id => selectedIds.has(id))
              const someSelected =
                !allSelected && folderSongIds.some(id => selectedIds.has(id))

              return (
                <div key={folder.id}>
                  <div className='flex items-center gap-1'>
                    <FolderCheckbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={() => toggleFolder(folder.id, folderSongIds)}
                      aria-label={`Select all songs in ${folder.name}`}
                    />
                    <Button
                      variant='ghost'
                      className='flex flex-1 justify-start gap-2 rounded-md px-2 py-2 text-left text-sm font-medium'
                      onClick={() =>
                        setCollapsed(current => ({
                          ...current,
                          [folder.id]: !isCollapsed,
                        }))
                      }
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                      />
                      <Folder className='h-4 w-4' />
                      <span>{folder.name}</span>
                      <span className='ml-auto text-xs text-muted-foreground'>
                        {folderSongs.length}
                      </span>
                    </Button>
                  </div>
                  {!isCollapsed &&
                    folderSongs.map(song => (
                      <div className='ml-5' key={`${folder.id}-${song.id}`}>
                        <SongRow
                          song={song}
                          isSelected={selectedIds.has(song.id)}
                          onToggleSelect={toggleSong}
                          onOpen={onOpen}
                          onRename={onRename}
                          onDelete={onDelete}
                          onFolders={onFolders}
                        />
                      </div>
                    ))}
                </div>
              )
            })}
            {unfiledSongs.length > 0 && (
              <div className='mt-2 border-t pt-2'>
                {unfiledSongs.map(song => (
                  <SongRow
                    key={song.id}
                    song={song}
                    isSelected={selectedIds.has(song.id)}
                    onToggleSelect={toggleSong}
                    onOpen={onOpen}
                    onRename={onRename}
                    onDelete={onDelete}
                    onFolders={onFolders}
                  />
                ))}
              </div>
            )}
            {!songs.length && (
              <p className='px-3 py-2 text-sm text-muted-foreground'>
                No songs saved yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Create folder</DialogTitle>
          </DialogHeader>
          <form className='flex gap-2 pt-2' onSubmit={createFolder}>
            <Input
              autoFocus
              value={folderName}
              onChange={event => setFolderName(event.target.value)}
              placeholder='Folder name'
            />
            <Button type='submit' disabled={!folderName.trim()}>
              <Plus />
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={folderPickerOpen} onOpenChange={setFolderPickerOpen}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Move to folder</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-1 pt-2'>
            {!folders.length && (
              <p className='text-sm text-muted-foreground'>
                No folders yet. Create one first.
              </p>
            )}
            {folders.map(folder => (
              <Button
                key={folder.id}
                variant='ghost'
                className='justify-start gap-2'
                onClick={() => handleFolderPick(folder)}
              >
                <Folder className='h-4 w-4' />
                {folder.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FolderCheckbox({ checked, indeterminate, onChange, 'aria-label': ariaLabel }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <input
      ref={ref}
      type='checkbox'
      className='h-4 w-4 shrink-0 cursor-pointer accent-primary'
      checked={checked}
      onChange={onChange}
      aria-label={ariaLabel}
    />
  )
}

export { songLabel }
