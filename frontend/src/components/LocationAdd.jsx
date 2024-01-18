// TODO:    implement the search box: positioned over the map,
//          with a menu displaying the results;
//          make sure to somehow throttle/debounce the search requests,
//          so that the API call frequency is at most 1 request/second;
//          also, this component should not be fullscreen
// TODO: use Autocomplete component
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


// eslint-disable-next-line react/prop-types
export default function LocationAdd({ open, handleClose }) {

    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [targetLocationName, setTargetLocationName] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [searchInputValue, setSearchInputValue] = useState('');
    const [searchError, setSearchError] = useState(false);
    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [openResultsList, setOpenResultsList] = useState(false);

    const [map, setMap] = useState(null);

    const mapElementRef = useRef();
    const mapObjectRef = useRef();
    const vectorSourceRef = useRef();
    const searchBoxRef = useRef();

    const timeoutRef = useRef();

    useGeographic();

    const handleTargetLocationChange = (event) => {

        setTargetLocationName(event.target.value);

        setResults([]);
        setSelectedResult(null);

    };

    const handleSearchChange = (event, newValue) => {

        setSearchValue(newValue);

        setResults([]);
        setSelectedResult(null);

    };

    const handleSearchInputChange = (event, newInputValue) => {

        setSearchInputValue(newInputValue);
        //search();

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

            const searchEndpointUrlWithParameters = `https://nominatim.openstreetmap.org/search?format=json&accept-language=ro-RO&countrycodes=ro&addressdetails=1&namedetails=0&q=${targetLocationName}`;
            
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
                    setMenuAnchor(searchBoxRef.current);

                }

            }

        } else {

            setSearchError(true);

        }

    };

    const search = async () => {

        if (searchInputValue !== '') {

            let error = null, data = null;

            setSearching(true);

            const requestOptions = {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                },
            };

            const searchEndpointUrlWithParameters = `https://nominatim.openstreetmap.org/search?format=json&accept-language=ro-RO&countrycodes=ro&addressdetails=1&namedetails=0&q=${searchInputValue}`;
            
            try {

                const response = await fetch(searchEndpointUrlWithParameters, requestOptions);

                if (!response.ok) {

                    throw new Error('Something happened!');

                }

                data = await response.json();

            } catch (err) {

                error = err;

            } finally {

                setSearching(false);

                if (!error && data) {

                    setResults(data);
                    setMenuAnchor(searchBoxRef.current);

                }

            }

        } else {

            setSearchError(true);

        }

    };

    const handleResultClick = (result) => {

        setSelectedResult(result);
        setTargetLocationName(result?.name);
        setMenuAnchor(null);

    };

    const handleCloseMenu = () => {

        setMenuAnchor(null);

    };

    const handleSearchBoxFocus = () => {

        if (results.length) {

            setMenuAnchor(searchBoxRef.current)

        }

    };

    const handleClearSearchBox = () => {

        setSearchInputValue('');
        setSearchValue('');
        setResults([]);
        setSelectedResult(null);

    };

    useEffect(() => {

        let mapObject;

        if (open) {

            setTargetLocationName('');
            setSearchError(false);
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

    // add a feature on the map to the selected location from the results
    useEffect(() => {
       
        if (selectedResult) {

            const coordinate = [selectedResult.lon, selectedResult.lat];

            if (vectorSourceRef.current) {

                vectorSourceRef.current.clear();
                vectorSourceRef.current.addFeature(
                    new Feature({
                        geometry: new Point(coordinate)
                    })
                )
    
            }

        }

        
    }, [selectedResult]);

    // animate the view: transition to the selected coordinate
    useEffect(() => {
        
        if (selectedResult) {

            const coordinate = [selectedResult.lon, selectedResult.lat];

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

        
    }, [selectedResult]);

    const customTextFieldParams = {
        sx: { 
            width: '100%',
        },
        color: 'primary',
        inputProps: {
            maxLength: 256,
        },
        size: 'small',
        name: 'location',
    };

    const customInputProps = {
        startAdornment: 
            <InputAdornment position='start'>
                <TravelExploreIcon color='primary' />
            </InputAdornment>,
        endAdornment: '' !== searchInputValue ? (
                <InputAdornment position='end'>
                    <IconButton onClick={handleClearSearchBox}
                        aria-label='șterge'
                        sx={{ color: 'black' }}
                        >
                        {
                            searching ? (
                                <CircularProgress disableShrink
                                    size={16}
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
        //sx: { color: 'black' },
    };

    return (

        <Dialog
            open={open} 
            onClose={handleClose}
            fullWidth
            maxWidth='sm'
            //keepMounted={false}
            >
            <DialogTitle>
                Adaugă o locație
            </DialogTitle>
            <DialogContent sx={{ margin: '0 auto', padding: 0, position: 'relative' }}>
                <ThemeProvider theme={tuaLightInnerTheme}>
                    <Autocomplete
                        freeSolo
                        disableClearable={true}
                        value={searchValue}
                        onChange={handleSearchChange}
                        inputValue={searchInputValue}
                        onInputChange={handleSearchInputChange}
                        id='custom-search'
                        //options={results}
                        options={['', '1', '2', '3']}
                        sx={{ width: 300 }}
                        disabled={loading}
                        //getOptionLabel={(option) => option?.display_name ?? ''}
                        renderInput={(params) => (
                            <TextField {...params} 
                                {...customTextFieldParams}
                                inputProps={{
                                    ...params.inputProps,
                                }}
                                InputProps={{
                                    ...params.InputProps,
                                    ...customInputProps
                                }}
                                />
                                
                        )}
                    />
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