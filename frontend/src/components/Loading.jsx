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
            width: '100dvw',
            height: 'calc(100dvh - 56px)',
        }}>
            <CircularProgress
                  size={48}
                  color='secondary'
                  thickness={8}
                  disableShrink
              />
        </Box>
    );

}