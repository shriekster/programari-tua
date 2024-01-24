
import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import Slider from '@mui/material/Slider';

import PlaceIcon from '@mui/icons-material/Place';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';

import { useGlobalStore } from '../useGlobalStore';
import refreshAccessToken from '../refreshAccessToken.js';

// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
    setError,
    setErrorMessage,
    addTimeRange,
} = useGlobalStore.getState();

const generateTimeArray = ([minHour, minMinute], [maxHour, maxMinute], minuteStep ) => {

  const startTime = new Date();
  startTime.setHours(minHour, minMinute, 0, 0); // Set the start time to 08:00:00.000

  const endTime = new Date();
  endTime.setHours(maxHour, maxMinute, 0, 0); // Set the end time to 20:00:00.000

  const timeArray = [];

  let currentTime = startTime;

  while (currentTime <= endTime) {

    const formattedTime = currentTime.toLocaleTimeString('ro-RO', { hour12: false, hour: '2-digit', minute: '2-digit' });

    timeArray.push(formattedTime);

    currentTime.setMinutes(currentTime.getMinutes() + minuteStep);
  }

  return timeArray;

};

const hours = generateTimeArray([8, 0], [20, 0], 30);

const minDistance = 2;
const minValue = 0;
const maxValue = hours.length - 1;
const middleValue = (minValue + maxValue) / 2;

const marks = [
  {
    value: minValue,
    label: hours[minValue],
  },
  {
    value: middleValue,
    label: hours[middleValue],
  },
  {
    value: maxValue,
    label: hours[maxValue],
  },
];




// eslint-disable-next-line react/prop-types
export default function TimeRangeAdd({ open, handleClose, date }) {
    
    const [saving, setSaving] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const openMenu = Boolean(anchorEl);
    const [timeRange, setTimeRange] = useState([10, 20]);

    const dates = useGlobalStore((state) => state.dates);
    const locations = useGlobalStore((state) => state.locations);

    // eslint-disable-next-line react/prop-types
    const day = date?.$d?.toLocaleDateString('ro-RO') ?? '';
    const dateId = dates?.get(day)?.id ?? '';

    const handleUpdate = async (index) => {

        const { locations, dates } = useGlobalStore.getState();
        const dateId = dates?.get(day)?.id ?? '';

        const canUpdateDate = 
            index >= 0                &&
            index < locations.length  &&
            locations[index];

        if (canUpdateDate) {

            setSaving(true);

            let error = null, status = 401, updatedDate = null;

            try {

                const requestOptions = {
                    method: 'PUT',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        locationId: locations[index].id,
                        day,
                    }),
                    credentials: 'same-origin'
                };

                const response = await fetch(`/api/admin/dates/${dateId}`, requestOptions);
                status = response.status;

                const json = await response.json();
                updatedDate = json.data.date;
        
        
            } catch (err) {

                // eslint-disable-next-line no-unused-vars
                error = err;
                status = 400; // client-side error

            }

            switch (status) {

                case 200: {

                    setSaving(false);

                    if (updatedDate) {

                        updateDate(updatedDate);

                    }

                    break;

                }

                case 401: {

                    await refreshAccessToken(handleUpdate)
                    break;

                }

                default: {

                    setSaving(false);
                    setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
                    setError(true);
                    handleClose(false);
                    break;

                }

            }


        }

    };

    const handleChangeTimeRange = (event, newValue, activeThumb) => {

      if (!Array.isArray(newValue)) {

        return;

      }
  
      if (newValue[1] - newValue[0] < minDistance) {

        if (activeThumb === 0) {

          const clamped = Math.min(newValue[0], maxValue - minDistance);
          setTimeRange([clamped, clamped + minDistance]);

        } else {

          const clamped = Math.max(newValue[1], minValue + minDistance);
          setTimeRange([clamped - minDistance, clamped]);

        }
      } else {

        setTimeRange(newValue);

      }
    };

    // set some values to their initial state when the dialog opens
    useEffect(() => {

        if (open) {

            const dateObj = dates?.get(day);

            if (dateObj && locations) {

                const index = locations.findIndex((location) => dateObj.locationId == location.id);

                setSelectedIndex(index);

            }

        }

    }, [open, dates, locations, day]);


    return (
        <Dialog
            open={open} 
            onClose={() => { handleClose(false) }}
            fullWidth
            maxWidth='sm'
            >
            <DialogTitle sx={{ cursor: 'default', userSelect: 'none' }}>
              { day }
            </DialogTitle>
            <DialogContent sx={{ margin: '0 auto', padding: 0, position: 'relative' }}>
              <Box sx={{
                    height: '300px',
                    width: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-evenly'
                }}>
                <Box sx={{ width: '250px' }}>
                  <Typography>
                    {hours[timeRange[0]]} - {hours[timeRange[1]]}
                  </Typography>
                  <Slider 
                    step={1}
                    marks={marks}
                    min={minValue}
                    max={maxValue}
                    value={timeRange}
                    valueLabelDisplay='off'
                    onChange={handleChangeTimeRange}
                    disableSwap/>
                </Box>
              </Box>
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
                <Button onClick={() => { handleClose(false) }}
                    color='error'
                    variant='outlined'
                    disabled={saving}>
                    Renunță
                </Button>
                <Button //onClick={() => { handleClose(false) }}
                    color='primary'
                    variant='contained'
                    disabled={saving}>
                    Salvează
                </Button>
            </DialogActions>
        </Dialog>
    );

}