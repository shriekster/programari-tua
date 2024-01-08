
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { navigate } from 'wouter/use-location';

export default function NotFound() {

  const handleButtonClick = () => {

    navigate('/', {
      replace: true
    });

  };

  return (
    <Box sx={{
      height: '100dvh',
      width: '100dvw',
      margin: 0,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <Typography>
        Această pagină nu există!
      </Typography>
      <Typography>
        Mergi la
      </Typography>
      <Button onClick={handleButtonClick}
        sx={{ textTransform: 'none' }}
        variant='outlined'>
        pagina principală
      </Button>
    </Box>
  );
}
  