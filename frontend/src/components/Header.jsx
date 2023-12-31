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
import CircularProgress from '@mui/material/CircularProgress';

import TuaIcon from './TuaIcon';
import Profile from './Profile';


// eslint-disable-next-line react/prop-types
export default function Header({ accessToken, setAccessToken, loading, setLoading, hasMenu, profileInfo }) {
    
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const [location, setLocation] = useLocation();

  const handleLogout = async () => {

    let status = 401,
    error = null;

    const requestOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    setMenuAnchor(null);
    setLoading(true);

    try {

      const response = await fetch('/api/authorizations/current', requestOptions);
      status = response.status;

      if (!response.ok) {

        throw new Error('Something happened')

      }

    } catch (err) {

      // eslint-disable-next-line no-unused-vars
      error = err;

    } finally {

      switch (status) {


        case 200: {

          setAccessToken('');
          setLocation('/admin/login', {
            replace: true
          });
          break;

        }

        default: {

          //setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
          //setError(true);
          break;

        }

      }

    }

  };

  const handleOpenUserMenu = (event) => {

    setMenuAnchor(event.currentTarget);

  };

  const handleCloseUserMenu = () => {

    setMenuAnchor(null);

  };

  const handleOpenProfile = () => {

    setMenuAnchor(null);
    // TODO: open the admin profile dialog
    setShowProfile(true);

  };

  
  // eslint-disable-next-line no-unused-vars
  const handleCloseProfile = (event, reason) => {

    if (loading) {

        return;

    }
    // TODO: close the admin profile dialog
    setShowProfile(false);

  };

  useEffect(() => {

    const checkAuthorization = async () => {

      let accessToken = '',
      error = null;

      setLoading(true);
    
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'refresh_token'
        }),
      };

      try {

        const response = await fetch('/api/authorizations', requestOptions);

        if (!response.ok) {

          throw new Error('Invalid authorization!');

        }

        const json = await response.json();
        accessToken = json?.data?.accessToken;

      } catch (err) {

        error = err;

      } finally {

        setLoading(false);

        if (!error) {

          setAccessToken(accessToken);

        } else {

          setLocation('/admin/login', {
            replace: true
          });

        }

      }

    };

    // skip the request if the user is already logged in
    if (!accessToken) {
      
      checkAuthorization();

    }

  }, [accessToken, setLocation, setAccessToken, setLoading]);

  return (
    <Box sx={{
      margin: 0,
      padding: 0,
      position: 'relative'
    }}>
        <AppBar position='static' elevation={2}>
          <Container maxWidth={false}>
              <Toolbar disableGutters sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                  }}>
                  <TuaIcon sx={{ position: 'absolute', left: 0 }} />
                  <Typography
                      variant='h5'
                      noWrap
                      sx={{
                      mr: 2,
                      display: 'flex',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      letterSpacing: '.3rem',
                      color: 'inherit',
                      textDecoration: 'none',
                      }}
                  >
                      TUA
                  </Typography>
                  {
                    Boolean(hasMenu) && (
                      <Box sx={{ flexGrow: 0,  position: 'absolute', right: 0 }}>
                        <Tooltip title='Setări'>
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}
                            size='large'
                            disabled={loading}>
                            <MenuIcon fontSize='large' />
                        </IconButton>
                        </Tooltip>
                        <Menu
                        id='menu'
                        keepMounted
                        anchorEl={menuAnchor}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
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
                        <MenuItem onClick={handleOpenProfile}>
                          <ListItemIcon><ManageAccountsIcon /></ListItemIcon>
                          <ListItemText>Profil</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                          <ListItemIcon><LogoutIcon color='error'/></ListItemIcon>
                          <ListItemText sx={{ color: '#F44336' }}>Deconectare</ListItemText>
                        </MenuItem>
                        </Menu>
                      </Box>
                    )
                  }
              </Toolbar>
          </Container>
        </AppBar>
        <Profile open={showProfile}
          handleClose={handleCloseProfile}
          profileInfo={profileInfo}
          loading={loading}
          setLoading={setLoading}/>
    </Box>
  );

}
  