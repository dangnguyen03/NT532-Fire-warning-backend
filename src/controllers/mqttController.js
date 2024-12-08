require('dotenv').config();

const Data = require('../models/Data');
const MacESP = require('../models/MacESP');
const User = require('../models/User');
const Device = require('../models/Device');
const ESPqueue = require('../models/ESPqueue')
const sendMail = require('../helpers/sendMail')

let lastProcessTime = 0;
function returnResult(parsedMessage, state)
{
    const currentDate = new Date();
    const currentTime = currentDate.getTime();
    const timeDiff = currentTime - lastProcessTime;
    if (timeDiff >= 10000) {
        let msg;
        if (state == 3)
        {
            msg = `Dữ liệu thu được trên ${parsedMessage.macAddr} cực kì nguy hiểm`;
        } else if (state == 2)
        {
            msg = `Dữ liệu thu được trên ${parsedMessage.macAddr} nguy hiểm`;
        }
        lastProcessTime = currentTime;
        (async () => {
            const macAddr = parsedMessage.macAddr;
            const macESP = await MacESP.findOne({ macAddr: macAddr });
            try
            {

                macRasp = macESP.macRasp;
                console.log(macRasp);
                const devices = await Device.find({ macRasp: macRasp });
                let users = [];
                for (const device of devices) {
                  const user = await User.findOne({ username: device.user });
                  users.push(user);
                }
                console.log(users);
                for(const user of users)
                {
                    console.log(user.email);
                    await sendMail({
                        email: 'dangnguyen.uit@gmail.com',
                        subject: 'WARMING',
                        html: `<h1><h1 style='font-weight:700'>${user.firstname+' '+user.lastname+' nhận được cảnh báo:\n'}</h1> ${msg}</h1>`
                    });
    
                }
            }catch(error)
            {

            }
        })();
    }
}
function processStatus(jsonData, server)
{
    if ((jsonData.gas > 70) || (jsonData.temper > 70 || jsonData.humid < 10)) 
    {   
        returnResult(jsonData, 3)
        server.sockets.emit('status', {'status': 3, msg: 'Cực kì nguy hiểm'})
        return;
    }
    if ((jsonData.gas > 55) ||(jsonData.temp > 50 || jsonData.humid < 20) ) 
    {
        returnResult(jsonData, 2)
        return server.sockets.emit('status', {'status': 2, msg: 'Nguy hiểm'})
    }
    return server.sockets.emit('status', {'status': 1, msg: 'Bình thường'})
}
let lastDetectionTime = 0
function handleMessage(topic, message, server, listData) {
  if (topic == process.env.MQTT_TOPIC_SEND) {
    const parsedMessage = JSON.parse(message.toString());
    const newData = new Data({
      macAddr: parsedMessage.macAddr,
      temp: parsedMessage.temper,
      humid: parsedMessage.humid,
      gas: parsedMessage.gas
    });
    newData.save()
      .then(() => {
        console.log(parsedMessage)
        const currentDate = new Date();
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        listData.push({ name: `${hours}:${minutes}`, humid: parsedMessage.humid, temp: parsedMessage.temper, gas: parsedMessage.gas, macAddr: parsedMessage.macAddr });
        const latestData = listData.slice(Math.max(listData.length - 20, 0));
        server.sockets.emit('message', latestData);
        server.sockets.emit('value', { humid: parsedMessage.humid, temp: parsedMessage.temper, gas: parsedMessage.gas, macAddr: parsedMessage.macAddr });
        processStatus(parsedMessage, server);
      })
      .catch(err => console.error('Error saving data:', err));
  } 
  
    else if (topic == process.env.MQTT_TOPIC_MAC) {
        const parsedMessage = JSON.parse(message.toString());
        const newMac = new ESPqueue({
            macAddr: parsedMessage.macAddr,
            macRasp: parsedMessage.macRasp
        });
        newMac.save()
            .then(() => {
            console.log("MAC: " + parsedMessage.macAddr)
            })
            .catch(err => console.error('Error saving data:', err));
    }

    else if (topic ==  process.env.MQTT_TOPIC_DETECT)
    {
        const parsedMessage = JSON.parse(message.toString());
        if (parsedMessage.state)
        {
            const currentDate = new Date();
            const currentTime = currentDate.getTime();
            const timeDiff = currentTime - lastDetectionTime;
      
            if (timeDiff >= 10000) {
                lastDetectionTime = currentTime;
                server.sockets.emit('detect', { state: true, msg: `Detected fire at ${currentDate}` });
                (async () => {
                    const macRasp = parsedMessage.macRasp;
                    const devices = await Device.find({ macRasp: macRasp });
                    let users = [];
                    for (const device of devices) {
                      const user = await User.findOne({ username: device.user });
                      users.push(user);
                    }
                    console.log(users);
                    users.forEach(async (user) => {
                        await sendMail({
                            email: 'dangnguyen.uit@gmail.com',
                            subject: 'DETECT FIRE',
                            html: `<h1><h1 style='font-weight:700; color: red;'>${user.firstname+' '+user.lastname+' nhận được cảnh báo:\n'}</h1> Đã phát hiện lửa trên macRasp: ${macRasp}</h1>`,
                        });
                    });
                })();
            }
        }
    }
}

module.exports = { handleMessage };