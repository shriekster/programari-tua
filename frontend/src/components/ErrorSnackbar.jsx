
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { useGlobalStore } from '../useGlobalStore.js';

export default function ErrorSnackbar() {

    const [showError, setError] = useGlobalStore((state) => [state.showError, state.setError]);
    const errorMessage = useGlobalStore((state) => state.errorMessage);

    const handleErrorClose = (_event, reason) => {

        if (reason === 'clickaway') {
          return;
        }
    
        setError(false);
    
    };

    return (
        <Snackbar open={showError} autoHideDuration={6000} onClose={handleErrorClose}>
            <Alert onClose={handleErrorClose} severity='error' variant='outlined' sx={{ width: '100%' }}>
            {errorMessage}
            </Alert>
        </Snackbar>
    );

}