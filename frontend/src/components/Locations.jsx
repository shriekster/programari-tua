
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import DeleteIcon from '@mui/icons-material/Delete';


import { useGlobalStore } from '../useGlobalStore';

import refreshAccessToken from '../refreshAccessToken';

import LocationAdd from './LocationAdd';

// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
  setLoading,
  setLocations,
  setLocationsDownloaded,
  deleteLocation,
  setErrorMessage,
  setError,
} = useGlobalStore.getState();

export default function Locations() {

  const [showAddDialog, setAddDialog] = useState(false);

  const loading = useGlobalStore((state) => state.loading);
  const locations = useGlobalStore((state) => state.locations);

  // fetch the locations when this component mounts
  useEffect(() => {

    const fetchLocations = async () => {

      setLoading(true);

      let error = null, status = 401, data;
  
      try {
  
          const requestOptions = {
              method: 'GET',
              credentials: 'same-origin'
          };
  
          const response = await fetch(`/api/admin/locations`, requestOptions);
          status = response.status;

          const json = await response.json();
          data = json.data.locations;
  
  
      } catch (err) {
  
          // eslint-disable-next-line no-unused-vars
          error = err;
          status = 400; // client-side error
  
      }
  
      switch (status) {
  
          case 200: {
  
              setLoading(false);
  
              setLocations(data);
              setLocationsDownloaded(true);
  
              break;
  
          }
  
          case 401: {
  
              await refreshAccessToken(fetchLocations)
              break;
  
          }
  
          default: {
  
            setLoading(false);
            setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
            setError(true);
            break;
  
          }
  
      }

    };

    fetchLocations();

  }, []);

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

  const handleDeleteLocation = async (locationId) => { 

    setLoading(true);

    let error = null, status = 401;

    try {

        const requestOptions = {
            method: 'DELETE',
            credentials: 'same-origin'
        };

        const response = await fetch(`/api/admin/locations/${locationId}`, requestOptions);
        status = response.status;


    } catch (err) {

        // eslint-disable-next-line no-unused-vars
        error = err;
        status = 400; // client-side error

    }

    switch (status) {

        case 200: {

            setLoading(false);

            deleteLocation(locationId);

            break;

        }

        case 401: {

            await refreshAccessToken(handleDeleteLocation)
            break;

        }

        default: {

          setLoading(false);
          setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
          setError(true);
          break;

        }

    }

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
      <List sx={{ marginTop: '8px' }}>
      {
        locations.map((location) => (
          <ListItem key={location.id}
            secondaryAction={
              <IconButton edge='end' color='error' aria-label='șterge'
                disabled={loading}
                onClick={() => { handleDeleteLocation(location.id) }}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={location.name}
              secondary={location.displayName}
            />
          </ListItem>
        ))
      }
      </List>
      <LocationAdd open={showAddDialog} handleClose={handleCloseAddDialog}/>
    </Box>
  )
}
