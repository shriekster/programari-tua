import rpio from 'rpio';
import gsm from 'serialport-gsm';
import 'dotenv/config';

import { 
    insertMessages,
    markMessageAsSent,
    markMessageAsSynced,
    getUnsentMessages,
    getUnsyncedMessages, 
} from './db.js';

const baseUrl = process.env.BASE_URL;
const apiKey = process.env.API_KEY;

/**
 * NB! The modem will always open successfully, so we must try to initialize it in order to 
 * check the power state
 */

const modem = gsm.Modem();

const options = {
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    rtscts: false,
    xon: false,
    xoff: false,
    xany: false,
    autoDeleteOnReceive: true,
    enableConcatenation: false,
    incomingCallIndication: false,
    incomingSMSIndication: true,
    pin: '',
    customInitCommand: '',
    cnmiCommand: 'AT+CNMI=2,1,0,2,1',
    //logger: console
};

let timeoutId, modemIsAvailable;

async function getPort() {

    return new Promise(resolve => {

        let error = null, port = null;

        gsm.list((err, result) => {
            
            try {

                const device = result.find(dev => dev.path.startsWith('/dev/ttyUSB'));
                port = device.path;

            } catch (err) {

                error = err;

            }

            resolve(port);

        });
        

    });

}

async function openModem(path) {

    return new Promise(resolve => {

        console.log('Opening modem...');

        modem.open(path, options, (error, result) => {
            
            if (error) {

                console.log('Error opening modem:\n', error);

                resolve(false);

            } else {

                console.log('Modem opening operation result:', result);
                resolve(result);

            }

        });

    })

}

async function closeModem() {

    return new Promise(resolve => {

        console.log('Closing modem...');

        modem.close((error, result) => {
            
            if (error) {

                console.log('Error closing modem:\n', error);

                resolve(false);

            } else {

                console.log('Modem closing operation result:', result);
                resolve(result);

            }

        });

    })

}

async function initializeModem() {

    return new Promise(resolve => {

        modem.initializeModem(result => {

            if (result) {

                resolve(result);

            } else {

                resolve(false);

            }

        });

    });

}

async function checkModem() {

    return new Promise(resolve => {

        modem.checkModem((result, error) => {

            resolve({result, error})

        })

    });

}

async function tryPowerToggle () {

     return new Promise(resolve => {

        let toggled = true;

        try {

            rpio.open(7, rpio.OUTPUT, rpio.LOW);
            rpio.write(7, rpio.LOW);
            rpio.sleep(4);
            rpio.write(7, rpio.HIGH);

        } catch {

            toggled = false;

        } finally {

            resolve(toggled);

        }

    })

}

async function powerOn() {

    console.log('Powering on...');

    let path = await getPort();

    let opened = await openModem(path);

    while (!opened) {

        //await closeModem();

        await tryPowerToggle();

        path = await getPort();

        opened = await openModem(path);

    }

}

async function bootstrap() {

    return new Promise(async (resolve) => {

        let initialized = await initializeModem();

        while (!initialized) {

            await closeModem();
            
            await powerOn();

            initialized = await initializeModem();
             

        }

        const checkResult = await checkModem();
            
        if (checkResult?.result && !checkResult?.error && 'success' === checkResult.result?.status) {

            resolve(true);

        } else {

            resolve(false);

        }

    });

}

async function sendMessages(messages) {

    console.log(`${messages.length} unsent messages, sending...`);

    for (let i = 0, m = messages.length; i < m; ++i) {

        const result = await new Promise(resolve => {

            let count = 0;

            modem.sendSMS(
                messages[i].recipient,
                messages[i].text,
                false,
                (result) => {
                    
                    ++count;
    
                    if (2 === count) {

                        resolve(result);

                    }
            
                }
            )
        });

        if (result && result?.status && 'success' === result.status) {

            markMessageAsSent(messages[i].id);
            console.log('Successfully sent message with id', messages[i]?.id, ' to ', messages[i].recipient);

        }

    }

}

async function syncMessage(message) {

    return new Promise(async (resolve) => {

        console.log('Syncing message with id', message?.id);

        let error = null, status = 401;

        try {

            const requestOptions = {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: message.id,
                    sent: message.sent,
                    sentAt: message.sentAt
                }),
            };

            const url = `${baseUrl}/api/sms/messages/${message.id}/?apiKey=${apiKey}`;

            const response = await fetch(url, requestOptions);
            status = response.status;


        } catch (err) {

            // eslint-disable-next-line no-unused-vars
            error = err;
            status = 400; // client-side error

        }

        if (200 === status) {

            resolve(true);

        } else {

            resolve(false);

        }

    });

}

async function syncMessages(messages) {

    console.log(`${messages.length} unsynced messages, syncing...`);

    for (let i = 0, m = messages.length; i < m; ++i) {

        const synced = await syncMessage(messages[i]);

        if (synced) {

            markMessageAsSynced(messages[i].id);

        }

    }

}

const fetchUnsentMessages = async () => { 

    return new Promise(async (resolve) => {

        console.log('Fetching messages...');

        let error = null, status = 401, messages = null;

        try {

            const url = `${baseUrl}/api/sms/?apiKey=${apiKey}`;

            const response = await fetch(url);
            status = response.status;
            
            const json = await response.json();
            messages = json?.data ?? [];


        } catch (err) {

            // eslint-disable-next-line no-unused-vars
            error = err;
            status = 400; // client-side error

        }

        if (200 === status) {

            console.log('Got', messages.length, 'messages.');

            if (messages?.length) {

                console.log('Updating the database...');

                const result = insertMessages(messages);

                if (result && !result?.error) {

                    console.log('Database updated.');

                }

            }

            resolve(true);

        } else {

            resolve(false);

        }

    });

};

async function run() {

    console.log('Running...');

    await powerOn();

    modemIsAvailable = await bootstrap();
    
    if (modemIsAvailable) {

        console.log('Modem available!');

        const unsyncedMessages = getUnsyncedMessages();

        if (unsyncedMessages && unsyncedMessages.length) {

            await syncMessages(unsyncedMessages);

        }

        const unsentMessages = getUnsentMessages();

        if (unsentMessages && unsentMessages.length) {

            await sendMessages(unsentMessages);

        }

        await fetchUnsentMessages();

        console.log('Scheduling new run in 30 seconds.');

        timeoutId = setTimeout(() => {

            clearTimeout(timeoutId);
            
            run();

        }, 30000);

    } else {

        console.log('Modem not available!');

        modemIsAvailable = await bootstrap();
        

    }

}


run();
