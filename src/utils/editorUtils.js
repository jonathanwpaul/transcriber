export function tokenize(str) {
  var arr = str.split(/(!.+?!|".+?")/)
  var output = []
  for (var i = 0; i < arr.length; i++) {
    var token = arr[i]
    if (token.length > 0) {
      if (token[0] !== '"' && token[0] !== '!') {
        var arr2 = arr[i].split(/([A-Ga-gZz][,']*)/)
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
  var x = allPitches.indexOf(note)
  if (x >= 0) return allPitches[x - step]
  return note
}

export function updateAbcString(abcString, start, end, insertValue) {
  return abcString.slice(0, start) + insertValue + abcString.slice(end)
}

export const durationMapping = [
  { label: 'W', text: '8', duration: 1 },
  { label: 'H', text: '4', duration: 1 / 2 },
  { label: 'Q', text: '2', duration: 1 / 4 },
  { label: '8th', text: '1', duration: 1 / 8 },
  { label: '16th', text: '/', duration: 1 / 16 },
  { label: '32nd', text: '//', duration: 1 / 32 },
  { label: '64th', text: '///', duration: 1 / 64 },
  { label: '128th', text: '////', duration: 1 / 128 },
]

export function getDurationText(duration) {
  const lookup = durationMapping.filter(e => e.duration === duration)
  return lookup ? lookup[0]?.text : undefined
}
