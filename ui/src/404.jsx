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

function NotFound() {

  return (
    <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100dvh'
        }}>
        <Typography sx={{ margin: '4px' }}>
            Această pagină nu există! 
        </Typography>
        <Typography sx={{ margin: '4px' }}>
                Mergi la
            </Typography>
        <Link href='/'>
            <CustomButton />
        </Link>
    </Box>
  )
}

export default NotFound;
