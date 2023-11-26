import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Link } from 'wouter';


function CustomButton(props) {

  return (
      <Button variant='outlined'
          sx={{
              textTransform: 'lowercase',
              padding: '1px',
              margin: '4px'
          }}
          size='large'
          onClick={props?.onClick}>
          pagina de pornire
      </Button>
  );

}

function CustomLink(props) {

  return (
    <Link href={props.href}>
        <CustomButton />
    </Link>
  )

}

export default CustomLink;