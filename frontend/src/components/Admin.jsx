
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';

import { fetchEventSource } from '@microsoft/fetch-event-source';

import { useGlobalStore } from '../useGlobalStore.js';

import refreshAccessToken from '../refreshAccessToken.js';

import DateAdd from './DateAdd.jsx';
import DateEdit from './DateEdit.jsx';
import TimeRangeAdd from './TimeRangeAdd.jsx';
import TimeRangeEdit from './TimeRangeEdit.jsx';


// get the functions from the global store as non-reactive, fresh state,
// because this proves the linter that the functions are not changing between renders
// why? because it's annoying to specify functions as effect depedencies and I could not think of
// a better solution, at least for now
const {
  setLoading,
  setSubscriptionId,
  setLocationsDownloaded,
  setLocations,
  setProfileDownloaded,
  setProfileUrl,
  setFullName,
  setPhoneNumber,
  setRegistryDownloaded,
  setDates,
  setTimeRanges,
  setAppointments,
  setPersonnelCategories,
  setError,
  setErrorMessage,
} = useGlobalStore.getState();

function ServerDay(props) {

  // eslint-disable-next-line react/prop-types
  const { dates = new Map(), day, outsideCurrentMonth, ...other } = props;
  
  // eslint-disable-next-line react/prop-types
  const formattedDay = day?.$d?.toLocaleDateString('ro-RO') ?? '';
  // eslint-disable-next-line react/prop-types
  const isSelected = dates.has(formattedDay);

  if (isSelected) {

    return (
      <Badge
        key={formattedDay}
        overlap='circular'
        variant='dot'
        color='secondary'
      >
        <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
      </Badge>
    );

  }

  return (
    <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
  );
  
}

