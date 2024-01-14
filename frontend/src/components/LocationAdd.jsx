
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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import { Fill, Stroke, Style, Text, Circle as CircleStyle, RegularShape, Icon } from 'ol/style';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import { useGeographic } from 'ol/proj';
import 'ol/ol.css';


// eslint-disable-next-line react/prop-types
export default function LocationAdd({ open, handleClose }) {

    const [loading, setLoading] = useState(false);
    const [targetLocationName, setTargetLocationName] = useState('');
    const [helperText, setHelperText] = useState(' ');
    const [searchError, setSearchError] = useState(false);
    const [results, setResults] = useState([]);
    const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

    const [map, setMap] = useState(null);

    const mapElementRef = useRef();
    const mapObjectRef = useRef();
    const vectorSourceRef = useRef();

    const handleTargetLocationChange = (event) => {

        setTargetLocationName(event.target.value);
        setSearchError(false);
        setHelperText(' ');

        setResults([]);
        setSelectedResultIndex(-1);

    };

    const handleSearch = async (event) => {

        event.preventDefault();

        if (targetLocationName !== '') {

            let error = null, data = null;

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

                data = await response.json();

            } catch (err) {

                error = err;

            } finally {

                setLoading(false);

                if (!error && data) {

                    setResults(data);

                }

            }

        } else {

            setSearchError(true);
            setHelperText('Completează câmpul!');

        }

    };

    const handleResultClick = (index) => {

        setSelectedResultIndex(index);

        if (mapElementRef.current) {

            mapElementRef.current?.scrollIntoView({ behavior: 'smooth'});

        }

    };

    useEffect(() => {

        let mapObject;

        if (open) {

            setTargetLocationName('');
            setSearchError(false);
            setHelperText(' ');
            setResults([]);

        }
        
        if (open && !mapObjectRef.current) {
        
            const timeoutId = setTimeout(() => {

                vectorSourceRef.current = new VectorSource();

                mapObject = new Map({
                        projection: 'EPSG:4326',
                        target: mapElementRef.current,
                        layers: [
                            new TileLayer({
                                source: new OSM(),
                            }),
                            new VectorLayer({
                                source: vectorSourceRef.current,
                                style: new Style({
                                    image: new CircleStyle({
                                        fill: new Fill({
                                            color: [127, 128, 93, 1]
                                        }),
                                        stroke: new Stroke({
                                            color: [0, 0, 0, 1],
                                            width: 2,
                                        }),
                                        radius: 10,
                                    }),
                                    zIndex: 3,
                                }),
                            })
                        ],
                        view: new View({
                        center: [26.10626, 44.43225],
                        zoom: 9,
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

    useEffect(() => {
        
        if (results && 0 <= selectedResultIndex && selectedResultIndex < results.length) {

            const result = results[selectedResultIndex];
            const coordinate = [result.lon, result.lat];

            console.log(coordinate)

            if (mapObjectRef.current) {

                // transition the view to the selected coordinate
                const view = mapObjectRef.current.getView();

                if (view) {

                    view.animate({
                        center: coordinate
                    });

                }
    
            }

        }

        
    }, [results, selectedResultIndex]);

    useEffect(() => {
       
        if (results && 0 <= selectedResultIndex && selectedResultIndex < results.length) {

            const result = results[selectedResultIndex];
            const coordinate = [result.lon, result.lat];

            if (vectorSourceRef.current) {

                vectorSourceRef.current.clear();
                vectorSourceRef.current.addFeature(
                    new Feature({
                        geometry: new Point(coordinate)
                    })
                )
    
            }

        }

        
    }, [results, selectedResultIndex]);

    useGeographic();

    return (

        <Dialog
            open={open} 
            onClose={handleClose}
            fullWidth
            maxWidth='sm'
            //keepMounted={false}
            >
            <DialogTitle>
            <form style={{
                        padding: 0,
                        margin: '0 auto',
                        height: '80px',
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
                    <TextField sx={{ width: '300px' }}
                        color='primary'
                        InputProps={{
                            endAdornment: 
                            <InputAdornment position='end'>
                                <IconButton edge='end' onClick={handleSearch} disabled={loading}>
                                    <TravelExploreIcon fontSize='large' color={searchError ? 'error' : 'primary'} />
                                </IconButton>
                            </InputAdornment>
                            
                        }}
                        inputProps={{
                            maxLength: 256
                        }}
                        name='location'
                        autoComplete='off'
                        value={targetLocationName}
                        helperText={helperText}
                        error={searchError}
                        disabled={loading}
                        onChange={handleTargetLocationChange}
                    />
                </form>
            </DialogTitle>
            <DialogContent sx={{ margin: 0, padding: 0, position: 'relative' }}>
                <List sx={{
                    width: '300px',
                    height: '100px',
                    margin: '0 auto',
                    overflowY: 'scroll',
                }}>
                {
                    results.map((result, index) => (
                        <ListItem key={result.osm_id} onClick={() => { handleResultClick(index) }}>
                            {result?.display_name}
                        </ListItem>
                    ))
                }
                </List>
                <div id='map' style={{
                        width: '300px',
                        height: '300px',
                        margin: '0 auto',
                    }}
                    ref={mapElementRef}>
                </div>
                {
                    loading && (
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