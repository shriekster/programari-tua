import { useState, useEffect } from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Unstable_Grid2';

import PedalBikeIcon from '@mui/icons-material/PedalBike';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import SearchIcon from '@mui/icons-material/Search';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const icons = [ PedalBikeIcon, DirectionsCarIcon, NightsStayIcon, WbSunnyIcon, LocalFloristIcon, SearchIcon, LightbulbIcon, BeachAccessIcon, PhotoCameraIcon];


function Item ({name}) {

    
    let Icon = icons[name];

    return (
        <Icon />
    )

}

export default function Verify() {

    return (

        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            {Array.from(Array(2)).map((_, index) => (
                <Grid xs={2} sm={4} md={4} key={index}>
                    <Item name={index}>xs=2</Item>
                </Grid>
            ))}
            </Grid>
        </Box>
    );

}