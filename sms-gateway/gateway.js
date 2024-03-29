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
const interval = 15; // seconds

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

    if (!opened) {

        await tryPowerToggle();

        path = await getPort();

        opened = await openModem(path);

    }

}

async function bootstrap() {

    return new Promise(async (resolve) => {

        let initialized = await initializeModem();

        if (initialized) {

            const checkResult = await checkModem();
                
            if (checkResult?.result && !checkResult?.error && 'success' === checkResult.result?.status) {

                resolve(true);

            } else {

                resolve(false);

            }

        } else {

            resolve(false);

        }

    });

}

async function sendMessages(messages) {

    return new Promise(async (resolve) => {

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

                console.log(`Successfully sent message with id ${messages[i]?.id} to ${messages[i]?.recipient}, updating the local database...`);

                let markedAsSent = markMessageAsSent(messages[i]?.id);
                
                if (!markedAsSent?.error) {

                    console.log('Successfully updated the local database.');

                }

            }

        }

        resolve();

    });

}

async function syncMessage(message) {

    return new Promise(async (resolve) => {

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

    return new Promise(async (resolve) => {

        console.log(`${messages.length} unsynced messages, syncing...`);

        for (let i = 0, m = messages.length; i < m; ++i) {

            console.log('Syncing message with id', messages[i]?.id);

            const synced = await syncMessage(messages[i]);

            if (synced) {

                console.log('Synced successfully, updating the local database...');

                let markedAsSynced = markMessageAsSynced(messages[i].id);

                if (!markedAsSynced?.error) {

                    console.log('Successfully updated the local database.');

                }

            }

        }

        resolve();

    });

}

async function fetchUnsentMessages() { 

    return new Promise(async (resolve) => {

        console.log('Fetching remote (unsent) messages...');

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

            let lastWord = 1 === messages?.length ? 'message' : 'messages';

            console.log(`Fetched ${messages?.length} ${lastWord}.`);

            if (messages?.length) {

                console.log('Adding the new messages to the local database...');

                const result = insertMessages(messages);

                if (result && !result?.error) {

                    console.log('The new messages were added successfully.');

                }

            }

            resolve(true);

        } else {

            resolve(false);

        }

    });

}

async function exchangeMessages() {

    return new Promise(async (resolve) => {

        console.log('Exchanging messages...');

        if (modemIsAvailable) {

            console.log('Modem available!');

            await fetchUnsentMessages();

            const unsentMessages = getUnsentMessages();
    
            if (unsentMessages && unsentMessages.length) {
    
                await sendMessages(unsentMessages);
    
            } else {

                console.log('All the local messages have been sent.');

            }

            const unsyncedMessages = getUnsyncedMessages();

            if (unsyncedMessages && unsyncedMessages.length) {
    
                await syncMessages(unsyncedMessages);
    
            } else {

                console.log('All the local messages have been synced.');

            }

        } else {

            console.log('Modem not available, powering on...');

            await powerOn();

            console.log('Powered on, bootstrapping...');
    
            modemIsAvailable = await bootstrap();

        }

        console.log(`Scheduling new message exchange in ${interval} seconds.`);
    
        timeoutId = setTimeout(async () => {

            clearTimeout(timeoutId);

            await exchangeMessages();

        }, interval * 1000);

        resolve();

    });

}



async function run() {

    console.log('Running...');

    await powerOn();

    modemIsAvailable = await bootstrap();

    await exchangeMessages();

}


run();
