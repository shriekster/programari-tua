import path from 'node:path';
import Database from 'better-sqlite3';

let db = null, dbOpenError = null;
const dbFilePath = path.resolve(process.cwd(), './data/tua.db');

let stmtError = null;
const statements = {};

// admin
let getSecret = null;
let getCredentials = null;
let getProfileId = null;
let getProfile = null;
let updateProfile = null;
let getLocations = null;
let addLocation = null;
let deleteLocation = null;
let getDates = null;
let addDate = null;
let updateDate = null;
let deleteDate = null;
let getTimeRanges = null;
let addTimeRange = null;
let updateTimeRange = null;
let deleteTimeRange = null;
let getAppointments = null;
let exportDate = null;
let getPersonnelCategories = null;

// user
let getUserDates = null;
let getUserTimeRanges = null;
let getContactInfo = null;
let getPageId = null;
let addAppointment = null;
let getUserAppointment = null;
let deleteUserAppointment = null;

// sms gateway
let getMessages = null;

// utility functions
const replaceAt = (string, index, replacement) => {

    return string.substring(0, index) + replacement + this.substring(index + replacement.length);

};

const replaceFrom = (string, index, replacementChar) => {

    const replacementLength = string.substring(1).length;
    const replacementString = new Array(replacementLength).fill(replacementChar).join('');

    return string.substring(0, index) + replacementChar + replacementString;

};

try {

    db = new Database(dbFilePath, {
        fileMustExist: true
    });

    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = FULL');

} catch (err) {

    dbOpenError = err;

}