// eslint-disable-next-line react/prop-types
export default function Admin() {

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeRangeId, setSelectedTimeRangeId] = useState(0);
  const [openAddDate, setOpenAddDate] = useState(false);
  const [openEditDate, setOpenEditDate] = useState(false);
  const [openAddTimeRange, setOpenAddTimeRange] = useState(false);
  const [openEditTimeRange, setOpenEditTimeRange] = useState(false);

  const [displaySettings, setDisplaySettings] = useState(false);

  const loading = useGlobalStore((state) => state.loading);
  const dates = useGlobalStore((state) => state.dates);
  const timeRanges = useGlobalStore((state) => state.timeRanges);

  const handleChangeSelectedDate = (newDate) => {

    setSelectedDate(newDate);

  };

  const handleToggleAddDate = (bool = undefined) => {

    if (undefined !== bool) {
      
      setOpenAddDate(Boolean(bool));

    } else {

      setOpenAddDate((prevState) => !prevState);

    }

  };

  const handleToggleEditDate = (bool = undefined) => {

    if (undefined !== bool) {
      
      setOpenEditDate(Boolean(bool));

    } else {

      setOpenEditDate((prevState) => !prevState);

    }

  };

  const handleToggleAddTimeRange = (bool = undefined) => {

    if (undefined !== bool) {
      
      setOpenAddTimeRange(Boolean(bool));

    } else {

      setOpenAddTimeRange((prevState) => !prevState);

    }

  };

  const handleToggleEditTimeRange = (bool = undefined) => {

    if (undefined !== bool) {
      
      setOpenEditTimeRange(Boolean(bool));

    } else {

      setOpenEditTimeRange((prevState) => !prevState);

    }

  };

  const handleAddTimeRangeFromDateEdit = () => {

    handleToggleEditDate(false);
    handleToggleAddTimeRange(true);

  };

  const handleDownload = async () => {

    const selectedDay = selectedDate?.$d?.toLocaleDateString('ro-RO') ?? '';
    const selectedDateId = dates?.get(selectedDay)?.id ?? '';

    setLoading(true);

    // eslint-disable-next-line no-unused-vars
    let error = null, status = 401, fileBlob = null;

    try {

        const requestOptions = {
            method: 'GET',
            credentials: 'same-origin'
        };

        const response = await fetch(`/api/admin/dates/${selectedDateId}/download`, requestOptions);
        status = response.status;

        fileBlob = await response.blob();


    } catch (err) {

        // eslint-disable-next-line no-unused-vars
        error = err;
        status = 400; // client-side error

    }

    switch (status) {

        case 200: {

            setLoading(false);

            if (fileBlob) {

              const link = document.createElement('a');
              link.href = URL.createObjectURL(fileBlob);
              link.download = `${selectedDay}.xlsx`;
        
              // Append the link to the document
              document.body.appendChild(link);
        
              // Trigger a click on the link to start the download
              link.click();
        
              // Remove the link from the document
              document.body.removeChild(link);

            }

            break;

        }

        case 401: {

            await refreshAccessToken(handleDownload);
            break;

        }

        case 418: {

          setLoading(false);
          setErrorMessage('Nu sunt programări în ziua selectată!');
          setError(true);
          break;

        }

        default: {

            setLoading(false);
            setErrorMessage('Eroare! Încearcă din nou în câteva secunde.');
            setError(true);
            break;

        }

    }

  };

  // add the 'visibilitychange' event listener and remove it when the component unmounts
  useEffect(() => {

    // eslint-disable-next-line no-unused-vars
    const onVisibilityChange = (e) => {

      if ('visible' === document.visibilityState) {

        setLoading(true);

      }

    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {

      document.removeEventListener('visibilitychange', onVisibilityChange);

    };

  }, []);

  // subscribe to admin events and get admin data after subscribing (locations, profile and registry data)
  // unsubscribe when the component unmounts
  useEffect(() => {

    class RetriableError extends Error { }
    class FatalError extends Error { }

    const abortController = new AbortController();
    const eventStreamContentType = 'text/event-stream; charset=utf-8';

    const subscriptionIdRegex = /^[a-zA-Z0-9]{16}$/;

    setLoading(true);
    
    fetchEventSource('/api/admin/events', {

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
          
          if (401 === response.status) {

            // try to refresh the access token if it's expired,
            // then retry
            await refreshAccessToken(fetchEventSource);

          } else {

            // non-retriable error for every other client-side error:
            throw new FatalError();

          }

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
                setAppointments(dataObj.registry.appointments);
                setPersonnelCategories(dataObj.registry.personnelCategories);
                setRegistryDownloaded(true);
  
              }
  
              if (dataObj.locations) {
  
                setLocations(dataObj.locations);
                setLocationsDownloaded(true);
  
              }
  
              if (dataObj.profile) {
  
                setFullName(dataObj.profile.fullName);
                setPhoneNumber(dataObj.profile.phoneNumber);
                setProfileUrl(dataObj.profile.url);
                setProfileDownloaded(true);
  
              }
  
              break;

            }
  
            case 'update:appointments': {
  
              if (dataObj.registry) {

                setAppointments(dataObj.registry.appointments);
                setTimeRanges(dataObj.registry.timeRanges);
  
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

    // unsubscribe from admin events
    return () => {

      console.log('Unsubscribing...');
      abortController.abort();

    };

  }, []);

  // this effect 'configures' whether the settings button is displayed or not
  useEffect(() => {

    if (dates && selectedDate) {

      const day = selectedDate.$d.toLocaleDateString('ro-RO');

      if (dates.has(day)) {

        setDisplaySettings(true);

      } else {

        setDisplaySettings(false);

      }

    } else {

      setDisplaySettings(false);

    }

  }, [dates, selectedDate]);

  // eslint-disable-next-line react/prop-types
  const selectedDay = selectedDate?.$d?.toLocaleDateString('ro-RO') ?? '';
  const selectedDateObj = dates?.get(selectedDay);
  const selectedTimeRanges = timeRanges.filter((timeRange) => timeRange.dateId == selectedDateObj?.id);

  return (
    <Box sx={{
        margin: 0,
        padding: 0,
      }}>
      <DateCalendar 
        views={['day']}
        showDaysOutsideCurrentMonth
        displayWeekNumber
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
          },
        }}
        />
        <Box sx={{
          width: '320px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '40px',
        }}>
          <Divider variant='fullWidth' sx={{ width: '100%', flex: 1 }} />
          {
            displaySettings && (
              <>
                <IconButton color='success' 
                  disabled={loading}
                  onClick={handleDownload}
                  sx={{ marginRight: '8px' }}>
                  <FileDownloadIcon fontSize='large' />
                </IconButton>
                <IconButton color='primary' 
                  disabled={loading}
                  onClick={() => { handleToggleEditDate(true) }}>
                  <SettingsIcon fontSize='large' />
                </IconButton>
              </>
            )
          }
        </Box>
          {
            selectedDate ? (
              displaySettings ? (
                <List sx={{
                  width: '320px',
                  margin: '0 auto',
                }}>
                  {
                    selectedTimeRanges.length ? (
                      selectedTimeRanges.map((timeRange) => (
                        <ListItem key={timeRange.id}
                          sx={{ 
                              cursor: 'pointer', 
                              userSelect: 'none',
                              border: '1px solid rgba(255, 255, 255, .125)',
                              borderRadius: '4px', 
                              marginBottom: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onClick={() => { if (!loading) { setSelectedTimeRangeId(timeRange.id); handleToggleEditTimeRange(true); } }}
                            >
                          <ListItemText 
                            primary={timeRange.startTime + ' - ' + timeRange.endTime}
                            primaryTypographyProps={{ textAlign: 'center', width: '200px' }}
                            />
                          <Chip size='small' 
                            label={timeRange.published ? 'Publicat' : 'Nepublicat'}
                            variant='outlined' 
                            color={timeRange.published ? 'success' : 'warning'}/>
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText sx={{ cursor: 'default', userSelect: 'none' }}
                          primary={'Apasă ⚙️ pentru a adăuga un interval orar'}
                          primaryTypographyProps={{ textAlign: 'center' , color: 'rgba(255, 255, 255, .5)',  }}
                          />
                    </ListItem>
                    )
                  }
                </List>
              ) : (
                <Box sx={{ margin: '0 auto', display: 'flex', }}>
                  <Button variant='contained' 
                    sx={{ margin: '0 auto', }}
                    disabled={loading}
                    startIcon={<InsertInvitationIcon />}
                    onClick={handleToggleAddDate}>
                    Adaugă ziua de antrenament
                  </Button>
                </Box>
              )
            ) : (
              <Typography textAlign='center' sx={{ opacity: .5, cursor: 'default', userSelect: 'none' }}>
                Selectează o zi din calendar
              </Typography>
            )
          }
        <DateAdd open={openAddDate} 
          handleClose={() => { handleToggleAddDate(false) }}
          date={selectedDate}/>
        <DateEdit open={openEditDate} 
          handleClose={() => { handleToggleEditDate(false) }}
          handleAddTimeRange={handleAddTimeRangeFromDateEdit}
          date={selectedDate}/>
        <TimeRangeAdd open={openAddTimeRange}
          handleClose={() => { handleToggleAddTimeRange(false) }}
          date={selectedDate}/>
        <TimeRangeEdit open={openEditTimeRange}
          handleClose={() => { handleToggleEditTimeRange(false) }}
          date={selectedDate}
          timeRangeId={selectedTimeRangeId}/>
    </Box>
  );

}
  