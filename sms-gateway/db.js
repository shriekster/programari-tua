import path from 'node:path';
import Database from 'better-sqlite3';

let db = null, dbOpenError = null;
const dbFilePath = path.resolve(process.cwd(), './data/sms.db');

let stmtError = null;
const statements = {};

// sms gateway
let getMaxMessageId = null;
let insertMessages = null;
let updateMessage = null;
let getUnsentMessages = null;


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

    // sms gateway
    statements['get_last_message_id'] = db.prepare(`
        SELECT MAX(messages.appointment_id) AS maxId
        FROM messages`);

    statements['get_messages'] = db.prepare(`
        SELECT
            phone_number AS phoneNumber,
            page_id AS pageId
        FROM messages`);

    /*
    statements['insert_message'] = db.prepare(`
        INSERT INTO messages(appointment_id, phone_number, page_id)
        VALUES (?, ?, ?)`);
    */
    statements['insert_message'] = db.prepare(`
        INSERT INTO messages(phone_number, page_id)
        VALUES (?, ?)`);

    /*
    statements['insert_messages'] = db.transaction((messages) => {

        const insertMessage = statements['insert_message'];

        if (insertMessage) {

            for (const message of messages) {

                insertMessage.run(
                    Number(message.appointmentId),
                    '' + message.phoneNumber,
                    '' + message.pageId,
                );

            }

        }

    });
    */
    statements['insert_messages'] = db.transaction((messages) => {

        const insertMessage = statements['insert_message'];

        if (insertMessage) {

            for (const message of messages) {

                insertMessage.run(
                    '' + message.phoneNumber,
                    '' + message.pageId,
                );

            }

        }

    });

    /*
    statements['get_unsent_messages'] = db.prepare(`
        SELECT
            appointment_id AS appointmentId,
            phone_number AS phoneNumber,
            page_id AS pageId
        FROM messages
        WHERE sent = 0`);
    */

    statements['get_unsent_messages'] = db.prepare(`
        SELECT
            phone_number AS phoneNumber,
            page_id AS pageId
        FROM messages
        WHERE sent = 0`);

    statements['update_message'] = db.prepare(`
        UPDATE messages
        SET
            sent = ?
        WHERE
            page_id = ?`);

} catch (err) {
    
    stmtError = err;

}

if (!stmtError) {

    getMaxMessageId = () => {

        let error = null, data = null;

        try {

            data = statements['get_last_message_id'].get();

        } catch (err) {

            error = err;

        } 

        return data?.maxId ?? 0;

    };

    insertMessages = (messages) => {

        let error = false, _currentMessages, currentMessages = new Map();

        try {

            try {

                _currentMessages = statements['get_messages'].all(); // 

                for (let i = 0, l = currentMessages.length; i < l; ++i) { //

                    currentMessages.set(_currentMessages[i].pageId, _currentMessages[i]); //

                } //

                const filteredMessages = messages.filter((message) => !currentMessages.has(message.pageId)); //

                const insertMany = statements['insert_messages'];

                if (insertMany) {

                    //insertMany(messages);
                    insertMany(filteredMessages);

                } else {

                    throw new Error('Transaction does not exist!')

                }


            } catch (err) {

                error = Boolean(err);

                if (!db.inTransaction) throw err; // the transaction was forcefully rolled back

            }

        } catch (err) {

            error = Boolean(err);

        }

        return {
            error
        };

    };

    updateMessage = (pageId, sent) => {

        let error = false, updateInfo = null;

        try {

            updateInfo = statements['update_message'].run(
                Number(sent),
                '' + pageId
            );

        } catch (err) {

            error = Boolean(err);

        }

        return {
            error
        };

    };

    getUnsentMessages = () => {

        let error = null, messages = null;

        try {

            messages = statements['get_unsent_messages'].all();

        } catch (err) {

            error = err;

        }

        return messages ?? null;

    };

}

export {

    // sms gateway
    getMaxMessageId,
    insertMessages,
    updateMessage,
    getUnsentMessages,

};