import { getValue } from '@utils/preference'
import { Preferences } from '@capacitor/preferences'
import { useEffect, useRef, useState } from 'react'

export const usePreferenceValue = ({ key }) => {
  const [preference, setPreference] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const setValue = async (key, val) => {
    const value = JSON.stringify(val)
    await Preferences.set({
      key,
      value,
    })
    setPreference(value)
  }

  const removeKey = async key => {
    await Preferences.remove({ key })
  }

  useEffect(() => {
    const fetchValue = async () => {
      console.log('refreshing value')
      try {
        const value = await getValue(key)
        setPreference(value)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchValue()
  })

  return { preference, loading, error, setValue }
}
