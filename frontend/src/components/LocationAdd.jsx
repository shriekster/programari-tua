// TODO: when selecting an autocomplete suggestion, do not search the location based on the input,
// because the location (result) already exists
// TODO: add a feature on the map and center the map to the feature's coordinate
// when a search suggestion is selected
// TODO: manually test this component and fix all the bugs!
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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Menu from '@mui/material/Menu';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
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
import { Fill, Stroke, Style, Text, Circle as CircleStyle, RegularShape, Icon } from 'ol/style';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import { useGeographic } from 'ol/proj';
import 'ol/ol.css';

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

// eslint-disable-next-line react/prop-types
export default function LocationAdd({ open, handleClose }) {

    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchValue, setSearchValue] = useState(null);
    const [searchInputValue, setSearchInputValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedSearchResult, setSelectedSearchResult] = useState(null);

    const [map, setMap] = useState(null);

    const mapElementRef = useRef();
    const mapObjectRef = useRef();
    const vectorSourceRef = useRef();

    const searchResultsRef = useRef();
    const timeoutRef = useRef();
    const abortControllerRef = useRef();

    useGeographic();


    const handleSearchChange = (event, newValue) => {

        setSearchValue(newValue);

        setSearchResults([]);
        setSelectedSearchResult(null);

    };

    const handleSearchInputChange = (event, newInputValue) => {

        setSearchInputValue(newInputValue);
        
        if (timeoutRef.current) {

            clearTimeout(timeoutRef.current);

        }

        const canSearch = 
            Boolean(newInputValue)              &&  // the input value is truthy, i.e. not null or undefined
            'string' === typeof newInputValue   &&  // and it's a string
            newInputValue.length > 1;               // with at least 2 characters

        if (canSearch) {

            timeoutRef.current = setTimeout(() => {

                clearTimeout(timeoutRef.current);
                search(newInputValue);
    
            }, 300);

        } else {

            setSearchResults([]);
        
        }

    };

    const search = async (locationName) => {

        if (abortControllerRef.current) {

            abortControllerRef.current.abort();

        }

        abortControllerRef.current = new AbortController();

        const formattedLocationName = locationName?.toString()?.trim();

        if ('' !== formattedLocationName && 'string' === typeof formattedLocationName) {

            let error = null, data = null;

            setSearching(true);

            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: abortControllerRef.current.signal,
            };

            const baseUrl = 'https://nominatim.openstreetmap.org/search';
            const queryString = `?format=json&accept-language=ro-RO&countrycodes=ro&addressdetails=1&namedetails=0&q=${formattedLocationName}`;
            
            try {

                const response = await fetch(baseUrl + queryString, requestOptions);

                if (!response.ok) {

                    throw new Error('Something happened!');

                }

                data = await response.json();

            } catch (err) {

                error = err;

            } finally {

                setSearching(false);

                if (!error && data) {

                    setSearchResults(data);

                }

            }

        }

    };

    const handleClearSearchBox = () => {

        setSearchInputValue('');
        setSearchValue('');
        setSearchResults([]);
        setSelectedSearchResult(null);

    };

    useEffect(() => {

        let mapObject;

        if (open) {

            setSearchInputValue('');
            setSearchValue(null);
            setSearchResults([]);

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

        searchResultsRef.current = searchResults;

    }, [searchResults]);

    // add a feature on the map to the selected location from the searchResults
    useEffect(() => {
       
        if (selectedSearchResult) {

            const coordinate = [selectedSearchResult.lon, selectedSearchResult.lat];

            if (vectorSourceRef.current) {

                vectorSourceRef.current.clear();
                vectorSourceRef.current.addFeature(
                    new Feature({
                        geometry: new Point(coordinate)
                    })
                )
    
            }

        }

        
    }, [selectedSearchResult]);

    // animate the view: transition to the selected coordinate
    useEffect(() => {
        
        if (selectedSearchResult) {

            const coordinate = [selectedSearchResult.lon, selectedSearchResult.lat];

            if (mapObjectRef.current) {

                const view = mapObjectRef.current.getView();

                if (view) {

                    view.animate({
                        center: coordinate,
                        zoom: 18
                    });

                }
    
            }

        }

        
    }, [selectedSearchResult]);


    return (

        <Dialog
            open={open} 
            onClose={handleClose}
            fullWidth
            maxWidth='sm'
            >
            <DialogTitle>
                Adaugă o locație
            </DialogTitle>
            <DialogContent sx={{ margin: '0 auto', padding: 0, position: 'relative' }}>
                <ThemeProvider theme={tuaLightInnerTheme}>
                    <Box sx={{
                        width: '225px',
                        background: 'white',
                        borderRadius: '4px',
                        position: 'absolute',
                        top: '48px',
                        right: '8px',
                        zIndex: 1,
                    }}>
                    <Autocomplete
                        freeSolo
                        noOptionsText='Nicio locație'
                        disableClearable={true}
                        value={searchValue}
                        onChange={handleSearchChange}
                        inputValue={searchInputValue}
                        onInputChange={handleSearchInputChange}
                        id='custom-search'
                        options={searchResults}
                        disabled={loading}
                        getOptionLabel={(option) => option?.name ?? ''}
                        filterOptions={filterOptions}
                        renderOption={(props, option) => (
                            <li {...props}
                                key={option.place_id}
                                >
                                <ListItemText
                                    primary={option.name}
                                    secondary={option.display_name}/>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField {...params} 
                                sx={{ 
                                    width: '100%',
                                }}
                                color='primary'
                                size='small'
                                name='location'
                                inputProps={{
                                    ...params.inputProps,
                                    maxLength: 256,
                                }}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: 
                                        <InputAdornment position='start'>
                                            <TravelExploreIcon color='primary' />
                                        </InputAdornment>,
                                    endAdornment: '' !== searchInputValue ? (
                                            <InputAdornment position='end'>
                                                <IconButton onClick={handleClearSearchBox}
                                                    size='small'
                                                    aria-label='șterge'
                                                    sx={{ color: 'black' }}
                                                    >
                                                    {
                                                        searching ? (
                                                            <CircularProgress disableShrink
                                                                size={24}
                                                                thickness={4}
                                                                sx={{
                                                                    animationDuration: '500ms',
                                                                    color: 'black'
                                                                }} />
                                                        ) : (
                                                            <ClearIcon />
                                                        )
                                                    }
                                                </IconButton>
                                            </InputAdornment>
                                        ) : null,
                                    }}
                                />
                                
                        )}
                    />
                    </Box>
                </ThemeProvider>
                <div id='map' style={{
                        width: '300px',
                        height: '300px',
                        margin: '40px auto',
                        position: 'relative',
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