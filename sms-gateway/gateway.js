import rpio from 'rpio';
import gsm from 'serialport-gsm';
import { getMaxMessageId, insertMessages, updateMessage } from './db.js';

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

        console.log(result);

    } else {

        rpio.open(7, rpio.OUTPUT, rpio.LOW);
        rpio.write(7, rpio.LOW);
        rpio.sleep(4);
        rpio.write(7, rpio.HIGH);

        modem.initializeModem(initializeCallback);

    }

};

modem.on('open', openCallback);


modem.open('/dev/ttyUSB0', options);

const timeout = Object.create(null);
timeout.id = 0;

const fetchMessages = async () => {

    let error = null, status = 401, messages = null;

    const fromId = getMaxMessageId();

    try {

        const response = await fetch(`http://localhost:5173/api/sms/?apiKey=2mzie2w6rxe0u91t&fromId=${fromId}`);
        status = response.status;
        
        const json = await response.json();
        messages = json?.data;
        


    } catch (err) {

        // eslint-disable-next-line no-unused-vars
        error = err;
        status = 400; // client-side error

    }

    if (200 === status && messages && messages?.length) {

        const result = insertMessages(messages);

        if (result && !result?.error) {

            // SEND SMS

        }

    }

    /*
    clearTimeout(timeout.id);
    timeout.id = setTimeout(async () => {

        await fetchMessages();

    }, 30000);
    */

};

fetchMessages();