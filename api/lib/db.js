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
        SELECT id, phone_number AS phoneNumber
        FROM users
        WHERE username = ?`);

    statements['update_profile'] = db.prepare(`
        UPDATE users
        SET phone_number = ?
        WHERE id = ?`);


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

    getProfile = (userId) => {

        let error, profile = null;

        try {

            profile = statements['get_profile'].get(userId);
            profile.url = `/api/admin/profiles/${profile.id}`;
            delete profile.id;

        } catch (err) {

            error = err;

        }

        return profile ?? null;

    };

    updateProfile = (profileId, phoneNumber) => {

        let error, updateInfo, profile = null;

        try {

            updateInfo = statements['update_profile'].run(
                '' + phoneNumber,
                Number(profileId)
            );

        } catch (err) {

            error = err;

        } finally {

            if (!error) {

                profile = {

                    phoneNumber,

                };

            }

        }

        return profile ?? null;

    };

}

export {

    getSecret,
    getCredentials,
    getProfile,
    updateProfile

};