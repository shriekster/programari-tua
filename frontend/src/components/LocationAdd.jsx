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
export default function LocationAdd({ open, handleClose }) {

    const [searching, setSearching] = useState(false);
    const [saving, setSaving] = useState(false);

    const [searchValue, setSearchValue] = useState(null);
    const [searchInputValue, setSearchInputValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const [placeName, setPlaceName] = useState('');
    const [placeNameError, setPlaceNameError] = useState(false);
    const [placeNameHelperText, setPlaceNameHelperText] = useState(' ');
    const [placeAddress, setPlaceAddress] = useState('');
    const [placeAddressError, setPlaceAddressError] = useState(false);
    const [placeAddressHelperText, setPlaceAddressHelperText] = useState(' ');

    const [map, setMap] = useState(null);

    const [activeStep, setActiveStep] = useState(-1);

    const mapElementRef = useRef();
    const mapObjectRef = useRef();
    const vectorSourceRef = useRef();

    const timeoutRef = useRef();
    const abortControllerRef = useRef();

    useGeographic();


    const handleSearchChange = (event, newValue) => {

        setSearchValue(newValue);

        setSearchResults([]);

    };

    const handleSearchInputChange = (event, newInputValue) => {

        // update the state
        setSearchInputValue(newInputValue);
        
        // clear the timeout which 'schedules' the fetch request for searching
        if (timeoutRef.current) {

            clearTimeout(timeoutRef.current);

        }

        const formattedInputValue = newInputValue?.trim();

        const isSearchResult = Boolean(searchResults.find((result) => formattedInputValue === result.name));

        const canSearch = 
            !isSearchResult                             &&  // the input is not a search result (does not already exist as a suggestion)
            Boolean(formattedInputValue)                &&  // the input value is truthy, i.e. not null or undefined
            'string' === typeof formattedInputValue     &&  // and it's a string
            formattedInputValue.length > 1;                 // with at least 2 characters

        if (canSearch) {

            timeoutRef.current = setTimeout(() => {

                clearTimeout(timeoutRef.current);
                search(formattedInputValue);
    
            }, 350);

        } else {

            setSearchResults([]);
        
        }

    };

    const search = async (locationName) => {

        if (abortControllerRef.current) {

            abortControllerRef.current.abort();

        }

        abortControllerRef.current = new AbortController();

        if ('' !== locationName && 'string' === typeof locationName) {

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
            const queryString = `?format=json&accept-language=ro-RO&countrycodes=ro&addressdetails=1&namedetails=0&q=${locationName}`;
            
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

    };

    const handleGoToLastStep = () => {

        setActiveStep(1);

    };

    const handleGoToFirstStep = () => {

        setActiveStep(0);

    };

    const handlePlaceNameChange = (event) => {

        setPlaceName(event.target.value);
        setPlaceNameHelperText(' ');
        setPlaceNameError(false);

    };

    const handlePlaceAddressChange = (event) => {

        setPlaceAddress(event.target.value);
        setPlaceAddressHelperText(' ');
        setPlaceAddressError(false);

    };

    const handleSaveLocation = async () => {

        const canSaveLocation =
            !isEmptyStringRegex.test(placeName)     &&
            !isEmptyStringRegex.test(placeAddress)  &&
            searchValue;    

        if (canSaveLocation) {

            setSaving(true);

            let error = null, status = 401, newLocation = null;

            try {
    
                const requestOptions = {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        placeId: searchValue.place_id,
                        osmId: searchValue.osm_id,
                        name: placeName,
                        displayName: placeAddress,
                        lon: searchValue.lon,
                        lat: searchValue.lat,
                    }),
                    credentials: 'same-origin'
                };
    
                const response = await fetch('/api/admin/locations', requestOptions);
                status = response.status;

                const json = await response.json();
                newLocation = json.data;
        
        
            } catch (err) {
    
                // eslint-disable-next-line no-unused-vars
                error = err;
                status = 400; // client-side error
    
            }

            switch (status) {

                case 200: {

                    setSaving(false);
                    addLocation(newLocation);
                    handleClose();
                    break;

                }

                case 401: {

                    await refreshAccessToken(handleSaveLocation)
                    break;

                }

                default: {

                    setSaving(false);
                    setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
                    setError(true);
                    handleClose();
                    break;

                }

            }


        } else {

            if (isEmptyStringRegex.test(placeName)) {

                setPlaceNameError(true);
                setPlaceNameHelperText('Completează numele locației!');

            }

            if (isEmptyStringRegex.test(placeAddress)) {

                setPlaceAddressError(true);
                setPlaceAddressHelperText('Completează adresa!');

            }

        }

    };

    // set some values to an empty state when the dialog opens
    useEffect(() => {

        if (open) {

            setSearchInputValue('');
            setSearchValue(null);
            setSearchResults([]);
            setActiveStep(0);

        }

        return () => {
            
            if (open) {

                setActiveStep(0);

            }

        };

    }, [open]);

    // create and initialize the map only when the active step is 0 (zero)
    useEffect(() => {

        let mapObject;
        
        if (open && 0 === activeStep && !mapObjectRef.current) {
        
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

    }, [open, activeStep]);

    useEffect(() => {

        mapObjectRef.current = map;

    }, [map]);

    // remove any features from the map
    useEffect(() => {

        vectorSourceRef.current?.clear();

    }, [searchResults]);

    // add a feature on the map to the selected location from the search results
    useEffect(() => {
       
        if (open && map && 0 === activeStep && searchValue) {
            
            const coordinate = [searchValue.lon, searchValue.lat];

            if (vectorSourceRef.current) {
                
                vectorSourceRef.current.clear();
                vectorSourceRef.current.addFeature(
                    new Feature({
                        geometry: new Point(coordinate)
                    })
                )
    
            }

        }

        
    }, [open, map, activeStep, searchValue]);

    // animate the view: transition to the selected coordinate
    useEffect(() => {
        
        if (open && 0 === activeStep && searchValue) {

            const coordinate = [searchValue.lon, searchValue.lat];
            
            if (map) {

                const view = map.getView();

                if (view) {
                    
                    view.animate(
                        {
                            center: coordinate,
                            zoom: 16,
                            duration: 350,
                        },
                    );

                }
    
            }

        }

        
    }, [open, map, activeStep, searchValue]);

    // update the place name and address when the selected search result is updated
    useEffect(() => {

        setPlaceName(searchValue?.name);
        setPlaceAddress(searchValue?.display_name);

    }, [searchValue]);


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
                {
                    0 === activeStep ? (
                        <>
                            <ThemeProvider theme={tuaLightInnerTheme}>
                                <Box sx={{
                                    width: '225px',
                                    background: 'white',
                                    borderRadius: '4px',
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    zIndex: 1,
                                }}>
                                <Autocomplete
                                    freeSolo
                                    blurOnSelect={true}
                                    noOptionsText='Nicio locație'
                                    disableClearable={true}
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    inputValue={searchInputValue}
                                    onInputChange={handleSearchInputChange}
                                    id='custom-search'
                                    options={searchResults}
                                    getOptionLabel={(option) => option?.name ?? ''}
                                    filterOptions={filterOptions}
                                    renderOption={(props, option) => (
                                        <li {...props}
                                            key={option.display_name}
                                            >
                                            <ListItemIcon>
                                                <PlaceIcon />
                                            </ListItemIcon>
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
                                    margin: '0 auto',
                                }}
                                ref={mapElementRef}>
                            </div>
                        </>
                    ) : (
                        <Box sx={{
                            height: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-evenly'
                        }}>
                            <TextField sx={{ width: '100%' }}
                                size='small'
                                color='primary'
                                inputProps={{
                                    maxLength: 256
                                }}
                                name='place_name'
                                label='Denumire'
                                value={placeName}
                                helperText={placeNameHelperText}
                                error={placeNameError}
                                disabled={saving}
                                onChange={handlePlaceNameChange}
                            />
                            <TextField sx={{ width: '100%' }}
                                size='small'
                                color='primary'
                                inputProps={{
                                    maxLength: 256
                                }}
                                name='place_address'
                                label='Adresă'
                                value={placeAddress}
                                helperText={placeAddressHelperText}
                                error={placeAddressError}
                                multiline
                                rows={4}
                                disabled={saving}
                                onChange={handlePlaceAddressChange}
                            />
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
                <Button onClick={handleClose}
                    color='error'
                    variant='outlined'
                    disabled={saving}>
                    Renunță
                </Button>
                {
                    0 === activeStep ? (
                        <>
                            <Button variant='contained'
                                disabled={searching || !searchValue}
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