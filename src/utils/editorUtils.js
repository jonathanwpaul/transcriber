export function tokenize(str) {
  var arr = str.split(/(!.+?!|".+?")/)
  var output = []
  for (var i = 0; i < arr.length; i++) {
    var token = arr[i]
    if (token.length > 0) {
      if (token[0] !== '"' && token[0] !== '!') {
        var arr2 = arr[i].split(/([A-Ga-g][,']*)/)
        output = output.concat(arr2)
      } else output.push(token)
    }
  }
  return output
}

export function sanitize(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// prettier-ignore
export const allPitches = [
    'C,,,,', 'D,,,,', 'E,,,,', 'F,,,,', 'G,,,,', 'A,,,,', 'B,,,,',
    'C,,,', 'D,,,', 'E,,,', 'F,,,', 'G,,,', 'A,,,', 'B,,,',
    'C,,', 'D,,', 'E,,', 'F,,', 'G,,', 'A,,', 'B,,',
    'C,', 'D,', 'E,', 'F,', 'G,', 'A,', 'B,',
    'C', 'D', 'E', 'F', 'G', 'A', 'B',
    'c', 'd', 'e', 'f', 'g', 'a', 'b',
    "c'", "d'", "e'", "f'", "g'", "a'", "b'",
    "c''", "d''", "e''", "f''", "g''", "a''", "b''",
    "c'''", "d'''", "e'''", "f'''", "g'''", "a'''", "b'''",
    "c''''", "d''''", "e''''", "f''''", "g''''", "a''''", "b''''"
];

export function moveNote(note, step) {
  console.log(note)
  var x = allPitches.indexOf(note)
  if (x >= 0) return allPitches[x - step]
  return note
}

export function updateAbcString(abcString, selectedAbcElem, newValue) {
  console.log(abcString)
  const { startChar, endChar } = selectedAbcElem
  return abcString.slice(0, startChar) + newValue + abcString.slice(endChar)
}
