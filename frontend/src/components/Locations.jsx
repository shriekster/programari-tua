
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import AddLocationIcon from '@mui/icons-material/AddLocation';

import { useGlobalStore } from '../useGlobalStore';

import LocationAdd from './LocationAdd';

// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
  setLoading,
  setLocations,
  setLocationsDownloaded,
} = useGlobalStore.getState();

export default function Locations() {

  const [showAddDialog, setAddDialog] = useState(false);

  const loading = useGlobalStore((state) => state.loading);
  const locations = useGlobalStore((state) => state.locations);

  // eslint-disable-next-line no-unused-vars
  const handleOpenAddDialog = (_) => {

    setAddDialog(true);

  };

  const handleCloseAddDialog = (event, reason) => {

    if (['backdropClick', 'escapeKeyDown'].includes(reason)) {

      return;

    }

    setAddDialog(false);

  };

  return (
    <Box sx={{
      maxWidth: '960px', 
      padding: '64px 16px 16px 16px',
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        <Typography>
          Locurile de desfășurare ale antrenamentelor
        </Typography>
        <Button startIcon={<AddLocationIcon />}
          variant='contained'
          disabled={loading}
          sx={{ width: '150px' }}
          onClick={handleOpenAddDialog}>
          Adaugă
        </Button>
      </Box>
      <Divider variant='middle' />
      <List>
      {
        
      }
      </List>
      <LocationAdd open={showAddDialog} handleClose={handleCloseAddDialog}/>
    </Box>
  )
}
