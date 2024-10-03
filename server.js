const express = require('express')
const cors = require("cors")
const socketio = require('socket.io')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const authRoute = require('./routes/auth')
const userRoute = require('./routes/user')
const dataRoute = require('./routes/sensor')
const deviceRoute = require('./routes/deviceRoute')
const mqtt = require('mqtt');
const Data = require('./models/Data')
const MacESP = require('./models/MacESP')
const { handleMessage } = require('./controllers/mqttController');

const app = express();
const httpServer = require('http').createServer(app);
const port = 9000;

dotenv.config()
app.use(express());
mongoose.set("strictQuery", false);

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) {
        console.error("Lỗi kết nối:", err);
    } else {
        console.log("Đã connect!");
    }
});


let sensorData = { temp: 0, humid: 0, gas: 0 };
const mqttBrokerUrl = process.env.MQTT_URL; // URL của MQTT broker
const mqttUsername = process.env.MQTT_USERNAME; // Tên đăng nhập MQTT
const mqttPassword = process.env.MQTT_PASS; // Mật khẩu MQTT
const mqttTopicValue = process.env.MQTT_TOPIC_SEND; // Topic muốn subscribe vào
const mqttTopicDetected = process.env.MQTT_TOPIC_DETECT; // Topic muốn subscribe vào
const mqttTopicMAC = process.env.MQTT_TOPIC_MAC;  

const server = new socketio.Server(httpServer, {
    cors:{
        origin: '*'
    }
})

const listData = []
server.on('connection', (socket) => {
});

const mqttClient = mqtt.connect(mqttBrokerUrl, {
    username: mqttUsername,
    password: mqttPassword
  });
  
  mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      mqttClient.subscribe(mqttTopicValue, (err) => {
      if (err) {
          console.error('Error subscribing to topic:', err);
      } else {
          console.log('Subscribed to topic:', mqttTopicValue);
      }
      });
      mqttClient.subscribe(mqttTopicDetected, (err) => {
      if (err) {
          console.error('Error subscribing to topic:', err);
      } else {
          console.log('Subscribed to topic:', mqttTopicDetected);
      }
      });
      mqttClient.subscribe(mqttTopicMAC, (err) => {
        if (err) {
            console.error('Error subscribing to topic:', err);
        } else {
            console.log('Subscribed to topic:', mqttTopicMAC);
        }
        });
  });

  mqttClient.on('message', (topic, message) => {
    handleMessage(topic, message, server, listData);
  });


//   mqttClient.on('message', (topic, message) => {
//     if (topic === mqttTopicValue)
//     {
//         const parsedMessage = JSON.parse(message.toString());
//         const newData = new Data({
//             macAddr: parsedMessage.macAddr,
//             temp: parsedMessage.temper,
//             humid: parsedMessage.humid,
//             gas: parsedMessage.gas
//         });
//         newData.save()
//         .then(() => 
//             {
//                 console.log(parsedMessage)
//                 const currentDate = new Date();
//                 const hours = currentDate.getHours();
//                 const minutes = currentDate.getMinutes();
//                 listData.push({name: `${hours}:${minutes}`, humid: parsedMessage.humid, temp: parsedMessage.temper, gas: parsedMessage.gas});
//                 const latestData = listData.slice(Math.max(listData.length - 20, 0));
//                 server.sockets.emit('message', latestData);
//                 server.sockets.emit('value', {humid: parsedMessage.humid, temp: parsedMessage.temper, gas: parsedMessage.gas} );
//                 processStatus(parsedMessage);  
//         })
//         .catch(err => console.error('Error saving data:', err));
//     } else if (topic === mqttTopicMAC )
//     {
//         const parsedMessage = JSON.parse(message.toString());
//         const newMac = new MacESP({
//             macAddr: parsedMessage.macAddr,
//         });
//         newMac.save()
//         .then(()=>{
//              console.log("MAC: "+ parsedMessage.macAddr)
//         })
//         .catch(err => console.error('Error saving data:', err));
//     }
    
// });
// function processStatus(jsonData)
// {
//     if (jsonData.gas > 80) return server.sockets.emit('status', {'status': 3, msg: 'Cực kì nguy hiểm'})
//     if (jsonData.temper > 70 || jsonData.humid < 10) return server.sockets.emit('status', {'status': 3, msg: 'Cực kì nguy hiểm'})
//     if (jsonData.gas > 40) return server.sockets.emit('status', {'status': 2, msg: 'Nguy hiểm'})
//     if (jsonData.temp > 50 || jsonData.humid < 20) return server.sockets.emit('status', {'status': 2, msg: 'Nguy hiểm'})
//     return server.sockets.emit('status', {'status': 1, msg: 'Bình thường'})

// }

app.use(cors());
app.use(cookieParser());
app.use(express.json());

//Route
app.use('/v1/auth', authRoute)
app.use('/v1/user', userRoute)
app.use('/api/data', dataRoute)
app.use('/api/add', deviceRoute)


httpServer.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

