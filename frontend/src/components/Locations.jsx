
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { Map } from '@react-ol/fiber';
import 'ol/ol.css';

import { useGlobalStore } from '../useGlobalStore';

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

  const loading = useGlobalStore((state) => state.loading);
  const locations = useGlobalStore((state) => state.locations);

  return (
    <Box sx={{
      maxWidth: '400px', 
      padding: '64px 16px 16px 16px',
    }}>
      <Typography>
        Locurile de desfășurare ale antrenamentelor
      </Typography>
      <List>
      {
        
      }
      </List>
    </Box>
  )
}
