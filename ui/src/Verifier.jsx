import { useState } from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import useGlobalStore from './useGlobalStore';

export default function Verifier() {

  const [verifying, setVerifying] = useGlobalStore((state) => [state.verifying, state.setVerifying]);

  const [loading, setLoading] = useState(true);

  const handleClick = () => {
    setVerifying(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setVerifying(false);
  };

  const handleSuccess = (token) => {

    console.info('Challenge passed!');
    setLoading(false);

  };

  const action = (
    <>
      <Button color="secondary" size="small" onClick={handleClose}>
        UNDO
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  return (
    <div style={{
      position: 'relative'
    }}>
      <Snackbar
        open={verifying}
        autoHideDuration={6000}
        onClose={handleClose}
        message="Note archived"
        action={action}
      />
    </div>
  );
}