try {

    // admin
    statements['get_secret'] = db.prepare(`
        SELECT value
        FROM secrets
        WHERE scope = ?`);

    statements['get_credentials'] = db.prepare(`
        SELECT id, username, password AS passwordHash, type
        FROM users
        WHERE username = ?`);

    statements['get_profile'] = db.prepare(`
        SELECT 
            id,
            full_name AS fullName,
            phone_number AS phoneNumber
        FROM users
        WHERE username = ?`);

    statements['update_profile'] = db.prepare(`
        UPDATE users
        SET 
            full_name = ?,
            phone_number = ?
        WHERE id = ?`);

    statements['get_locations'] = db.prepare(`
        SELECT
            id,
            place_id AS placeId,
            osm_id AS osmId,
            lat,
            lon,
            display_name AS displayName,
            name
        FROM locations`);

    statements['add_location'] = db.prepare(`
        INSERT INTO locations(place_id, osm_id, lat, lon, display_name, name)
        VALUES (?, ?, ?, ?, ?, ?)`);

    statements['delete_location'] = db.prepare(`
        DELETE FROM locations
        WHERE id = ?`);

    statements['get_dates'] = db.prepare(`
        SELECT dates.id, locations.id AS locationId, dates.day
        FROM dates
        LEFT JOIN locations ON dates.location_id = locations.id`);

    statements['add_date'] = db.prepare(`
        INSERT INTO dates(location_id, day)
        VALUES (?, ?)`);
    
    statements['update_date'] = db.prepare(`
        UPDATE dates
        SET
            location_id = ?,
            day = ?
        WHERE
            id = ?`);

    statements['delete_date'] = db.prepare(`
        DELETE FROM dates
        WHERE id = ?`);

    statements['get_timeranges'] = db.prepare(`
        SELECT 
            time_ranges.id, 
            dates.id AS dateId, 
            time_ranges.capacity, 
            time_ranges.published,
            time_ranges.start_time AS startTime,
            time_ranges.end_time AS endTime,
            (
                SELECT
                    COUNT(DISTINCT participants.id) from participants
                LEFT JOIN appointments ON appointments.id = participants.appointment_id
                WHERE appointments.time_range_id = time_ranges.id
            ) AS occupied
        FROM time_ranges
        LEFT JOIN dates ON dates.id = time_ranges.date_id`);

    statements['add_timerange'] = db.prepare(`
        INSERT INTO time_ranges(date_id, start_time, end_time, capacity, published)
        VALUES (?, ?, ?, ?, ?)`);

    statements['update_timerange'] = db.prepare(`
        UPDATE time_ranges
        SET
            date_id = ?,
            start_time = ?,
            end_time = ?,
            capacity = ?,
            published = ?
        WHERE
            id = ?`);

    statements['delete_timerange'] = db.prepare(`
        DELETE FROM time_ranges
        WHERE id = ?`);

    statements['get_appointments'] = db.prepare(`
        SELECT
            appointments.time_range_id AS timeRangeId,
            appointments.id AS appointmentId,
            appointments.phone_number AS phoneNumber,
            participants.id AS participantId,
            participants.last_name AS lastName,
            participants.first_name AS firstName,
            participants.is_adult AS isAdult,
            personnel_categories.id AS personnelCategoryId,
            personnel_categories.abbreviation AS personnelCategoryAbbreviation
        FROM participants
        LEFT JOIN appointments ON appointments.id = participants.appointment_id
        LEFT JOIN personnel_categories on personnel_categories.id = participants.personnel_category_id`);

    statements['export_date'] = db.prepare(`
        SELECT
            dates.day AS day,
            appointments.time_range_id AS timeRangeId,
            time_ranges.start_time AS startTime,
            time_ranges.end_time AS endTime,
            (
                SELECT
                    COUNT(DISTINCT participants.id) from participants
                LEFT JOIN appointments ON appointments.id = participants.appointment_id
                WHERE appointments.time_range_id = time_ranges.id
            )
            AS occupied,
            time_ranges.capacity AS capacity,
            appointments.id AS appointmentId,
            appointments.phone_number AS phoneNumber,
            participants.id AS participantId,
            participants.last_name AS lastName,
            participants.first_name AS firstName,
            participants.is_adult AS isAdult,
            personnel_categories.abbreviation AS personnelCategoryAbbreviation
        FROM participants
        LEFT JOIN appointments ON appointments.id = participants.appointment_id
        LEFT JOIN personnel_categories on personnel_categories.id = participants.personnel_category_id
        LEFT JOIN time_ranges on time_ranges.id = appointments.time_range_id
        LEFT JOIN dates on dates.id = time_ranges.date_id
        WHERE time_ranges.date_id = ?
        ORDER BY 
            appointments.time_range_id ASC,
            appointments.id ASC,
            participants.id ASC`);

    statements['get_personnel_categories'] = db.prepare(`
        SELECT * from personnel_categories`);

    // user
    statements['get_user_dates'] = db.prepare(`
        SELECT 
            dates.id,
            dates.day,
            locations.display_name AS locationDisplayName,
            locations.lat AS latitude,
            locations.lon AS longitude,
            (
                SELECT COUNT(time_ranges.published) 
                FROM time_ranges
                WHERE 
                    time_ranges.date_id = dates.id AND
                    time_ranges.published = 1
            ) AS publishedTimeRanges
        FROM dates
        LEFT JOIN locations ON dates.location_id = locations.id
        WHERE publishedTimeRanges > 0`);

    statements['get_user_timeranges'] = db.prepare(`
        SELECT 
            time_ranges.id, 
            dates.id AS dateId, 
            time_ranges.capacity, 
            time_ranges.start_time AS startTime,
            time_ranges.end_time AS endTime,
            (
                SELECT
                    COUNT(DISTINCT participants.id) from participants
                LEFT JOIN appointments ON appointments.id = participants.appointment_id
                WHERE appointments.time_range_id = time_ranges.id
            ) AS occupied
        FROM time_ranges
        LEFT JOIN dates ON dates.id = time_ranges.date_id
        WHERE time_ranges.published = 1`);

    statements['get_user_timerange'] = db.prepare(`
        SELECT
            dates.id AS dateId, 
            time_ranges.capacity, 
            (
                SELECT
                    COUNT(DISTINCT participants.id) from participants
                LEFT JOIN appointments ON appointments.id = participants.appointment_id
                WHERE appointments.time_range_id = time_ranges.id
            ) AS occupied
        FROM time_ranges
        LEFT JOIN dates ON dates.id = time_ranges.date_id
        WHERE 
            time_ranges.published = 1 AND
            time_ranges.id = ?`);

    statements['get_page_id'] = db.prepare(`
        SELECT 
            appointments.page_id AS pageId
        FROM appointments
        WHERE appointments.page_id = ?`);

    statements['get_bookings_count'] = db.prepare(`
        SELECT COUNT (appointments.phone_number) AS count
        FROM appointments
        LEFT JOIN time_ranges ON time_ranges.id = appointments.time_range_id
        LEFT JOIN dates ON dates.id = time_ranges.date_id
        WHERE 
            appointments.phone_number = ?
            AND dates.id = ?`);

    statements['add_appointment'] = db.prepare(`
        INSERT INTO appointments(time_range_id, phone_number, page_id)
        VALUES (?, ?, ?)`);
    
    statements['add_participant'] = db.prepare(`
        INSERT INTO participants(appointment_id, first_name, last_name, is_adult, personnel_category_id)
        VALUES (?, ?, ?, ?, ?)`);

    statements['add_participants'] = db.transaction((appointmentId, participants) => {

        const insertParticipant = statements['add_participant'];

        if (insertParticipant) {

            for (const participant of participants) {

                const isAdult = 'adult' === participant.age ? 1 : 0;

                insertParticipant.run(
                    Number(appointmentId),
                    '' + participant?.firstName,
                    '' + participant?.lastName,
                    isAdult,
                    Number(participant?.personnelCategoryId),
                );

            }

        }

    });

    statements['add_message'] = db.prepare(`
        INSERT INTO messages(appointment_id, text)
        VALUES (?, ?)`);

    statements['get_appointment'] = db.prepare(`
        SELECT
            dates.day AS day,
            locations.display_name AS location,
            locations.lat AS latitude,
            locations.lon AS longitude,
            time_ranges.start_time AS startTime,
            time_ranges.end_time AS endTime,
            participants.id AS participantId,
            participants.last_name AS lastName,
            participants.first_name AS firstName,
            participants.is_adult AS isAdult,
            personnel_categories.name AS personnelCategoryName
        FROM participants
        LEFT JOIN appointments ON appointments.id = participants.appointment_id
        LEFT JOIN personnel_categories on personnel_categories.id = participants.personnel_category_id
        LEFT JOIN time_ranges ON time_ranges.id = appointments.time_range_id
        LEFT JOIN dates ON dates.id = time_ranges.date_id
        LEFT JOIN locations ON locations.id = dates.location_id
        WHERE
            time_ranges.published = 1 AND
            appointments.page_id = ?`);

    statements['delete_appointment'] = db.prepare(`
        DELETE FROM appointments
        WHERE appointments.page_id = ?`);

    // sms gateway
    statements['get_messages'] = db.prepare(`
        SELECT
            appointments.id AS appointmentId,
            appointments.phone_number AS phoneNumber,
            appointments.page_id AS pageId
        FROM appointments
        WHERE appointments.id > ?`);

} catch (err) {
    
    stmtError = err;

}

