
import { useState, useEffect, useRef } from 'react';


import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import IconButton  from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PlaceIcon from '@mui/icons-material/Place';
import CircularProgress from '@mui/material/CircularProgress';

import { useGlobalStore } from '../useGlobalStore.js';

import refreshAccessToken from '../refreshAccessToken.js';

// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
  setError,
  setErrorMessage,
  addLocation,
} = useGlobalStore.getState();

export default function DateAdd({ open, handleClose, date }) {

  const onClose = (event, reason) => {

  };

    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>
          { // eslint-disable-next-line react/prop-types
            date?.$d?.toLocaleDateString('ro-RO')
          }
        </DialogTitle>
      </Dialog>
    )
  }
  