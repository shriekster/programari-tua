
import { useState, useEffect, useRef } from 'react';


import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import IconButton  from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PlaceIcon from '@mui/icons-material/Place';
import CircularProgress from '@mui/material/CircularProgress';

import Autocomplete from '@mui/material/Autocomplete';

import { ThemeProvider, createTheme } from '@mui/material/styles';

import { matchSorter } from 'match-sorter';

import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import { useGeographic } from 'ol/proj';
import 'ol/ol.css';

import { useGlobalStore } from '../useGlobalStore';
import refreshAccessToken from '../refreshAccessToken.js';

const tuaLightInnerTheme = createTheme({
    palette: {
        primary: {
            main: '#7f805d'
          },
        mode: 'light',
    },
});

const filterOptions = (options, { inputValue }) => matchSorter(options, inputValue, {
    keys: ['display_name']
});

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

    const [activeStep, setActiveStep] = useState(-1);


    const handleGoToLastStep = () => {

        setActiveStep(1);

    };

    const handleGoToFirstStep = () => {

        setActiveStep(0);

    };

    const onClose = () => {

      handleClose(false);

    };

    const handleSaveLocation = async () => {

    };

    // set some values to an empty state when the dialog opens
    useEffect(() => {

    }, [open]);

    // create and initialize the map only when the active step is 0 (zero)
    useEffect(() => {

    }, [open, activeStep]);


    return (
        <Dialog
            open={open} 
            onClose={handleClose}
            fullWidth
            maxWidth='sm'
            >
            <DialogTitle>
                { 
                  // eslint-disable-next-line react/prop-types
                  date?.$d?.toLocaleDateString('ro-RO')
                }
            </DialogTitle>
            <DialogContent sx={{ margin: '0 auto', padding: 0, position: 'relative' }}>
                {
                    0 === activeStep ? (
                        <>
                          0
                        </>
                    ) : (
                        <Box sx={{
                            height: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-evenly'
                        }}>
                            1
                        </Box>
                    )

                }
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
                {
                    0 === activeStep ? (
                        <>
                            <Button variant='contained'
                                disabled={false}
                                onClick={handleGoToLastStep}>
                                Înainte
                            </Button>
                        </>

                    ) : (
                        <>
                            <Button
                                color='secondary'
                                variant='outlined'
                                disabled={saving}
                                onClick={handleGoToFirstStep}>
                                Înapoi
                            </Button>
                            <Button variant='contained'
                                disabled={saving}
                                onClick={handleSaveLocation}>
                                Salvează
                            </Button>
                        </>
                    )
                }
            </DialogActions>
        </Dialog>
    );

}