import path from 'node:path';
import Database from 'better-sqlite3';

let db = null, dbOpenError = null;
const dbFilePath = path.resolve(process.cwd(), './data/tua.db');

let stmtError = null;
const statements = {};

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
            time_ranges.end_time AS endTime 
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

    // TODO!
    statements['get_appointments'] = db.prepare(`
        SELECT 
            appointments.id,
            time_ranges.id AS timeRangeId,
            appointments.phone_number AS phoneNumber
        FROM appointments
        LEFT JOIN time_ranges ON time_ranges.id = appointments.time_range_id`);

    statements['get_participants'] = db.prepare(`
        SELECT 
            participants.id,
            appointments.id AS appointmentId,
            participants.last_name AS lastName,
            participants.first_name AS firstName,
            participants.is_owner AS isOwner,
            participants.is_participant AS isParticipant,
            participants.is_adult AS isAdult,
            personnel_categories.id AS personnelCategoryId,
            personnel_categories.abbreviation AS personnelCategoryAbbreviation
        FROM participants
        LEFT JOIN appointments ON appointments.id = participants.appointment_id
        LEFT JOIN personnel_categories on personnel_categories.id = participants.personnel_category_id`);

    


} catch (err) {
    
    stmtError = err;

}

if (!stmtError) {

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

    };

    getAppointments = () => {

        let error = null, appointments = null;

        try {

            appointments = statements['get_appointments'].all();

        } catch (err) {

            error = err;

        }

        return appointments ?? null;

    };

}

export {

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
    getAppointments

};