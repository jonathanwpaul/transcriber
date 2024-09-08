import { Card } from '@mui/material'

const SavedSection = ({ onClick, startTime, endTime, isSelected }) => {
  const handleClick = onClick
  return (
    <div className='horizontal-container' style={{ alignItems: 'center' }}>
      <Card className='horizontal-container' onClick={handleClick}>
        <p>{`${startTime}-${endTime}`}</p>
      </Card>
    </div>
  )
}
export default SavedSection
