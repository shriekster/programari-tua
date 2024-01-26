
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
import RecentActorsIcon from '@mui/icons-material/RecentActors';

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
export default function TimeRangeEdit({ open, handleClose, date, timeRangeId }) {
    
    const [saving, setSaving] = useState(false);

    const dates = useGlobalStore((state) => state.dates);
    const timeRanges = useGlobalStore((state) => state.timeRanges);

    // eslint-disable-next-line react/prop-types
    const day = date?.$d?.toLocaleDateString('ro-RO') ?? '';
    const dateId = dates?.get(day)?.id ?? '';
    
    const timeRange = timeRanges.find((timeRange) => timeRange.id == timeRangeId);

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
                test: 'test'
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

    }, [open]);

    return (
        <Dialog
            open={open} 
            onClose={() => { handleClose(false) }}
            fullWidth
            maxWidth='sm'
            >
            <DialogTitle sx={{ cursor: 'default', userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <RecentActorsIcon fontSize='large' sx={{ marginRight: '8px' }}/>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Typography fontSize={17} fontWeight={500}>{ day }</Typography>
                <Typography fontSize={17} fontWeight={500} sx={{ margin: '0 8px' }}> | </Typography>
                <Typography fontSize={17} fontWeight={500}>{timeRange?.startTime} - {timeRange?.endTime}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ position: 'relative', }}>
              <Box sx={{ width: '100%'}}>
                {
                  (new Array(1000).fill(1)).map((val, i) => (
                    <div key={i}>{i}</div>
                  ))
                }
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
                    justifyContent: 'center'
                }}>
                <Button onClick={() => { handleClose(false) }}
                    color='primary'
                    variant='contained'
                    disabled={saving}>
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );

}