import { VoiceRecorder } from 'capacitor-voice-recorder'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'

import { addRecording, deleteRecording } from '@lib/storage/dbService'

const FILE_DIRECTORY = Directory.Documents
const FILE_DIRECTORY_KEY = 'DOCUMENTS'

function mimeToExt(mimeType) {
  if (!mimeType) return 'webm'
  if (mimeType.includes('ogg')) return 'ogg'
  if (mimeType.includes('mp4')) return 'm4a'
  if (mimeType.includes('wav')) return 'wav'
  return 'webm'
}

export async function requestRecordingPermission() {
  const result = await VoiceRecorder.requestAudioRecordingPermission()
  return result.value
}

export async function hasRecordingPermission() {
  const result = await VoiceRecorder.hasAudioRecordingPermission()
  return result.value
}

export async function startRecording() {
  await VoiceRecorder.startRecording()
}

export async function stopAndSaveRecording({ loopId, name }) {
  const { value } = await VoiceRecorder.stopRecording()
  const { recordDataBase64, mimeType } = value

  const ext = mimeToExt(mimeType)
  const fileName = `recordings/${loopId}_${Date.now()}.${ext}`

  await Filesystem.writeFile({
    path: fileName,
    data: recordDataBase64,
    directory: FILE_DIRECTORY,
    recursive: true,
  })

  return addRecording({ loopId, filePath: fileName, fileDirectory: FILE_DIRECTORY_KEY, name: name ?? null })
}

export async function getAudioSrc(filePath, mimeType, fileDirectory) {
  const directory = fileDirectory === 'DOCUMENTS' ? Directory.Documents : Directory.Data
  if (Capacitor.isNativePlatform()) {
    const { uri } = await Filesystem.getUri({ path: filePath, directory })
    return Capacitor.convertFileSrc(uri)
  }
  const result = await Filesystem.readFile({ path: filePath, directory })
  const mime = mimeType || 'audio/webm'
  return `data:${mime};base64,${result.data}`
}

export async function removeRecordingFile(id) {
  const record = await deleteRecording(id)
  if (record?.filePath) {
    const directory = record.fileDirectory === 'DOCUMENTS' ? Directory.Documents : Directory.Data
    try {
      await Filesystem.deleteFile({ path: record.filePath, directory })
    } catch {
      // file may already be gone
    }
  }
}
