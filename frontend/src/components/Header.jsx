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
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';

import TuaIcon from './TuaIcon';

const isAppointmentPageRegex = /^\/appointments\/[a-zA-Z0-9]{32,}$/;

// eslint-disable-next-line react/prop-types
export default function Header({ accessToken, setAccessToken, loading, setLoading }) {

  const [canRender, setRender] = useState(false);
  const [hasMenu, setMenu] = useState(false);
  const [isDashboard, setDashboard] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const [location, setLocation] = useLocation();

  // this effect modifies the rendered UI, depending on location
  useEffect(() => {

    const isAppointmentPage = isAppointmentPageRegex.test(location);

    if (isAppointmentPage) {

      setMenu(false);
      setRender(true);

    } else {

      switch(location) {

        case '/admin':
        case '/admin/': {
          console.log('ADMIN PAGE')
          setMenu(true);
          setRender(true);
          setDashboard(true);
          break;

        }
        case '/admin/profile':
        case '/admin/profile/': {
    
          setMenu(true);
          setRender(true);
          setDashboard(false);
          break;
    
        }
    
        case '/admin/login':
        case '/admin/login/':
        default: {
          
          setMenu(false);
          setRender(false);
          setDashboard(false);
          break;
  
        }      
  
      }

    }

  }, [location]);

  const handleLogout = async () => {

    let error = null;

    const requestOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    };

    setMenuAnchor(null);
    setLoading(true);

    try {

      // eslint-disable-next-line no-unused-vars
      const response = await fetch('/api/authorizations/current', requestOptions);

    } catch (err) {

      // eslint-disable-next-line no-unused-vars
      error = err;

    } finally {

      // for the moment, ignore any error, but take into account the fact that the
      // refresh cookie token might not expire!
      setAccessToken('');
      setLocation('/admin/login', {
        replace: true
      });

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
    const timeoutId = setTimeout(() => {

      clearTimeout(timeoutId);
      
      setLocation('/admin/profile');

    });

  };

  const handleOpenDashboard = () => {
    
    setMenuAnchor(null);
    const timeoutId = setTimeout(() => {

      clearTimeout(timeoutId);
      setLocation('/admin');

    });

  };

  if (!canRender) {

    return null;

  }

  return (
    <AppBar position='static' elevation={1} sx={{ height: '56px' }}>
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
                  {
                    isDashboard ? (
                      <MenuItem onClick={handleOpenProfile}>
                        <ListItemIcon><ManageAccountsIcon /></ListItemIcon>
                        <ListItemText>Profil</ListItemText>
                      </MenuItem>
                    ) : (
                      <MenuItem onClick={handleOpenDashboard}>
                        <ListItemIcon><DashboardIcon/></ListItemIcon>
                        <ListItemText>Panou de control</ListItemText>
                      </MenuItem>
                    )
                  }
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
  );

}
  