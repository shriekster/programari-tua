import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link } from 'wouter';

function CustomButton(props) {

    return (
        <Button variant='text'
            sx={{
                textTransform: 'lowercase',
                padding: '1px',
                margin: '0 4px'
            }}
            onClick={props.onClick}>
            pagina de pornire
        </Button>
    );

}

function NotFound() {

  return (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        Această pagină nu există! Mergi la
        <Link href='/'>
            <CustomButton />
        </Link>
        .
    </Box>
  )
}

export default NotFound;
