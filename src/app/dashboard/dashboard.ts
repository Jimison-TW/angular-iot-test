import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MqttService } from '../../mqtt/mqtt.service';
import { LiveChartComponent } from '../component/liveChart';
import { WeatherDataType } from '../../constant/config';
import { ChartData, WeatherData } from '../../constant/dataType';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [LiveChartComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  public weatherDatas: { type: WeatherDataType, data: ChartData }[] = [
    { type: WeatherDataType.Temperature, data: { value: 0, time: '' } },
    { type: WeatherDataType.Humidity, data: { value: 0, time: '' } }
  ];
  public currentCity = '';

  constructor(private mqtt: MqttService, private route: ActivatedRoute) { }

  public ngOnInit() {
    // 監聽路由變化
    this.route.paramMap.subscribe(params => {
      const city = params.get('city') || 'taipei';
      console.warn('City changed to:', city);
      if (city !== this.currentCity) {
        this.currentCity = city;
        this.connectMqtt(city);
      }
    });
    // this.connectMqtt();
    // 模擬每 5 秒發佈一次新氣象資料
    setInterval(() => this.mqtt.publishFakeWeather(), 5000);
  }

  private connectMqtt(city: string) {
    this.mqtt.connect(`weather/${city}`); // 連接新的主題
    this.mqtt.message$.subscribe(msg => {
      console.warn(msg)
      if (msg) {
        const data: WeatherData = JSON.parse(JSON.stringify(msg));
        // console.warn(data)
        this.weatherDatas = []
        this.weatherDatas = [
          { type: WeatherDataType.Temperature, data: { value: data.temperature, time: data.time } },
          { type: WeatherDataType.Humidity, data: { value: data.humidity, time: data.time } }
        ]
      }
    });
  }

  ngOnDestroy() {
    this.mqtt.disconnect();
  }
}
