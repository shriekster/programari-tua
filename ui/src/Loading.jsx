import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';

import loadingImage from './assets/loading.gif';

function Loading() {

    return (
        <>
            <CssBaseline />
            <Container maxWidth='lg' sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                minHeight: '-webkit-fill-available',
                height: '100vh'
            }}>
                <img src={loadingImage} width={100} height={100}/>
            </Container>
        </>
    );

}

export default Loading;