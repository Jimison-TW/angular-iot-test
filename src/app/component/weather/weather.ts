import { Component, OnInit } from '@angular/core';
import { MqttService } from '../../../mqtt/mqtt.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-live-weather',
  template: `
    <h3>🌤️ 台北即時氣象（模擬MQTT）</h3>
    <div>
        @if(weather){
            溫度：{{ weather.temperature | number:'1.0-1' }} °C <br>
            濕度：{{ weather.humidity | number:'1.0-1' }} % <br>
            時間：{{ weather.time }}
        }
    </div>
  `,
  imports: [DecimalPipe], // ✅ 加上這行
})
export class LiveWeatherComponent implements OnInit {
  weather: any;

  constructor(private mqtt: MqttService) {}

  ngOnInit() {
    this.mqtt.message$.subscribe(msg => {
      if (msg) this.weather = msg;
    });

    // 模擬每 5 秒發佈一次新氣象資料
    setInterval(() => this.mqtt.publishFakeWeather(), 5000);
  }
}
