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
        :host {
            width: 100%;
            display: block;
        }
        h3 {
            margin: 0 0 1rem 0;
            text-align: center;
        }
        .chart {
            width: 100%;
            height: 350px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 0 8px rgba(0,0,0,0.1);
            margin: 0 auto;
        }
        @media screen and (max-width: 991px) {
            .chart {
                height: 300px;
            }
        }
    `
})

export class LiveChartComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() city?: string
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
        console.warn('LiveChartComponent changes:', changes);
        // 當 router 傳入的 city 改變時，清空資料並重置圖表
        if (changes['city'] && !changes['city'].firstChange) {
            this.storeDatas = [];
            // 清除圖表內容並重設 option
            this.zone.runOutsideAngular(() => {
                this.chart?.clear();
                this.chart?.setOption(this.createOption(OptionType.Line, this.chartTitle));
                this.chart?.resize();
            });
        }

        if (changes['chartData'] && changes['chartData'].currentValue) {
            let { currentValue } = changes['chartData']
            this.addDataPoint(this.storeDatas, currentValue)

            this.zone.runOutsideAngular(() => this.updateCharts());
        }
    }

    ngAfterViewInit() {
        this.initCharts();
        // 監聽視窗大小變化
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    ngOnDestroy() {
        // 清理事件監聽
        window.removeEventListener('resize', this.handleResize.bind(this));
        // 銷毀圖表實例
        this.chart?.dispose();
    }

    private handleResize() {
        this.zone.runOutsideAngular(() => {
            this.chart?.resize();
        });
    }

    private initCharts() {
        const ele = document.getElementById(this.chartId);
        if (!ele) return;

        this.zone.runOutsideAngular(() => {
            this.chart = echarts.init(ele);
            this.chartTitle = this.type === WeatherDataType.Temperature ? 'Temperature (°C)' : 'Humidity (%)';
            this.chart.setOption(this.createOption(OptionType.Line, this.chartTitle));
        });
    }


    private updateCharts() {
        if (!this.chart) return;

        const option = {
            xAxis: { data: this.storeDatas.map(d => d.time.slice(11, 16)) },
            series: [{ type: 'line', data: this.storeDatas.map(d => d.value) }]
        };

        this.chart.setOption(option);
        this.handleResize(); // 確保圖表大小正確
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