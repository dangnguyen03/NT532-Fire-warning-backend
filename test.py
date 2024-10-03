from flask import Flask, render_template, Response
import paho.mqtt.client as mqtt
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import math
import cvzone
import paho.mqtt.client as paho
from paho import mqtt

mqtt_broker = "269cddc81f3446da8c939add434498cf.s1.eu.hivemq.cloud"
mqtt_port = 8883
mqtt_topic = "iot/detected"
mqtt_username = "hive_thanhdang"
mqtt_password = "ThanhDang123"

def on_connect(client, userdata, flags, rc, properties=None):
    print("CONNACK received with code %s." % rc)
def on_publish(client, userdata, mid, properties=None):
    print("mid: " + str(mid))
def on_subscribe(client, userdata, mid, granted_qos, properties=None):
    print("Subscribed: " + str(mid) + " " + str(granted_qos))
def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.qos) + " " + str(msg.payload))

client = paho.Client(client_id="", userdata=None, protocol=paho.MQTTv311)
client.on_connect = on_connect

# enable TLS for secure connection
client.tls_set(tls_version=mqtt.client.ssl.PROTOCOL_TLS)
client.username_pw_set(mqtt_username, mqtt_password)
client.connect(mqtt_broker, mqtt_port)
client.on_subscribe = on_subscribe
client.on_message = on_message
client.on_publish = on_publish
client.subscribe(mqtt_topic)


app = Flask(__name__)
CORS(app) 
model = YOLO('fire.pt')
classnames = ['fire']
cap = cv2.VideoCapture('http://192.168.119.175:5000')
# cap = cv2.VideoCapture('./fire2.mp4')


@app.route('/')
def index():
    return render_template('index.html')

def detect_fire():
    while True:
        ret, frame = cap.read()
        if ret:
            result = model(frame, stream=True)
            for info in result:
                boxes = info.boxes
                for box in boxes:
                    confidence = box.conf[0]
                    confidence = math.ceil(confidence * 100)
                    Class = int(box.cls[0])
                    if confidence > 50:
                        x1, y1, x2, y2 = box.xyxy[0]
                        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 5)
                        cvzone.putTextRect(frame, f'{classnames[Class]} {confidence}%', [x1 + 8, y1 + 100],
                                   scale=1.5,thickness=1)
                    if confidence > 60:
                        client.publish(mqtt_topic, payload='{"macRasp": 1, "state": true}')
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
@app.route('/video_feed')
def video_feed():
    return Response(detect_fire(), mimetype='multipart/x-mixed-replace; boundary=frame')
if __name__ == '__main__':
    app.run(host='localhost', port=8000)

