import { useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

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

    const formatValueLabel = (number, index) => {

        if (number < 50) {

            return 'Hmm...'

        }

        else if (number >= 50 && number < 100) {

            return 'Continuă...';

        }

        else {

            return 'Suuper!';

        }

    }

    return (
        <>
            <CssBaseline />
            <Container maxWidth='lg' sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 'auto'
            }}>
                <img src={robotImage} width={100} height={100}/>
                <Box sx={{
                    width: '50%',
                    maxWidth: '300px'
                }}>
                    <Typography id='custom-slider' 
                        gutterBottom>
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
                        valueLabelDisplay='auto'
                        valueLabelFormat={formatValueLabel}
                    />
                </Box>
            </Container>
        </>
    );

}