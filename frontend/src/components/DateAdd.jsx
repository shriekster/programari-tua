
import { useState, useEffect, useRef } from 'react';


import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import IconButton  from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

import PlaceIcon from '@mui/icons-material/Place';
import CircularProgress from '@mui/material/CircularProgress';



import { useGlobalStore } from '../useGlobalStore';
import refreshAccessToken from '../refreshAccessToken.js';



const isEmptyStringRegex = /^$/;

// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
    setError,
    setErrorMessage,
    addDate,
} = useGlobalStore.getState();

// eslint-disable-next-line react/prop-types
export default function DateAdd({ open, handleClose, date }) {

    const [saving, setSaving] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const openMenu = Boolean(anchorEl);
    
    // eslint-disable-next-line react/prop-types
    const day = date?.$d?.toLocaleDateString('ro-RO') ?? '';

    const locations = useGlobalStore((state) => state.locations);

    const handleClickListItem = (event) => {

      setAnchorEl(event.currentTarget);

    };
  
    const handleMenuItemClick = (event, index) => {

      setSelectedIndex(index);
      setAnchorEl(null);

    };
  
    const handleCloseMenu = () => {

      setAnchorEl(null);

    };

    const handleSave = async () => {

      const canSaveDate = 
          selectedIndex >= 0                &&
          selectedIndex < locations.length  &&
          locations[selectedIndex];

      if (canSaveDate) {

          setSaving(true);

          let error = null, status = 401, updatedDate = null;

          try {
  
              const requestOptions = {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      day,
                      locationId: locations[selectedIndex].id,
                  }),
                  credentials: 'same-origin'
              };
  
              const response = await fetch('/api/admin/dates', requestOptions);
              status = response.status;

              const json = await response.json();
              updatedDate = json.data.date;
      
      
          } catch (err) {
  
              // eslint-disable-next-line no-unused-vars
              error = err;
              status = 400; // client-side error
  
          }

          switch (status) {

              case 200: {

                  setSaving(false);

                  if (updatedDate) {

                    addDate(updatedDate);

                  }

                  handleClose(false);

                  break;

              }

              case 401: {

                  await refreshAccessToken(handleSave)
                  break;

              }

              default: {

                  setSaving(false);
                  setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
                  setError(true);
                  handleClose(false);
                  break;

              }

          }


      }

  };

    // set some values to an empty state when the dialog opens
    useEffect(() => {

    }, [open]);


    return (
        <Dialog
            open={open} 
            onClose={() => { handleClose(false) }}
            fullWidth
            maxWidth='sm'
            >
            <DialogTitle sx={{ cursor: 'default', userSelect: 'none' }}>
              { day }
            </DialogTitle>
            <DialogContent sx={{ margin: '0 auto', padding: 0, position: 'relative' }}>
              <Box sx={{
                    height: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                  <Typography textAlign='center' marginBottom='8px'>
                    Selectează o locație
                  </Typography>
                  <List
                    component='nav'
                    aria-label='Locație'
                    sx={{ 
                      border: '1px solid rgba(255, 255, 255, .125)',
                      borderRadius: '4px',
                    }}
                  >
                    <ListItemButton
                      id='location-button'
                      aria-haspopup='listbox'
                      aria-controls='location-menu'
                      aria-label='Locație'
                      aria-expanded={openMenu ? 'true' : undefined}
                      onClick={handleClickListItem}
                    >
                      <ListItemIcon sx={{ minWidth: '40px !important' }}>
                        <PlaceIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={locations?.[selectedIndex]?.name}
                      />
                    </ListItemButton>
                  </List>
                  <Menu sx={{ width: '100%'}}
                    id='location-menu'
                    anchorEl={anchorEl}
                    open={openMenu}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    onClose={handleCloseMenu}
                    MenuListProps={{
                      'aria-labelledby': 'location-button',
                      role: 'listbox',
                    }}
                  >
                    {locations.map((location, index) => (
                      <MenuItem
                        key={location.id}
                        selected={index === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                      >
                        {location.name}
                      </MenuItem>
                    ))}
                  </Menu>
              </Box>
                {
                    saving && (
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
                    )
                }
            </DialogContent>
            <DialogActions sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                <Button onClick={() => { handleClose(false) }}
                    color='error'
                    variant='outlined'
                    disabled={saving}>
                    Renunță
                </Button>
                <Button variant='contained'
                    disabled={saving}
                    onClick={handleSave}>
                    Salvează
                </Button>
            </DialogActions>
        </Dialog>
    );

}