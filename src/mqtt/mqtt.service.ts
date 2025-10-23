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

    this.client.on('connect', () => {
      console.log('MQTT Connected');
      TOPIC_LIST.forEach(t => {
        this.client.subscribe(t, err => {
          if (!err) console.log(`Subscribed to topic: ${t}`);
        });
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

    this.client.on('disconnect', () => {
      console.log('MQTT Disconnected');
      this.client.unsubscribe(this.currentTopic, err => {
        if (!err) console.log(`Unsubscribed from topic: ${this.currentTopic}`);
      });
    })
  }

  public subscribeTopic(topic: string) {
    this.currentTopic = topic;

    if (this.client.connected) {
      // 先取消先前主題（若有）
      if (this.currentTopic) {
        // unsubscribe old topic handled below only if it differs; ensure we don't unsubscribe new topic immediately
      }
      // 若之前訂閱不同主題，先 unsubscribe 再 subscribe
      this.client.unsubscribe(this.currentTopic, () => {
        this.client?.subscribe(topic, err => {
          if (!err) console.log(`Subscribed to topic: ${topic}`);
        });
      });
    } else {
      // 尚未連線：createClient() 的 connect handler 會自動訂閱 currentTopic
      // 確保 client 存在且會在 connect 時訂閱 currentTopic
      // 若 client 已存在但尚未連線，createClient 不必要重建，connect handler 中會訂閱
    }
  }

  // 結束連線並移除訂閱
  public disconnect() {
    if (!this.client) return;
    try {
      if (this.currentTopic) {
        this.client.unsubscribe(this.currentTopic, () => {
          // 不需要處理錯誤
        });
      }
      this.client.removeAllListeners();
      this.client.end(true);
    } catch (err) {
      console.warn('Error during MQTT disconnect', err);
    }
  }

  // 模擬 publish
  publishFakeWeather() {
    if (!this.client.connected) {

    }
    const payload = {
      temperature: 24 + Math.random() * 4,
      humidity: 60 + Math.random() * 10,
      time: new Date().toISOString()
    };
    this.client.publish(this.currentTopic, JSON.stringify(payload));
  }
}
