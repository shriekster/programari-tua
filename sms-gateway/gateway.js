import rpio from 'rpio';
import gsm from 'serialport-gsm';
import 'dotenv/config';

import { insertMessages, getUnsentMessages, updateMessage } from './db.js';

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

const timeout = Object.create(null);
timeout.id = 0;

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

        fetchMessages();

    } else {

        rpio.open(7, rpio.OUTPUT, rpio.LOW);
        rpio.write(7, rpio.LOW);
        rpio.sleep(4);
        rpio.write(7, rpio.HIGH);

        modem.initializeModem(initializeCallback);

    }

};

modem.on('open', openCallback);


//modem.open('/dev/ttyUSB0', options);


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
    
            fetchMessages();
    
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

            fetchMessages();

        }, 30000);

    }

};

const fetchMessages = async () => { 

    console.log('Fetching messages...');

    let error = null, status = 401, messages = null;

    //const fromId = getMaxMessageId();

    //console.log({fromId})

    try {

        //const response = await fetch(`${baseUrl}/api/sms/?apiKey=${apiKey}&fromId=${fromId}`);
        const response = await fetch(`${baseUrl}/api/sms/?apiKey=${apiKey}&fromId=0`);
        status = response.status;
        
        const json = await response.json();
        messages = json?.data;
        


    } catch (err) {

        // eslint-disable-next-line no-unused-vars
        error = err;
        status = 400; // client-side error

    }

    if (200 === status && messages) {

        console.log('Got', messages.length, 'messages. Updating the database...');

        const result = insertMessages(messages);

        if (result && !result?.error) {

            console.log('Database updated.');
            sendMessages();

        }

    } else {

        clearTimeout(timeout.id);
        timeout.id = setTimeout(() => {
    
            fetchMessages();
    
        }, 30000);

    }

};

