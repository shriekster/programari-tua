
import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

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

const hourMarks = [
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

const numberMarks = [

  {
    value: 10,
    label: 10,
  },
  {
    value: 20,
    label: 20,
  },
  {
    value: 30,
    label: 30,
  },
  {
    value: 40,
    label: 40,
  },
  {
    value: 50,
    label: 50,
  },

];

// eslint-disable-next-line react/prop-types
export default function TimeRangeAdd({ open, handleClose, date }) {
    
    const [saving, setSaving] = useState(false);

    const [timeRange, setTimeRange] = useState([minValue, middleValue]);
    const [numberOfParticipants, setNumberOfParticipants] = useState(20);
    const [published, setPublished] = useState(false);

    const dates = useGlobalStore((state) => state.dates);

    // eslint-disable-next-line react/prop-types
    const day = date?.$d?.toLocaleDateString('ro-RO') ?? '';
    const dateId = dates?.get(day)?.id ?? '';

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

    const handleChangeNumberOfParticipants = (event, newValue) => {

      setNumberOfParticipants(newValue);

    };

    const handleChangePublished = (event) => {

      setPublished(event.target.checked);

    };

    const handleSave = async () => {

      setSaving(true);

      let error = null, status = 401, returnedTimeRange = null;

      try {

          const requestOptions = {
              method: 'POST',
              headers: {
              'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                dateId,
                startTime: hours[timeRange[0]],
                endTime: hours[timeRange[1]],
                capacity: numberOfParticipants,
                published,
              }),
              credentials: 'same-origin'
          };

          const response = await fetch(`/api/admin/timeranges`, requestOptions);
          status = response.status;

          const json = await response.json();
          returnedTimeRange = json.data.timeRange;
  
  
      } catch (err) {

          // eslint-disable-next-line no-unused-vars
          error = err;
          status = 400; // client-side error

      }

      switch (status) {

          case 200: {

              setSaving(false);

              if (returnedTimeRange) {

                  addTimeRange(returnedTimeRange);

              }

              handleClose(false);

              break;

          }

          case 401: {

              await refreshAccessToken(handleSave);
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

    };

    useEffect(() => {

      if (open) {

        setTimeRange([minValue, middleValue]);
        setNumberOfParticipants(20);
        setPublished(false);

      }

    }, [open]);

    if (open) {

      return (
          <Dialog
              open={open} 
              onClose={() => { handleClose(false) }}
              fullWidth
              maxWidth='sm'
              >
              <DialogTitle sx={{ cursor: 'default', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <MoreTimeIcon sx={{ marginRight: '8px' }}/> { day }
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
                      Intervalul orar: {hours[timeRange[0]]} - {hours[timeRange[1]]}
                    </Typography>
                    <Slider 
                        step={1}
                        marks={hourMarks}
                        min={minValue}
                        max={maxValue}
                        value={timeRange}
                        valueLabelDisplay='off'
                        onChange={handleChangeTimeRange}
                        disableSwap/>
                  </Box>
                  <Box sx={{ width: '250px' }}>
                    <Typography>
                      Numărul de locuri: {numberOfParticipants}
                    </Typography>
                    <Slider 
                        step={5}
                        marks={numberMarks}
                        min={5}
                        max={50}
                        value={numberOfParticipants}
                        valueLabelDisplay='off'
                        onChange={handleChangeNumberOfParticipants}
                        disableSwap/>
                  </Box>
                  <Box sx={{ width: '250px' }}>
                    <FormControlLabel control={<Checkbox size='large' checked={published} onChange={handleChangePublished} />} label='Publicat'/>
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
                  <Button onClick={handleSave}
                      color='primary'
                      variant='contained'
                      disabled={saving}>
                      Salvează
                  </Button>
              </DialogActions>
          </Dialog>
      );

    }

    return null;

}