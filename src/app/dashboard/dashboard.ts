import { Component, OnInit } from '@angular/core';
import { LiveWeatherComponent } from "../component/weather/weather";

@Component({
  selector: 'app-dashboard',
  imports: [LiveWeatherComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

}