if (!stmtError) {

    // admin
    getSecret = (scope) => {

        let error = null, secret = null;

        try {

            secret = statements['get_secret'].get('' + scope);

        } catch (err) {

            error = err;

        }

        return secret?.value ?? '';

    };

    getCredentials = (username) => {

        let error = null, credentials = null;

        try {

            credentials = statements['get_credentials'].get('' + username);

        } catch (err) {

            error = err;

        }

        return credentials ?? null;

    };

    getProfile = (userName) => {

        let error, profile = null;

        try {

            profile = statements['get_profile'].get(userName);
            profile.url = `/api/admin/profiles/${profile.id}`;
            delete profile.id;

        } catch (err) {

            error = err;

        }

        return profile ?? null;

    };

    updateProfile = (profileId, fullName, phoneNumber) => {

        let error, updateInfo, profile = null;

        try {

            updateInfo = statements['update_profile'].run(
                '' + fullName,
                '' + phoneNumber,
                Number(profileId)
            );

        } catch (err) {

            error = err;

        } finally {

            if (!error) {

                profile = {

                    fullName,
                    phoneNumber,
                    url: `/api/admin/profiles/${profileId}`

                };

            }

        }

        return profile ?? null;

    };

    getLocations = () => {

        let error = null, locations = null;

        try {

            locations = statements['get_locations'].all();

        } catch (err) {

            error = err;

        }

        return locations ?? null;

    }

    addLocation = (placeId, osmId, name, displayName, lon, lat) => {

        let error, updateInfo, location = null;

        try {

            updateInfo = statements['add_location'].run(
                Number(placeId),
                Number(osmId),
                '' + lat,
                '' + lon,
                '' + displayName,
                '' + name
            );

        } catch (err) {

            error = err;

        } finally {

            if (!error && 1 === updateInfo.changes) {

                location = {

                    id: updateInfo.lastInsertRowid,
                    placeId,
                    osmId,
                    name,
                    displayName,
                    lon,
                    lat,

                };

            }

        }

        return location ?? null;

    };

    deleteLocation = (locationId) => {

        let error, updateInfo;

        try {

            updateInfo = statements['delete_location'].run(
                Number(locationId)
            );

        } catch (err) {

            error = err;

        }

        if (!error) {

            if (1 === updateInfo.changes) {

                return 1;

            }

            return 0;

        }

        return -1;

    };

    getDates = () => {

        let error = null, dates = null;

        try {

            dates = statements['get_dates'].all();

            if (dates && dates.length) {

                for (let i = 0, n = dates.length; i < n; ++i) {

                    dates[i] = [dates[i].day, dates[i]];

                }

            }

        } catch (err) {

            error = err;

        }

        return dates ?? null;

    };

    addDate = (locationId, day) => {

        let error, updateInfo, date = null;

        try {

            updateInfo = statements['add_date'].run(
                Number(locationId),
                '' + day
            );

        } catch (err) {

            error = err;

        } finally {

            if (!error && 1 === updateInfo.changes) {

                date = {

                    id: updateInfo.lastInsertRowid,
                    locationId,
                    day

                };

            }

        }

        return date ?? null;

    };

    updateDate = (dateId, locationId, day) => {

        let error, updateInfo, date = null;

        try {

            updateInfo = statements['update_date'].run(
                Number(locationId),
                '' + day,
                Number(dateId)
            );

        } catch (err) {

            error = err;

        } finally {

            if (!error) {

                date = {

                    id: dateId,
                    locationId,
                    day,

                };

            }

        }

        return date ?? null;

    };

    deleteDate = (dateId) => {

        let error, updateInfo;

        try {

            updateInfo = statements['delete_date'].run(
                Number(dateId)
            );

        } catch (err) {

            error = err;

        }

        if (!error) {

            if (1 === updateInfo.changes) {

                return 1;

            }

            return 0;

        }

        return -1;

    };

    getTimeRanges = () => {

        let error = null, timeRanges = null;

        try {

            timeRanges = statements['get_timeranges'].all();

            for (let i = 0, t = timeRanges.length; i < t; ++i) {

                timeRanges[i].published = Boolean(timeRanges[i].published);

            }

        } catch (err) {

            error = err;

        }

        return timeRanges ?? null;

    };

    addTimeRange = (dateId, startTime, endTime, capacity, published ) => {

        let error, updateInfo, timeRange = null;

        try {

            updateInfo = statements['add_timerange'].run(
                Number(dateId),
                '' + startTime,
                '' + endTime,
                Number(capacity),
                Number(published),
            );

        } catch (err) {

            error = err;

        } finally {

            if (!error && 1 === updateInfo.changes) {

                timeRange = {

                    id: updateInfo.lastInsertRowid,
                    dateId: Number(dateId), 
                    startTime, 
                    endTime, 
                    capacity: Number(capacity), 
                    published

                };

            }

        }

        return timeRange ?? null;

    };

    updateTimeRange = (timeRangeId, dateId, startTime, endTime, capacity, published) => {

        let error, updateInfo, timeRange = null;

        try {

            updateInfo = statements['update_timerange'].run(
                Number(dateId),
                '' + startTime,
                '' + endTime,
                Number(capacity),
                Number(published),
                Number(timeRangeId)
            );

        } catch (err) {

            error = err;

        } finally {

            if (!error) {

                timeRange = {

                    id: Number(timeRangeId),
                    dateId: Number(dateId),
                    startTime: '' + startTime,
                    endTime: '' + endTime,
                    capacity: Number(capacity),
                    published: Boolean(published),

                };

            }

        }

        return timeRange ?? null;

    };

    deleteTimeRange = (timeRangeId) => {

        let error, updateInfo;

        try {

            updateInfo = statements['delete_timerange'].run(
                Number(timeRangeId)
            );

        } catch (err) {

            error = err;

        }

        if (!error) {

            if (1 === updateInfo.changes) {

                return 1;

            }

            return 0;

        }

        return -1;

    };

    getAppointments = () => {

        let error = null, _appointments = null, appointments = new Map(), result = null;

        try {

            _appointments = statements['get_appointments'].all();

            for (let i = 0, a = _appointments.length; i < a; ++i) {
                
                const appointment = appointments.get(_appointments[i].appointmentId);

                if (!appointment) {
                    
                    const ref = Object.create(null);
                    ref.timeRangeId = _appointments[i].timeRangeId;
                    ref.appointmentId = _appointments[i].appointmentId;
                    ref.phoneNumber = _appointments[i].phoneNumber;
                    ref.participants = [];

                    const participant = Object.create(null);

                    participant.participantId = _appointments[i].participantId;
                    participant.lastName = _appointments[i].lastName;
                    participant.firstName =_appointments[i].firstName;
                    participant.isAdult = Boolean(_appointments[i].isAdult);
                    participant.personnelCategoryId = _appointments[i].personnelCategoryId;
                    participant.personnelCategoryAbbreviation = _appointments[i].personnelCategoryAbbreviation;

                    ref.participants.push(participant);

                    appointments.set(_appointments[i].appointmentId, ref);

                } else {

                    const participant = Object.create(null);
                    
                    participant.participantId = _appointments[i].participantId;
                    participant.lastName = _appointments[i].lastName;
                    participant.firstName =_appointments[i].firstName;
                    participant.isAdult = Boolean(_appointments[i].isAdult);
                    participant.personnelCategoryId = _appointments[i].personnelCategoryId;
                    participant.personnelCategoryAbbreviation = _appointments[i].personnelCategoryAbbreviation;

                    appointment.participants.push(participant);

                    appointments.set(_appointments[i].appointmentId, appointment);

                }

            }

            result = Array.from(appointments.values());

        } catch (err) {

            error = err;

        }

        return result ?? null;

    };

    exportDate = (dateId) => {

        let day = null, timeRanges = new Map(), _appointments = null, result = null,
        row = 0, col = 0;

        /**
         * the relevant query is statements['export_data'], which expects a date ID
         * TODO: get the data; timeRanges is a Map, key is timeRangeId, value is startTime, endTime and appointments,
         * which is also a Map, key is appointmentId, value is phoneNumber and participants,
         * which is an array containing each participant 
         * (participantId, lastName, firstName, isAdult {mapped to one of ['minor', 'adult']}, personnelCategoryAbbreviation);
         * 
         * the rows will be created from this data structure and the merged rows and columns will be calculated on creation
         * 4 rows: nume, prenume; adult/minor; pt. [personnelCategoryAbbreviation]; numar de telefon
         */

        try {

            _appointments = statements['export_date'].all(
                Number(dateId)
            );

            if (_appointments && _appointments.length) {

                day = _appointments[0].day;
                result = Object.create(null);
                result.rows = [];
                result.cellMerges = [];
                result.error = false;

                result.rows.push({
                    c1: day,
                    c2: '',
                    c3: '',
                    c4: ''
                });

                result.cellMerges.push({
                    s: { r: row, c: 0 }, e: { r: row, c: 3 }
                });

                row += 1;

            }

            for (let i = 0, a = _appointments.length; i < a; ++i) {
                
                const timeRange = timeRanges.get(_appointments[i].timeRangeId);

                _appointments[i].isAdult = _appointments[i].isAdult ? 'adult' : 'minor';

                if (!timeRange) {

                    result.rows.push({
                        c1: '',
                        c2: '',
                        c3: '',
                        c4: ''
                    });
    
                    row += 1;

                    const t = Object.create(null);
                    t.timeRangeId = _appointments[i].timeRangeId;
                    t.startTime = _appointments[i].startTime;
                    t.endTime = _appointments[i].endTime;
                    t.occupied = _appointments[i].occupied;
                    t.capacity = _appointments[i].capacity;

                    t.appointments = new Map();
                    const a = Object.create(null);
                    a.appointmentId = _appointments[i].appointmentId;
                    a.phoneNumber = _appointments[i].phoneNumber;
                    a.participants = [];
                    
                    const p = Object.create(null);
                    p.participantId = _appointments[i].participantId;
                    p.lastName = _appointments[i].lastName;
                    p.firstName = _appointments[i].firstName;
                    p.isAdult = _appointments[i].isAdult ? 'adult' : 'minor';
                    p.personnelCategoryAbbreviation = _appointments[i].personnelCategoryAbbreviation;

                    a.participants.push(p);

                    t.appointments.set(_appointments[i].appointmentId, a);

                    timeRanges.set(_appointments[i].timeRangeId, t);

                    result.rows.push({
                        c1: `${t.startTime} - ${t.endTime}`,
                        c2: '',
                        c3: `total: ${t.occupied} / ${t.capacity}`,
                        c4: '',
                    });
    
                    result.cellMerges.push({
                        s: { r: row, c: 0 }, e: { r: row, c: 1 },
                    }, {
                        s: { r: row, c: 2 }, e: { r: row, c: 3 },
                    });
    
                    row += 1;

                    result.rows.push({
                        c1: `${_appointments[i].lastName} ${_appointments[i].firstName}`,
                        c2: `${_appointments[i].isAdult}`,
                        c3: `pt. ${_appointments[i].personnelCategoryAbbreviation}`,
                        c4: `${_appointments[i].phoneNumber}`,
                    });

                    row += 1;

                } else {

                    const appointment = timeRange.appointments.get(_appointments[i].appointmentId);

                    if (!appointment) {
                        
                        const a = Object.create(null);
                        a.appointmentId = _appointments[i].appointmentId;
                        a.phoneNumber = _appointments[i].phoneNumber;
                        a.participants = [];
                        
                        const p = Object.create(null);
                        p.participantId = _appointments[i].participantId;
                        p.lastName = _appointments[i].lastName;
                        p.firstName = _appointments[i].firstName;
                        p.isAdult = _appointments[i].isAdult ? 'adult' : 'minor';
                        p.personnelCategoryAbbreviation = _appointments[i].personnelCategoryAbbreviation;
    
                        a.participants.push(p);

                        timeRange.appointments.set(_appointments[i].appointmentId, a);
    
                        result.rows.push({
                            c1: `${_appointments[i].lastName} ${_appointments[i].firstName}`,
                            c2: `${_appointments[i].isAdult}`,
                            c3: `pt. ${_appointments[i].personnelCategoryAbbreviation}`,
                            c4: `${_appointments[i].phoneNumber}`,
                        });
    
                        row += 1;

                    } else {

                        const p = Object.create(null);
                        p.participantId = _appointments[i].participantId;
                        p.lastName = _appointments[i].lastName;
                        p.firstName = _appointments[i].firstName;
                        p.isAdult = _appointments[i].isAdult ? 'adult' : 'minor';
                        p.personnelCategoryAbbreviation = _appointments[i].personnelCategoryAbbreviation;
    
                        appointment.participants.push(p);

                        timeRange.appointments.set(_appointments[i].appointmentId, appointment);
    
                        result.rows.push({
                            c1: `${_appointments[i].lastName} ${_appointments[i].firstName}`,
                            c2: `${_appointments[i].isAdult}`,
                            c3: `pt. ${_appointments[i].personnelCategoryAbbreviation}`,
                            c4: `${_appointments[i].phoneNumber}`,
                        });

                        result.cellMerges.push({
                            s: { r: row - 1, c: 3 }, e: { r: row, c: 3 }
                        });
    
                        row += 1;

                    }

                }

            }

        } catch (err) {
            console.log(err)
            result.error = Boolean(err);

        }

        //console.log(result.rows)

        return result ?? null;

    }

    getPersonnelCategories = () => {

        let error = null, personnelCategories = null;

        try {

            personnelCategories = statements['get_personnel_categories'].all();

        } catch (err) {

            error = err;

        }

        return personnelCategories ?? null;

    };

    // user
    getUserDates = () => {

        let error = null, dates = null;

        try {

            dates = statements['get_user_dates'].all();

            if (dates && dates.length) {

                for (let i = 0, n = dates.length; i < n; ++i) {

                    dates[i] = [dates[i].day, dates[i]];

                }

            }

        } catch (err) {

            error = err;

        }

        return dates ?? null;

    };

    getUserTimeRanges = () => {

        let error = null, timeRanges = null;

        try {

            timeRanges = statements['get_user_timeranges'].all();

        } catch (err) {

            error = err;

        }

        return timeRanges ?? null;

    };

    getContactInfo = () => {

        const contactInfo = getProfile('admin');

        if (contactInfo && contactInfo.url) {

            delete contactInfo.url;

        }

        return contactInfo;

    };

    getPageId = (pageId) => {

        let error = null, data = null;
        let result = Object.create(null, {
            pageId: {
                value: null,
                writable: true,
                configurable: false,
                enumerable: true
            },
            error: {
                value: false,
                writable: true,
                configurable: false,
                enumerable: true
            },
        });

        

        try {

            data = statements['get_page_id'].get(
                '' + pageId
            );

        } catch (err) {

            error = err;
            result.error = true;

        }

        if (!error) {

            if (data && data?.pageId) {

                result.pageId = data.pageId;

            }

        }

        return result;
        

    };

    addAppointment = (timeRangeId, phoneNumber, pageId, participants) => {

        let error = null, bookings, appointmentsUpdateInfo, timeRange = null, result = { error: false, timeRangeIsFull: false, alreadyBooked: false };

        try {

            timeRange = statements['get_user_timerange'].get(Number(timeRangeId));

        } catch (err) {

            error = err;

        }

        if (!error && timeRange) {
            
            try {

                bookings = statements['get_bookings_count'].get(
                    '' + phoneNumber,
                    Number(timeRange?.dateId),
                );

            } catch (err) {

                error = err;

            }
            console.log({bookings})
            if (!error && bookings && !isNaN(bookings?.count)) {

                if (0 === bookings.count) {

                    const props = Object.getOwnPropertyNames(timeRange);

                    if (props.includes('capacity') && props.includes('occupied')) {

                        if (timeRange.occupied < timeRange.capacity) {

                            try {

                                appointmentsUpdateInfo = statements['add_appointment'].run(
                                    Number(timeRangeId),
                                    '' + phoneNumber,
                                    '' + pageId,
                                );
                    
                            } catch (err) {
                    
                                error = err;
                    
                            }
                    
                            if (!error && 1 === appointmentsUpdateInfo.changes) {

                                const insertParticipants = statements['add_participants'];

                                if (insertParticipants) {

                                    const appointmentId = appointmentsUpdateInfo.lastInsertRowid;

                                    try {

                                        try {
                        
                                            insertParticipants(appointmentId, participants);
                        
                                        } catch (err) {
                            
                                            error = err;

                                            if (!db.inTransaction) throw err; // the transaction was forcefully rolled back
                            
                                        }

                                    } catch (err) {

                                        error = err;

                                    }

                                    if (!error) {

                                        result.error = false;
                                        result.timeRangeIsFull = false;
                                        result.alreadyBooked = false;

                                    } else {

                                        result.error = true;
                                        result.timeRangeIsFull = false;
                                        result.alreadyBooked = false;

                                    }

                                } else {

                                    result.error = true;
                                    result.timeRangeIsFull = false;
                                    result.alreadyBooked = false;

                                }
                    
                            } else {

                                result.error = true;
                                result.timeRangeIsFull = false;
                                result.alreadyBooked = false;

                            }

                        } else {

                            result.error = false;
                            result.timeRangeIsFull = true;
                            result.alreadyBooked = false;

                        }

                    } else {

                        result.error = true;
                        result.timeRangeIsFull = false;
                        result.alreadyBooked = false;

                    }

                } else {

                    result.error = false;
                    result.timeRangeIsFull = false;
                    result.alreadyBooked = true;

                }

            } else {

                result.error = true;
                result.timeRangeIsFull = false;
                result.alreadyBooked = false;

            }

        } else {

            result.error = true;
            result.timeRangeIsFull = false;
            result.alreadyBooked = false;

        }

        return result;

    };

    getUserAppointment = (pageId) => {

        let error = null, _appointments = null, result = null;

        const contactInfo = getContactInfo();

        try {

            _appointments = statements['get_appointment'].all(
                '' + pageId
            );

            if (_appointments && _appointments.length) {

                result = {
                    day: _appointments[0].day,
                    location: _appointments[0].location,
                    latitude: _appointments[0].latitude,
                    longitude: _appointments[0].longitude,
                    startTime: _appointments[0].startTime,
                    endTime: _appointments[0].endTime,
                    participants: [],
                    contactPhone: contactInfo?.phoneNumber,
                };

            }

            for (let i = 0, a = _appointments.length; i < a; ++i) {
                
                const participant = {
                    id: _appointments[i].participantId,
                    lastName: replaceFrom(_appointments[i].lastName, 1, '*'),
                    firstName: _appointments[i].firstName,
                    age: _appointments[i].isAdult ? 'adult' : 'minor',
                    personnelCategoryName: _appointments[i].personnelCategoryName
                };

                result.participants.push(participant);

            }

        } catch (err) {

            error = err;

        }

        return result ?? null;

    };

    deleteUserAppointment = (pageId) => {

        let error, updateInfo;

        try {

            updateInfo = statements['delete_appointment'].run(
                '' + pageId
            );

        } catch (err) {

            error = err; console.log(err)

        }

        if (!error) {

            if (1 === updateInfo.changes) {

                return 1;

            }

            return 0;

        }

        return -1;

    };

    // sms gateway
    getMessages = (fromAppointmentId) => {

        let error = null, messages = null;

        const fromId = isNaN(fromAppointmentId) ? 0 : Number(fromAppointmentId);

        try {

            messages = statements['get_messages'].all(fromId);

        } catch (err) {

            error = err;

        }

        return messages ?? null;

    };

}

export {

    // admin
    getSecret,
    getCredentials,
    getProfile,
    updateProfile,
    addLocation,
    deleteLocation,
    getLocations,
    getDates,
    addDate,
    updateDate,
    deleteDate,
    getTimeRanges,
    addTimeRange,
    updateTimeRange,
    deleteTimeRange,
    getAppointments,
    exportDate,
    getPersonnelCategories,

    // user
    getUserDates,
    getUserTimeRanges,
    getContactInfo,
    getPageId,
    addAppointment,
    getUserAppointment,
    deleteUserAppointment,

    // sms gateway
    getMessages,

};