import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import CustomLink from './CustomLink';

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
        <CustomLink href='/'/>
    </Box>
  )
}

export default NotFound;
