import { Card } from "@mui/material";

export const Header = ({title}) => {
  return <Card
    elevation={5}
    style={{border: '10px solid red'}}
  >
    {title}  
  </Card>
}
