import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

function Loading() {

    return (
        <Box>
            <CircularProgress disableShrink/>
        </Box>
    );

}

export default Loading;