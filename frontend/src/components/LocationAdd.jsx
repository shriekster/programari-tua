
import { useState, useEffect, useRef } from 'react';


import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import IconButton  from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { useGeographic } from 'ol/proj';
import 'ol/ol.css';


// eslint-disable-next-line react/prop-types
export default function LocationAdd({ open, handleClose }) {

    const [targetLocationName, setTargetLocationName] = useState('');
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(false);

    const mapElementRef = useRef();
    const mapObjectRef = useRef();

    const handleTargetLocationChange = (event) => {

        setTargetLocationName(event.target.value);

    };

    const handleSearch = async (event) => {

        event.preventDefault();

        let error = null, result = null;

        setLoading(true);

        const requestOptions = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
        };

        const searchEndpointUrlWithParameters = `https://nominatim.openstreetmap.org/search?format=json&accept-language=ro-RO&countrycodes=ro&addressdetails=1&namedetails=1&q=${targetLocationName}`;
        
        try {

            const response = await fetch(searchEndpointUrlWithParameters, requestOptions);

            if (!response.ok) {

                throw new Error('Something happened!');

            }

            result = await response.json();

        } catch (err) {

            error = err;

        } finally {

            setLoading(false);

            if (!error && result) {

                //

            }

        }

    };

    useEffect(() => {

        let mapObject;
        
        if (open && !mapObjectRef.current) {
        
            const timeoutId = setTimeout(() => {

                mapObject = new Map({
                        target: mapElementRef.current,
                        layers: [
                            new TileLayer({
                                source: new OSM(),
                            }),
                        ],
                        view: new View({
                        center: [26, 45],
                        zoom: 12,
                    }),
                });

                setMap(mapObject);

                clearTimeout(timeoutId);

            });

        }

        return () => {
            
            if (open) {

                if (mapObject) {

                    mapObject.setTarget(undefined);
                    mapObject.dispose();
                    mapObject = null;

                }

                setMap(null);

            }

        };

    }, [open]);

    useEffect(() => {

        mapObjectRef.current = map;

    }, [map]);

    useGeographic();

    return (

        <Dialog open={open} onClose={handleClose}
            fullWidth
            maxWidth='sm'
            //keepMounted={false}
            >
            <DialogTitle>
                Adaugă locație
            </DialogTitle>
            <DialogContent sx={{ margin: 0, padding: 0 }}>
                <form style={{
                        padding: 0,
                        height: '56px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginBottom: '8px'
                    }}
                    autoComplete='off'
                    onSubmit={handleSearch}
                    >
                    <TextField
                        color='primary'
                        InputProps={{
                            endAdornment: 
                            <InputAdornment position='end'>
                                <IconButton edge='end' onClick={handleSearch} disabled={loading}>
                                    <TravelExploreIcon fontSize='large' />
                                </IconButton>
                            </InputAdornment>
                            
                        }}
                        inputProps={{
                            maxLength: 256
                        }}
                        name='location'
                        autoComplete='off'
                        //value={username.value}
                        //helperText={username.helperText}
                        //error={username.error}
                        disabled={loading}
                        onChange={handleTargetLocationChange}
                    />
                </form>
                <div id='map' style={{
                        width: '300px',
                        height: '300px',
                        margin: '0 auto',
                    }}
                    ref={mapElementRef}>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    Renunță
                </Button>
                <Button>
                    Salvează
                </Button>
            </DialogActions>
        </Dialog>

    );

}