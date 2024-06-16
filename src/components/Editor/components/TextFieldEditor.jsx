import { Box, Card, TextField } from '@mui/material'
import { styled } from '@mui/material'

const TextFieldEditor = ({
  onChange,
  selectedAbcElem,
  value,
  ...otherProps
}) => {
  console.log(selectedAbcElem)

  return (
    <div
      // className='container'
      style={{ position: 'relative', display: 'block' }}
    >
      <TextField
        fullWidth
        multiline
        onChange={onChange}
        value={value}
        InputProps={{ style: { height: '100%' } }}
        maxRows={5}
        {...otherProps}
      />
      {/* <Box
        alignContent='center'
        height='100%'
        boxSizing='border-box'
        px='14px'
        py='16.5px'
        position='absolute'
        top={0}
        // style={{
        //   // alignContent: 'center',
        //   // color: 'blue',
        //   // boxSizing: 'border-box',
        //   // height: '100%',
        //   // padding: '16.5px',
        //   // paddingLeft: '14px',
        //   // paddingRight: '14px',
        //   position: 'absolute',
        //   // pointerEvents: 'none',
        //   top: 0,
        // }}
        // className='MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputMultiline' */}

      {selectedAbcElem && (
        <div>
          {value.slice(0, selectedAbcElem.startChar)}
          <span
            style={{
              background: 'rgb(128, 248, 252)',
            }}
          >
            {value.slice(selectedAbcElem.startChar, selectedAbcElem.endChar)}
          </span>
          {value.slice(selectedAbcElem.endChar)}
        </div>
      )}
      {!selectedAbcElem && <div>{value}</div>}
    </div>
  )
}

export default TextFieldEditor
