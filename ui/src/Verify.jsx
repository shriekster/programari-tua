import { useState, useEffect } from 'react';

import { useLocation } from 'wouter';

import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

import useGlobalStore from './useGlobalStore';

import robotImage from './assets/robot.png';

const marks = [
    {
      value: 0,
      label: '🤖',
    },
    {
      value: 100,
      label: '😀',
    },
  ];

export default function Verify() {

    const [value, setValue] = useState(0);
    const [color, setColor] = useState('error');

    const [location, setLocation] = useLocation();

    const [isHuman, setHumanity] = useGlobalStore((state) => [state.isHuman, state.setHumanity]);

    const handleChange = (event, newValue) => {

        if (newValue < 50) {

            setColor('error');

        }

        else if (newValue >= 50 && newValue < 100) {

            setColor('warning');

        }

        else {

            setColor('success');

        }

        setValue(newValue);

    };

    const formatValueLabel = (number) => {

        if (number < 100) {

            return 'Hmm...'

        }

        return 'Suuper!';

    };

    useEffect(() => {

        if (100 === value) {

            setLocation('/');

        }

    }, [value]);

    return (
        <>
            <CssBaseline />
            <Container maxWidth='lg' sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                minHeight: '-webkit-fill-available',
                height: '100vh'
            }}>
                <img src={robotImage} width={100} height={100}/>
                <Box sx={{
                    width: '50%',
                    maxWidth: '400px',
                    height: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-evenly'
                }}>
                    <Typography id='custom-slider' 
                        gutterBottom
                        textAlign='center'>
                        Glisează pentru a demonstra că nu ești robot
                    </Typography>
                    <Slider value={value}
                        color={color}
                        marks={marks}
                        onChange={handleChange}
                        sx={{
                            transition: 'color .25s linear',
                            '& .MuiSlider-markLabel': {
                                fontSize: '1.5rem',
                                color: 'rgba(0, 0, 0, 0.5)'
                            },
                            '& .MuiSlider-markLabelActive': {
                                fontSize: '1.5rem',
                                color: 'rgba(0, 0, 0, 1)'
                            }
                        }}
                        aria-labelledby='custom-slider'
                        valueLabelDisplay='on'
                        valueLabelFormat={formatValueLabel}
                        
                    />
                </Box>
            </Container>
        </>
    );

}