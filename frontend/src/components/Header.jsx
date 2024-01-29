import { useState, useEffect } from 'react';

import { useLocation } from 'wouter';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PlaceIcon from '@mui/icons-material/Place';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
  toggleUserTheme,
} = useGlobalStore.getState();

import { useGlobalStore } from '../useGlobalStore.js';

import TuaIcon from './TuaIcon';

const tuaDarkTheme = createTheme({
  palette: {
    primary: {
      main: '#7f805d'
    },
    mode: 'dark'
  },
});

const tuaLightTheme = createTheme({
  palette: {
    primary: {
      main: '#7f805d'
    },
    mode: 'light'
  },
});

const theme = {
  'dark': tuaDarkTheme,
  'light': tuaLightTheme,
};

const isAppointmentPageRegex = /^\/appointments\/[a-zA-Z0-9]{16}$/;

const menuItems = ['Calendar', 'Locații', 'Profil', 'Deconectare'];

// eslint-disable-next-line react/prop-types
const MenuItemContent = ({ menuItem }) => {

  switch(menuItem) {

    case 'Calendar': return (
      <>
        <ListItemIcon><CalendarMonthIcon /></ListItemIcon>
        <ListItemText>{menuItem}</ListItemText>
      </>
    );

    case 'Locații': return (
      <>
        <ListItemIcon><PlaceIcon /></ListItemIcon>
        <ListItemText>{menuItem}</ListItemText>
      </>
    );

    case 'Profil': return (
      <>
        <ListItemIcon><ManageAccountsIcon /></ListItemIcon>
        <ListItemText>{menuItem}</ListItemText>
      </>
    );

    case 'Deconectare': return (
      <>
        <ListItemIcon><LogoutIcon color='error'/></ListItemIcon>
        <ListItemText sx={{ color: '#F44336' }}>{menuItem}</ListItemText>
      </>
    );

    default: return null;

  }

};

// eslint-disable-next-line react/prop-types
export default function Header() {

  const [canRender, setRender] = useState(false);
  const [hasMenu, setMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState('');

  const [loading, setLoading] = useGlobalStore((state) => [state.loading, state.setLoading]);

  const userTheme = useGlobalStore((state) => state.userTheme);

  const [location, setLocation] = useLocation();

  // this effect modifies the rendered UI, depending on location
  useEffect(() => {

    const isAppointmentPage = isAppointmentPageRegex.test(location);

    if (isAppointmentPage) {

      setMenu(false);
      setRender(true);

    } else {

      switch(location) {

        case '/': {

          setMenu(false);
          setRender(true);
          break;

        }

        case '/admin':
        case '/admin/': {

          setMenu(true);
          setRender(true);
          setSelectedMenuItem('Calendar');
          break;

        }

        case '/admin/locations':
        case '/admin/locations/': {

          setMenu(true);
          setRender(true);
          setSelectedMenuItem('Locații')
          break;

        }
        
        case '/admin/profile':
        case '/admin/profile/': {

          setMenu(true);
          setRender(true);
          setSelectedMenuItem('Profil');
          break;

        }
    
        case '/admin/login':
        case '/admin/login/':
        default: {
          
          setMenu(false);
          setRender(false);
          break;
  
        }      
  
      }

    }

  }, [location]);

  const handleOpenUserMenu = (event) => {

    setMenuAnchor(event.currentTarget);

  };

  const handleCloseUserMenu = () => {

    setMenuAnchor(null);

  };

  const handleMenuItemClick = async (menuItemName) => {

    setMenuAnchor(null);
    setSelectedMenuItem(menuItemName);

    switch(menuItemName) {

      case 'Calendar': {

        setLocation('/admin');
        break;

      }

      case 'Locații': {

        setLocation('/admin/locations');
        break;

      }

      case 'Profil': {

        setLocation('/admin/profile');
        break;

      }

      case 'Deconectare': {

        await logout();
        break;

      }

      default: break;

    }

  };

  const logout = async () => {

    let error = null;

    const requestOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin'
    };

    setLoading(true);

    try {

      await fetch('/api/authorizations/current', requestOptions);

    } catch (err) {

      // eslint-disable-next-line no-unused-vars
      error = err;

    } finally {

      // for the moment, ignore any error, but take into account the fact that the
      // access or refresh token might not expire!
      setLoading(false);
      setLocation('/admin/login', {
        replace: true
      });

    }

  };

  if (!canRender) {

    return null;

  }

  return (
    <ThemeProvider theme={theme[`${userTheme}`]}>
      <CssBaseline />
      <AppBar position='sticky' elevation={1} sx={{ height: '56px',}}>
        <Container maxWidth={false} sx={{ height: '56px' }}>
          <Toolbar disableGutters sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: '56px !important'
            }}
            variant='dense'>
            <TuaIcon sx={{ position: 'absolute', left: 0 }} />
            <Typography
                variant='h5'
                noWrap
                sx={{
                  display: 'flex',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                  userSelect: 'none',
                  cursor: 'default'
                }}
            >
                TUA
            </Typography>
            {
              hasMenu ? (
                <Box sx={{ flexGrow: 0,  position: 'absolute', right: 0 }}>
                  <Tooltip title='Setări'>
                    <div>
                      <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}
                          size='large'
                          disabled={loading}>
                          <MenuIcon fontSize='large' />
                      </IconButton>
                    </div>
                  </Tooltip>
                  <Menu
                    id='menu'
                    keepMounted
                    anchorEl={menuAnchor}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    open={Boolean(menuAnchor)}
                    onClose={handleCloseUserMenu}
                    slotProps={{
                      paper: {
                        elevation: 6,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: .5,
                            '&::before': {
                              content: '""',
                              display: 'block',
                              position: 'absolute',
                              top: 0,
                              right: 12,
                              width: 10,
                              height: 10,
                              backgroundColor: 'rgb(18, 18, 18)',
                              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.11))',
                              transform: 'translateY(-50%) rotate(45deg)',
                              zIndex: 6,
                          },
                        },
                      }
                    }}
                  >
                  {
                    menuItems.map((menuItem) => (
                      <MenuItem key={menuItem} 
                        // eslint-disable-next-line no-unused-vars
                        onClick={(_) => { handleMenuItemClick(menuItem) } }
                        selected={ 'Deconectare' !== menuItem && menuItem === selectedMenuItem}>
                        <MenuItemContent menuItem={menuItem} />
                      </MenuItem>
                    ))
                  }
                  </Menu>
                </Box>
              ) : (
                <IconButton onClick={toggleUserTheme} color='inherit'
                  sx={{ flexGrow: 0,  position: 'absolute', right: 0 }}>
                  {'dark' === userTheme ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
              )
            }
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );

}
  