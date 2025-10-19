import { Injectable } from '@angular/core';
import { connect, MqttClient } from 'mqtt';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MqttService {
  private client: MqttClient;
  private topic = 'weather/taipei';
  private brokerUrl = 'wss://broker.emqx.io:8084/mqtt'; // WebSocket 端口

  public message$ = new BehaviorSubject<any>(null);

  constructor() {
    this.client = connect(this.brokerUrl);

    this.client.on('connect', () => {
      console.log('MQTT Connected');
      this.client.subscribe(this.topic, err => {
        if (!err) console.log(`Subscribed to topic: ${this.topic}`);
      });
    });

    this.client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        this.message$.next(payload);
      } catch (err) {
        console.warn('Invalid JSON:', message.toString());
      }
    });
  }

  // 模擬 publish
  publishFakeWeather() {
    const payload = {
      temperature: 24 + Math.random() * 4,
      humidity: 60 + Math.random() * 10,
      time: new Date().toISOString()
    };
    this.client.publish(this.topic, JSON.stringify(payload));
  }
}
