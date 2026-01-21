import { useEffect, useState } from 'react'

import { getJSON, setJSON } from '@lib/storage/mediaPreferencesService'

export const usePreferenceValue = ({ key }) => {
  const [preference, setPreference] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const setValue = async (keyArg, val) => {
    try {
      await setJSON(keyArg, val)
      // keep local state in sync with what we just wrote
      setPreference(JSON.stringify(val))
    } catch (err) {
      setError(err)
    }
  }

  const reload = async () => {
    try {
      const json = await getJSON(key, null)
      setPreference(json !== null ? JSON.stringify(json) : null)
    } catch (err) {
      setError(err)
    }
  }

  useEffect(() => {
    const fetchValue = async () => {
      try {
        const json = await getJSON(key, null)
        setPreference(json !== null ? JSON.stringify(json) : null)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchValue()
  }, [key])

  return { preference, loading, error, setValue, reload }
}
