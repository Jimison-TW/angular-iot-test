import { Injectable } from '@angular/core';
import { MqttClient } from 'mqtt';
import { BehaviorSubject } from 'rxjs';
import mqtt from 'mqtt';

const TOPIC_LIST = ['weather/taipei', 'weather/taichung', 'weather/kaohsiung'];

@Injectable({ providedIn: 'root' })
export class MqttService {
  private client: MqttClient;
  // private topic = 'weather/taipei';
  private currentTopic = '';
  private brokerUrl = 'wss://broker.emqx.io:8084/mqtt'; // WebSocket 端口

  public message$ = new BehaviorSubject<any>(null);

  constructor() {
    this.client = mqtt.connect(this.brokerUrl);

    this.connect(this.currentTopic);

    this.client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        this.message$.next(payload);
      } catch (err) {
        console.warn('Invalid JSON:', message.toString());
      }
    });
  }

  public connect(topic: string) {
    this.currentTopic = topic;
    this.client.on('connect', () => {
      console.log('MQTT Connected');
      TOPIC_LIST.forEach(t => {
        this.client.subscribe(t, err => {
          if (!err) console.log(`Subscribed to topic: ${t}`);
        });
      });
    });
  }

  public disconnect() {
    this.client.on('disconnect', () => {
      console.log('MQTT Disconnected');
      this.client.unsubscribe(this.currentTopic, err => {
        if (!err) console.log(`Unsubscribed from topic: ${this.currentTopic}`);
      });
    })
  }

  // 模擬 publish
  publishFakeWeather() {
    console.warn(this.currentTopic)
    const payload = {
      temperature: 24 + Math.random() * 4,
      humidity: 60 + Math.random() * 10,
      time: new Date().toISOString()
    };
    this.client.publish(this.currentTopic, JSON.stringify(payload));
  }
}
