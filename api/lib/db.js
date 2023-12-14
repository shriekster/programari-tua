const path = require('node:path');
const Database = require('better-sqlite3');

let db = null, dbOpenError = null;
const dbFilePath = path.resolve(__dirname, '../data/tua.db');

let stmtError = null;
const statements = {};

let _getSecret = null;
let _getCredentials = null;

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


} catch (err) {
    
    stmtError = err;

}

if (!stmtError) {

    _getSecret = (scope) => {

        let error = null, secret = null;

        try {

            secret = statements['get_secret'].get('' + scope); console.log(secret)

        } catch (err) {

            error = err;

        }

        return {
            error,
            data: {
                secret
            }
        };

    }

}

module.exports = {

    getSecret: function (scope) { _getSecret?.(scope) },

}