
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
    addLocation,
} = useGlobalStore.getState();

// eslint-disable-next-line react/prop-types
export default function DateAdd({ open, handleClose, date }) {

    const [saving, setSaving] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const openMenu = Boolean(anchorEl);

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

    const onClose = () => {

      handleClose(false);

    };

    const handleSaveDate = async () => {

    };

    // set some values to an empty state when the dialog opens
    useEffect(() => {

    }, [open]);


    return (
        <Dialog
            open={open} 
            onClose={handleClose}
            fullWidth
            maxWidth='sm'
            >
            <DialogTitle sx={{ cursor: 'default', userSelect: 'none' }}>
              { 
                // eslint-disable-next-line react/prop-types
                date?.$d?.toLocaleDateString('ro-RO')
              }
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
                <Button onClick={onClose}
                    color='error'
                    variant='outlined'
                    disabled={saving}>
                    Renunță
                </Button>
                <Button variant='contained'
                    disabled={saving}
                    onClick={handleSaveDate}>
                    Salvează
                </Button>
            </DialogActions>
        </Dialog>
    );

}