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

let timeoutId;

const openCallback = (result) => {

    if (result && result?.status && 'success' === result?.status) {

        modem.initializeModem(initializeCallback);

    } else {

        rpio.open(7, rpio.OUTPUT, rpio.LOW);
        rpio.write(7, rpio.LOW);
        rpio.sleep(4);
        rpio.write(7, rpio.HIGH);

        modem.open('/dev/ttyUSB0', options, openCallback);

    }

};

const initializeCallback = (result) => {

    if (result && result?.status && 'success' === result?.status) {

        modem.checkModem(checkCallback);

    } else {

        rpio.open(7, rpio.OUTPUT, rpio.LOW);
        rpio.write(7, rpio.LOW);
        rpio.sleep(4);
        rpio.write(7, rpio.HIGH);

        modem.initializeModem(initializeCallback);

    }

};

const checkCallback = (result) => {

    if (result && result?.status && 'success' === result?.status) {

        //fetchUnsentMessages();
        test();

    } else {

        rpio.open(7, rpio.OUTPUT, rpio.LOW);
        rpio.write(7, rpio.LOW);
        rpio.sleep(4);
        rpio.write(7, rpio.HIGH);

        modem.initializeModem(initializeCallback);

    }

};

//modem.on('open', openCallback);

/*
modem.open('/dev/ttyUSB0', options, (result) => {



});
*/

//modem.on('open', result => console.log(result))

async function openModem() {


    const r = await new Promise(resolve => {

        modem.open('/dev/ttyUSB0', options, (...result) => {

            resolve(result);            

        });

    })

    console.log('OPEN', r)

}

//openModem();

async function hardwareToggle () {

     return new Promise(resolve => {

        let result = true;

        try {

            rpio.open(7, rpio.OUTPUT, rpio.LOW);
            rpio.write(7, rpio.LOW);
            rpio.sleep(4);
            rpio.write(7, rpio.HIGH);

        } catch {

            result = false;

        } finally {

            resolve(result);

        }

    })

}

async function test() {

    const toggled = await hardwareToggle();
    console.log({toggled})

}

test();


const sendMessage = (index, unsentMessages) => {

    if (index < unsentMessages.length) {

        console.log('Sending message', index);

        const message = unsentMessages[index];
        
        modem.sendSMS(
            message.phoneNumber,
            `Salutare!\nAcceseaza detaliile rezervarii tale aici:\n${baseUrl}/appointments/${message.pageId}\nAsociatia Spirit Tanar`,
            false,
            (result) => {
                
                console.log('message callback:', result);
                
                updateMessage(message.pageId, 1);
                
                sendMessage(index + 1, unsentMessages);

            }
        );

    } else {

        clearTimeout(timeout.id);
        timeout.id = setTimeout(() => {
    
            fetchUnsentMessages();
    
        }, 30000);

    }

};

const sendMessages = () => {

    const unsentMessages = getUnsentMessages();

    if (unsentMessages && unsentMessages.length) {

        console.log(unsentMessages.length, 'unsent messages. Starting to send...');

        sendMessage(0, unsentMessages);

    } else {

        clearTimeout(timeout.id);
        timeout.id = setTimeout(() => {

            fetchUnsentMessages();

        }, 30000);

    }

};

const fetchUnsentMessages = async () => { 

    console.log('Fetching messages...');

    let error = null, status = 401, messages = null;

    try {

        const response = await fetch(`${baseUrl}/api/sms/?apiKey=${apiKey}`);
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
                //sendMessages();

            }

        }

    } else {

        /*
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
    
            fetchUnsentMessages();
    
        }, 30000);
        */
    }

};

//fetchUnsentMessages();

/**
 * TODO
 * 
 * 0. test opening the modem with promises that wrap the callbacks
 * 00. test sending messages sequentially (also with promises)
 * 1. get unsent messages; for each unsent message, send it, then mark it as sent; for each newly sent message, update it on the server and then mark it as synced
 * 2. get unsynced messages; if there are any, for each unsynced message, update it on the server and then mark it as synced
 * 3. fetch unsent messages; insert those messages, then go to step 1
 * 4. do not hope for the best, do the following instead: read, think, write and test code!
 */

//modem.on('onSendingMessage', result => console.log('Sending message', result))

/*
async function test() {

    let count = 0;
    const r = await new Promise(resolve =>
        modem.sendSMS(
            '0769388493',
            `Salutare!\nTEST\nAsociatia Spirit Tanar`,
            false,
            (result) => {
                
                console.log('message callback:', result);
                ++count;
                console.log(`message callback #${count}`)

                if (2 === count) {
                    resolve(result);
                }
        
            }
        )
    )

    console.log('promise resolved', r)

}
*/