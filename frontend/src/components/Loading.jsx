import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function Loading() {

    return (
        <Box sx={{
            margin: 0,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '960px',
            height: 'calc(100dvh - 56px)',
        }}>
            <CircularProgress
                  size={48}
                  color='primary'
                  thickness={8}
                  disableShrink
              />
        </Box>
    );

}