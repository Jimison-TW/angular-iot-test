import mqtt from "mqtt";
import * as echarts from 'echarts';
import { Component, OnInit, AfterViewInit, NgZone } from "@angular/core";
import { MqttService } from '../../../mqtt/mqtt.service';
import { ECharts, EChartsCoreOption } from "echarts";
import { OptionType } from "../../../constant/config";

type WeatherData = {
    temperature: number
    humidity: number
    time: string
}

@Component({
    selector: 'app-temperature-chart',
    template: `
        <h3>即時溫度折線圖</h3>
        <div class="chart" id="temperatureChart"></div>
    `,
    styles: `
        .chart {
        width: 100%;
        height: 350px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 0 8px rgba(0,0,0,0.1);
        }
    `
})
export class LiveTemperatureComponent implements OnInit, AfterViewInit {
    private temperatureData: { time: string, value: number }[] = [];
    private chart: ECharts | undefined;

    constructor(private mqtt: MqttService, private zone: NgZone) { }

    ngOnInit() {
        this.connectMqtt();
        // 模擬每 5 秒發佈一次新氣象資料
        setInterval(() => this.mqtt.publishFakeWeather(), 5000);
    }

    ngAfterViewInit() {
        this.initCharts()
    }

    private connectMqtt() {
        this.mqtt.message$.subscribe(msg => {
            if (msg) {
                // this.temperatureData.push({ value: msg.temperature, time: msg.time })

                const data = JSON.parse(JSON.stringify(msg));
                const t = data.time.slice(11, 16);

                console.warn(data)
                this.addDataPoint(this.temperatureData, { time: t, value: data.temperature })

                this.zone.runOutsideAngular(() => this.updateCharts(data));
            }
        });
    }

    private initCharts() {
        const ele = document.getElementById('temperatureChart')
        if (!ele) return
        this.chart = echarts.init(ele)
        this.chart.setOption(this.createOption(OptionType.Line, 'Temperature (°C)'))
    }

    private updateCharts(data: WeatherData) {
        this.chart?.setOption({
            xAxis: { data: this.temperatureData.map(d => d.time) },
            series: [{ type: 'line', data: this.temperatureData.map(d => d.value) }]
        })
    }

    private createOption(type: OptionType, title: string): EChartsCoreOption {
        if (type === OptionType.Line)
            return {
                title: { text: title, left: 'center' },
                tooltip: { trigger: 'axis' },
                xAxis: { type: 'category', data: [] },
                yAxis: { type: 'value' },
                grid: { left: 50, right: 20, bottom: 40, top: 60 },
                series: [{ type: 'line', data: [], smooth: true, areaStyle: {} }]
            };
        else
            return {
                title: { text: 'Wind Speed (m/s)', left: 'center' },
                series: [
                    {
                        type: 'gauge',
                        min: 0,
                        max: 40,
                        splitNumber: 8,
                        axisLine: { lineStyle: { width: 8 } },
                        pointer: { width: 4 },
                        detail: { fontSize: 16, formatter: '{value} m/s' },
                        data: [{ value: 0, name: 'Wind' }]
                    }
                ]
            };
    }

    private addDataPoint(arr: any[], val: any) {
        arr.push(val);
        if (arr.length > 20) arr.shift();
    }
}