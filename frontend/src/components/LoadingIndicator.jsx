import CircularProgress from '@mui/material/CircularProgress';

import { useGlobalStore } from '../useGlobalStore.js';

export default function LoadingIndicator() {

    const loading = useGlobalStore((state) => state.loading);

    if (loading) {

        return (
        <CircularProgress
            size={48}
            color='primary'
            thickness={8}
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-24px',
                marginLeft: '-24px',
            }}
            disableShrink
            />
        );

    }

    return null;

}