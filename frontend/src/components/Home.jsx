
import { useState, useEffect, useRef } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import List from '@mui/material/List';
import Button from '@mui/material/Button';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import CircleIcon from '@mui/icons-material/Circle';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import dayjs from 'dayjs';

import { fetchEventSource } from '@microsoft/fetch-event-source';

import { useGlobalStore } from '../useGlobalStore.js';

import AppointmentAdd from './AppointmentAdd.jsx';


// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
  setLoading,
  setSubscriptionId,
  setRegistryDownloaded,
  setDates,
  setTimeRanges,
  setPersonnelCategories,
  setContactInfo,
  setError,
  setErrorMessage,
} = useGlobalStore.getState();

function ServerDay(props) {

  // eslint-disable-next-line react/prop-types
  const { dates = new Map(), timeRanges = [], day, outsideCurrentMonth, ...other } = props;
  // eslint-disable-next-line react/prop-types
  const formattedDay = day?.$d?.toLocaleDateString('ro-RO') ?? '';
  const dateObj = dates.get(formattedDay);
  // eslint-disable-next-line react/prop-types
  const isSelected = dates.has(formattedDay);

  const selectedTimeRanges = timeRanges.filter((timeRange) => timeRange.dateId == dateObj?.id);
  
  let isFull = true;

  for (let i = 0, t = selectedTimeRanges.length; i < t; ++i) {

    if (selectedTimeRanges[i].occupied < selectedTimeRanges[i].capacity) {

      isFull = false;
      break;

    }

  }

  if (isSelected) {

    return (
      <Badge
        key={formattedDay}
        overlap='circular'
        variant='dot'
        color={isFull ? 'error' : 'success'}
      >
        <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
      </Badge>
    );

  }

  return (
    <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
  );
}

const tuaDarkTheme = createTheme({
  palette: {
    primary: {
      main: '#7f805d'
    },
    mode: 'dark'
  },
});

const tuaLightTheme = createTheme({
  palette: {
    primary: {
      main: '#7f805d'
    },
    mode: 'light'
  },
});

const theme = {
  'dark': tuaDarkTheme,
  'light': tuaLightTheme,
};

