import { Preferences } from '@capacitor/preferences'
import { useEffect, useState } from 'react'

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

  // const removeKey = async key => {
  //   await Preferences.remove({ key })
  // }

  useEffect(() => {
    const fetchValue = async () => {
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

const getValue = async key => {
  const { value } = await Preferences.get({ key })

  return value
}
