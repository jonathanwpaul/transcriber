import { VoiceRecorder } from 'capacitor-voice-recorder'
import { Filesystem, Directory } from '@capacitor/filesystem'

import { addRecording, deleteRecording } from '@lib/storage/dbService'

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
    directory: Directory.Data,
    recursive: true,
  })

  return addRecording({ loopId, filePath: fileName, name: name ?? null })
}

export async function getAudioSrc(filePath, mimeType) {
  const result = await Filesystem.readFile({
    path: filePath,
    directory: Directory.Data,
  })
  const mime = mimeType || 'audio/webm'
  return `data:${mime};base64,${result.data}`
}

export async function removeRecordingFile(id) {
  const filePath = await deleteRecording(id)
  if (filePath) {
    try {
      await Filesystem.deleteFile({ path: filePath, directory: Directory.Data })
    } catch {
      // file may already be gone
    }
  }
}
