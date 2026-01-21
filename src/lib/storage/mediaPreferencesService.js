import { Preferences } from '@capacitor/preferences'

// Generic JSON helpers
export async function getJSON(key, defaultValue = null) {
  const { value } = await Preferences.get({ key })
  if (!value) return defaultValue
  try {
    return JSON.parse(value)
  } catch {
    return defaultValue
  }
}

export async function setJSON(key, data) {
  const value = JSON.stringify(data ?? null)
  await Preferences.set({ key, value })
}

// Convenience helpers for existing keys
export const getVideos = () => getJSON('videos', {})
export const setVideos = videos => setJSON('videos', videos)

export const getAppSettings = () => getJSON('appSettings', {})
export const setAppSettings = settings => setJSON('appSettings', settings)
