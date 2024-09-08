import { getValue } from '@utils/preference'
import { Preferences } from '@capacitor/preferences'
import { useEffect, useRef, useState } from 'react'

export const usePreferenceValue = ({ key }) => {
  const [preference, setPreference] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  return { preference, loading, error }
}