// eslint-disable-next-line react/prop-types
export default function Home() {

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeRangeId, setSelectedTimeRangeId] = useState(0);

  const [openAddAppointment, setOpenAddAppointment] = useState(false);

  const loading = useGlobalStore((state) => state.loading);
  const dates = useGlobalStore((state) => state.dates);
  const timeRanges = useGlobalStore((state) => state.timeRanges);
  const userTheme = useGlobalStore((state) => state.userTheme);

  const selectedDayRef = useRef(null);
  const selectedTimeRangeIdRef = useRef(0);
  const openAddAppointmentRef = useRef(false);

  const handleChangeSelectedDate = (newDate) => {

    setSelectedDate(newDate);

  };

  const handleToggleAddAppointment = () => {

    setOpenAddAppointment((prevState) => !prevState);

  };

  const handleClickToday = () => {

    const today = dayjs();

    setSelectedDate(today);

  };

  // add the 'visibilitychange' event listener and remove it when the component unmounts
  useEffect(() => {

    // eslint-disable-next-line no-unused-vars
    const onVisibilityChange = (e) => {

      if ('visible' === document.visibilityState) {

        setOpenAddAppointment(false);
        setLoading(true);
        setSelectedTimeRangeId(0);

      }

    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {

      document.removeEventListener('visibilitychange', onVisibilityChange);

    };

  }, []);

  // subscribe to user events and get admin data after subscribing (locations, profile and registry data)
  // unsubscribe when the component unmounts
  useEffect(() => {

    class RetriableError extends Error { }
    class FatalError extends Error { }

    const abortController = new AbortController();
    const eventStreamContentType = 'text/event-stream; charset=utf-8';

    const subscriptionIdRegex = /^[a-zA-Z0-9]{16}$/;

    setLoading(true);
    
    fetchEventSource('/api/events', {

      async onopen(response) {

        const contentTypeHeader = response.headers.get('content-type');
        const subscriptionIdHeader = response.headers.get('x-subscription-id');

        const everythingIsGood = 
          response.ok                                   && 
          eventStreamContentType === contentTypeHeader  &&
          subscriptionIdRegex.test(subscriptionIdHeader);

        if (everythingIsGood) {
          
          setSubscriptionId(subscriptionIdHeader);
          return; // everything's good

        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          
            // non-retriable error for every client-side error
            throw new FatalError();

        } else {

            throw new RetriableError();

        }

      },

      onmessage(msg) {

        let dataObj = null, error = null;
        const { data, event } = msg;

        try {

          dataObj = JSON.parse(data);

        } catch (err) {

          error = err;

        }

        if (!error) {
          
          switch (event) {

            case 'sync': {
  
              // the UI should be in a loading state; if it is, set the loading state to false
  
              const isLoading = useGlobalStore.getState().loading;
  
              if (isLoading) {
  
                setLoading(false);
  
              }
  
              if (dataObj.registry) {
                
                setDates(new Map(dataObj.registry.dates));
                setTimeRanges(dataObj.registry.timeRanges);
                setPersonnelCategories(dataObj.registry.personnelCategories);
                setRegistryDownloaded(true);
  
              }
  
              if (dataObj.contactInfo) {
  
                setContactInfo(dataObj.contactInfo);
  
              }
  
              break;

            }
  
            case 'update': {
  
              if (dataObj.registry) {
                
                const nextDates = new Map(dataObj.registry.dates);
                const nextTimeRanges = dataObj.registry.timeRanges;

                const currentlySelectedDay = selectedDayRef.current;
                const currentlySelectedTimeRangeId = selectedTimeRangeIdRef.current;
                const currentlyAddingAppointment = openAddAppointmentRef.current;

                if (currentlyAddingAppointment) {

                  const nextSelectedTimeRange = nextTimeRanges.find((timeRange) => timeRange?.id == currentlySelectedTimeRangeId);
                
                  if (( currentlySelectedDay && !nextDates.has(currentlySelectedDay) ) || !nextSelectedTimeRange) {

                    setOpenAddAppointment(false);
                    setErrorMessage('Intervalul orar nu mai este disponibil!');
                    setError(true);
  
                  }

                }

                setDates(nextDates);
                setTimeRanges(nextTimeRanges);
  
              }

              break;

            }
  
            // if the server emits an error message, throw an exception
            // so it gets handled by the onerror callback below:
            case 'error': {
  
              throw new FatalError(msg.data);
  
            }
  
            default: break;
  
          }

        }


      },

      onclose() {

        // if the server closes the connection unexpectedly, retry:
        throw new RetriableError();

      },

      onerror(err) {
        
        if (err instanceof FatalError) {

          setError(true);
          setErrorMessage('A apărut o problemă, reîmprospătează pagina!');
          throw err; // rethrow to stop the operation

        } else {
            // do nothing to automatically retry. You can also
            // return a specific retry interval here.
            return 1000;
        }

      },

      credentials: 'same-origin',

      signal: abortController.signal,

    });

    // unsubscribe from user events
    return () => {

      console.log('Unsubscribing...');
      abortController.abort();

    };

  }, []);

  // update the selected date ref, the selected timeRangeId ref and the openAddAppointment ref (for the SSE handler)
  useEffect(() => {

    selectedDayRef.current = selectedDate?.$d?.toLocaleDateString('ro-RO') ?? '';
    selectedTimeRangeIdRef.current = selectedTimeRangeId;
    openAddAppointmentRef.current = openAddAppointment;

  }, [selectedDate, selectedTimeRangeId, openAddAppointment]);

  // close the error snackbar when the user wants to add an apointment and opens the dialogue
  useEffect(() => {

    if (openAddAppointment) {

      setError(false);

      const timeoutId = setTimeout(() => {

        clearTimeout(timeoutId);
        setErrorMessage('');

      });
      
    }

  }, [openAddAppointment]);

  // eslint-disable-next-line react/prop-types
  const selectedDay = selectedDate?.$d?.toLocaleDateString('ro-RO') ?? '';
  const selectedDateObj = dates?.get(selectedDay);
 
  const selectedTimeRanges = timeRanges.filter((timeRange) => timeRange.dateId == selectedDateObj?.id);

  return (
    <ThemeProvider theme={theme[`${userTheme}`]}>
      <CssBaseline />
      <Box sx={{
          margin: 0,
          padding: 0,
        }}>
        <DateCalendar
          views={['day']}
          showDaysOutsideCurrentMonth
          displayWeekNumber
          disablePast
          disabled={loading}
          loading={loading}
          renderLoading={() => <DayCalendarSkeleton />}
          value={selectedDate}
          onChange={handleChangeSelectedDate}
          slots={{
            day: ServerDay,
          }}
          slotProps={{
            day: {
              dates,
              timeRanges
            },
          }}
          />
          <Box sx={{
            width: '320px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            //height: '40px',
            padding: '8px 0',
          }}>
            <Button sx={{ alignSelf: 'flex-end', marginBottom: '4px' }}
              disabled={loading}
              onClick={handleClickToday}>
              Astăzi
            </Button>
            <Divider variant='fullWidth' sx={{ width: '100%', flex: 1 }} />
          </Box>
            {
              selectedDate ? (
                selectedTimeRanges.length ? (
                  <List sx={{
                    width: '320px',
                    margin: '0 auto',
                  }}>
                  {
                    selectedTimeRanges.map((timeRange) => {

                      const primaryText = `${timeRange.startTime} - ${timeRange.endTime}`;
                      const freeSeats = timeRange.capacity - timeRange.occupied;
                      const color = freeSeats > 0 ? 'success' : 'error';
                      const secondaryText = freeSeats > 0 ? ( 1 === freeSeats ? '1 loc liber' : `${freeSeats} locuri libere` ) : 'niciun loc liber';
                      const disabled = 0 === freeSeats;

                      return (
                        <Button key={timeRange.id}
                          sx={{ 
                              userSelect: 'none',
                              borderRadius: '4px', 
                              marginBottom: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              textTransform: 'none'
                            }}
                            color={color}
                            variant='contained'
                            disabled={disabled}
                            onClick={() => { if (!loading) { setSelectedTimeRangeId(timeRange.id); handleToggleAddAppointment(); } }}
                          >
                            <Typography fontWeight={700} fontSize={18}>
                              {primaryText}
                            </Typography>
                            <Typography>
                              {secondaryText}
                            </Typography>
                        </Button>
                      );

                    })
                  }
                  </List>
                ) : (
                  <Box sx={{ width: '320px', margin: '0 auto', }}>
                    <Typography textAlign='center' sx={{ opacity: .5 }}>
                      Momentan nu se fac programări pentru {selectedDay}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Typography textAlign='center' sx={{ opacity: .5, display: 'inline' }}>
                          Selectează una dintre zilele marcate cu 
                      </Typography>
                      <CircleIcon fontSize='small' color='success' sx={{ display: 'inline' }}/>
                    </Box>
                  </Box>
                )
              ) : (
                <Box sx={{ width: '320px', margin: '0 auto', }}>
                  <Typography textAlign='center' sx={{ opacity: .5, cursor: 'default', userSelect: 'none', marginBottom: '8px' }}>
                    Selectează o zi din calendar
                  </Typography>
                  <Box sx={{
                    border: '1px solid rgba(128, 128, 128, .5)',
                    borderRadius: '4px',
                    padding: '8px',
                  }}>
                    <Typography sx={{ opacity: .5, cursor: 'default', userSelect: 'none', marginBottom: '8px' }}>
                      Legendă
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                      <CircleIcon fontSize='small' color='success'/>
                      <Typography textAlign='center' sx={{ opacity: .5, cursor: 'default', userSelect: 'none' }}>
                        sunt locuri libere
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px' }}>
                      <CircleIcon fontSize='small' color='error'/>
                      <Typography textAlign='center' sx={{ opacity: .5, cursor: 'default', userSelect: 'none' }}>
                        nu sunt locuri libere
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )
            }
          <AppointmentAdd open={openAddAppointment}
            handleClose={handleToggleAddAppointment}
            date={selectedDate}
            dateObj={selectedDateObj}
            timeRangeId={selectedTimeRangeId}/>
      </Box>
    </ThemeProvider>
  );

}
  