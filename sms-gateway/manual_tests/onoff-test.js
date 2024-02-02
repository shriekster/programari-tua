import rpio from 'rpio';
import gsm from 'serialport-gsm';

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
    enableConcatenation: true,
    incomingCallIndication: true,
    incomingSMSIndication: true,
    pin: '',
    customInitCommand: '',
    cnmiCommand: 'AT+CNMI=2,1,0,2,1',
    logger: console
};

gsm.list((err, result) => {
    console.log(result)
})

//modem.open('COM', options, (data) => {
//    console.log(data)
//})

/*
rpio.open(7, rpio.OUTPUT, rpio.LOW);
rpio.write(7, rpio.LOW);
rpio.sleep(4);
rpio.write(7, rpio.HIGH);
*/