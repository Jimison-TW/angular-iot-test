import * as echarts from 'echarts';
import { Component, OnInit, AfterViewInit, NgZone, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ECharts, EChartsCoreOption } from "echarts";
import { ChartData, WeatherData } from '../../constant/dataType';
import { OptionType, WeatherDataType } from '../../constant/config';

@Component({
    selector: 'live-chart-component',
    template: `
        <h3>即時{{this.chartName}}折線圖</h3>
        <div class="chart" [id]="chartId"></div>
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

export class LiveChartComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() type?: WeatherDataType
    @Input() chartData?: ChartData

    public chartId = 'chart-' + Math.random().toString(36).substring(2, 8);
    public chartName = ''
    public chartTitle = ''
    private chart: ECharts | undefined
    private storeDatas: ChartData[] = []

    constructor(private zone: NgZone) { }

    ngOnInit(): void {
        this.chartName = this.type === WeatherDataType.Temperature ? '溫度' : '濕度'
    }

    ngOnChanges(changes: SimpleChanges): void {
        let { currentValue } = changes['chartData']
        this.addDataPoint(this.storeDatas, currentValue)

        this.zone.runOutsideAngular(() => this.updateCharts());
    }

    ngAfterViewInit() {
        this.initCharts()
    }

    private initCharts() {
        const ele = document.getElementById(this.chartId)
        if (!ele) return
        this.chart = echarts.init(ele)
        this.chartTitle = this.type === WeatherDataType.Temperature ? 'Temperature (°C)' : 'Humidity (%)'
        this.chart.setOption(this.createOption(OptionType.Line, this.chartTitle))
    }


    private updateCharts() {
        this.chart?.setOption({
            xAxis: { data: this.storeDatas.map(d => d.time.slice(11, 16)) },
            series: [{ type: 'line', data: this.storeDatas.map(d => d.value) }]
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