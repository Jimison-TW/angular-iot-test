import { Component, OnInit } from '@angular/core';
import { LiveWeatherComponent } from "../component/weather/weather";
import { LiveTemperatureComponent } from "../component/weather/temperature";

@Component({
  selector: 'app-dashboard',
  imports: [LiveTemperatureComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

}
