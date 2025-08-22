import Phaser from 'phaser';
import Weather, { WeatherCondition } from '../environment/Weather';

export default class District01 extends Phaser.Scene {
  private weather!: Weather;
  private conditions: WeatherCondition[] = ['clear', 'rain', 'snow', 'lightning'];
  private conditionIndex = 0;

  private dayDuration = 10000; // milliseconds for full cycle day -> night -> day
  private dayTime = 0;
  private goingToNight = true;

  constructor() {
    super('District01');
  }

  create() {
    this.add.text(10, 10, 'District 01', { color: '#fff' });

    this.weather = new Weather(this);
    this.cycleWeather();
  }

  private cycleWeather() {
    this.weather.setCondition(this.conditions[this.conditionIndex]);
    this.conditionIndex = (this.conditionIndex + 1) % this.conditions.length;
    this.time.addEvent({ delay: 5000, callback: this.cycleWeather, callbackScope: this });
  }

  update(_time: number, delta: number) {
    // Update day/night progress
    this.dayTime += delta * (this.goingToNight ? 1 : -1);
    if (this.dayTime >= this.dayDuration) {
      this.dayTime = this.dayDuration;
      this.goingToNight = false;
    }
    if (this.dayTime <= 0) {
      this.dayTime = 0;
      this.goingToNight = true;
    }
    const progress = this.dayTime / this.dayDuration;
    this.weather.setTimeOfDay(progress);
  }
}

