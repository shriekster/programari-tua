import path from 'node:path';
import Database from 'better-sqlite3';

let db = null, dbOpenError = null;
const dbFilePath = path.resolve(process.cwd(), './data/sms.db');

let stmtError = null;
const statements = {};

// sms gateway
let insertMessages = null;
let markMessageAsSent = null;
let markMessageAsSynced = null;
let getUnsentMessages = null;
let getUnsyncedMessages = null;


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
    statements['insert_message'] = db.prepare(`
        INSERT INTO messages(id, recipient, text)
        VALUES (?, ?, ?)`);

    statements['insert_messages'] = db.transaction((messages) => {

        const insertMessage = statements['insert_message'];

        if (insertMessage) {

            for (const message of messages) {

                insertMessage.run(
                    Number(message.id),
                    '' + message.recipient,
                    '' + message.text,
                );

            }

        }

    });

    statements['mark_message_as_sent'] = db.prepare(`
        UPDATE messages
        SET
            sent = 1,
            sent_at = (strftime('%d.%m.%Y %H:%M:%f', 'now', 'localtime'))
        WHERE
            id = ?`);

    statements['mark_message_as_synced'] = db.prepare(`
        UPDATE messages
        SET
            synced = 1
        WHERE
            id = ?`);

    statements['get_unsent_messages'] = db.prepare(`
        SELECT id, recipient, text
        FROM messages
        WHERE sent = 0`);

    statements['get_unsynced_messages'] = db.prepare(`
        SELECT 
            id, recipient, text, sent,
            sent_at AS sentAt
        FROM messages
        WHERE 
            sent = 1 AND
            synced = 0`);

} catch (err) {
    
    stmtError = err; console.log(err)

}

if (!stmtError) {

    insertMessages = (messages) => {

        let error = false;

        try {

            try {

                const insertMany = statements['insert_messages'];

                if (insertMany) {

                    insertMany(messages);

                } else {

                    throw new Error('Transaction does not exist!');

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

    markMessageAsSent = (messageId) => {

        let error = false, updateInfo = null;

        try {

            updateInfo = statements['mark_message_as_sent'].run(
                Number(messageId),
            );

        } catch (err) {

            error = Boolean(err);

        }

        return {
            error
        };

    };

    markMessageAsSynced = (messageId) => {

        let error = false, updateInfo = null;

        try {

            updateInfo = statements['mark_message_as_synced'].run(
                Number(messageId),
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

    getUnsyncedMessages = () => {

        let error = null, messages = null;

        try {

            messages = statements['get_unsynced_messages'].all();

        } catch (err) {

            error = err;

        }

        return messages ?? null;

    };

}

export {

    // sms gateway
    insertMessages,
    markMessageAsSent,
    markMessageAsSynced,
    getUnsentMessages,
    getUnsyncedMessages,

};