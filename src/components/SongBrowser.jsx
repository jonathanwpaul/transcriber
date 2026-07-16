import { useState } from 'react'
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

function SongRow({ song, onOpen, onRename, onDelete, onFolders }) {
  return (
    <div className='flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent'>
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
}) => {
  const [collapsed, setCollapsed] = useState({})
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [folderName, setFolderName] = useState('')

  const songsByFolder = folderId =>
    songs.filter(song => song.folders?.some(folder => folder.id === folderId))
  const unfiledSongs = songs.filter(song => !song.folders?.length)

  const createFolder = async event => {
    event.preventDefault()
    await onCreateFolder(folderName)
    setFolderName('')
    setNewFolderOpen(false)
  }

  return (
    <div className='flex flex-col gap-5'>
      <section>
        <div className='mb-2 flex items-center justify-between gap-2'>
          <CardTitle>Song library</CardTitle>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setNewFolderOpen(true)}
          >
            <FolderPlus /> New folder
          </Button>
        </div>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm'>/</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-1 pt-0'>
            {folders.map(folder => {
              const folderSongs = songsByFolder(folder.id)
              const isCollapsed = collapsed[folder.id]
              return (
                <div key={folder.id}>
                  <Button
                    variant='ghost'
                    className='flex w-full justify-start gap-2 rounded-md px-2 py-2 text-left text-sm font-medium'
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
                  {!isCollapsed &&
                    folderSongs.map(song => (
                      <div className='ml-5' key={`${folder.id}-${song.id}`}>
                        <SongRow
                          song={song}
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
    </div>
  )
}

export { songLabel }
