import { Preferences } from '@capacitor/preferences'

//TODO: move this to a hook
export const getValue = async key => {
  const { value } = await Preferences.get({ key })

  // try {
  //   return JSON.parse(value)
  // } catch (ex) {
  //   console.log(ex)
  // }
  return value
}

export const setValue = async (key, value) => {
  await Preferences.set({
    key,
    value: JSON.stringify(value),
  })
}

export const removeKey = async key => {
  await Preferences.remove({ key })
}
