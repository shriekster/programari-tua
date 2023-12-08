import Image from 'next/image';

import Box from '@mui/system/Box';

import tuaImage from './assets/tua.webp';
import LoginForm from './components/LoginForm';

export default function Login() {
  return (
    <Box component='main'
      sx={{
        margin: 0,
        padding: '2.5%',
        height: '100dvh',
        width: '100dvw',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Image 
          src={tuaImage}
          alt='Logo traseul utilitar-aplicativ'
          width={300}
          priority
          style={{
            margin: 'auto'
          }}
          />
        <LoginForm />
    </Box>
  )
}
