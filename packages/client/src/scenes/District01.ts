import Phaser from 'phaser';
import Weather, { WeatherCondition } from '../environment/Weather';

const DAY_DURATION = 24000; // ms for full day/night cycle

export default class District01 extends Phaser.Scene {
  private weather!: Weather;
  private conditions: WeatherCondition[] = ['clear', 'rain', 'snow', 'lightning'];
  private conditionIndex = 0;
  private weatherCycleEvent?: Phaser.Time.TimerEvent;

  private dayTime = 0;
  private goingToNight = true;

  constructor() {
    super('District01');
  }

  create() {
    this.add.text(10, 10, 'District 01', { color: '#fff' });

    this.weather = new Weather(this);
    this.cycleWeather();

    this.events.once(Phaser.Core.Events.SHUTDOWN, () => {
      this.weatherCycleEvent?.remove(false);
    });
  }

  private cycleWeather() {
    this.weather.setCondition(this.conditions[this.conditionIndex]);
    this.conditionIndex = (this.conditionIndex + 1) % this.conditions.length;
    this.weatherCycleEvent = this.time.addEvent({
      delay: 5000,
      callback: this.cycleWeather,
      callbackScope: this
    });
  }

  update(_time: number, delta: number) {
    // Oscillate day/night using sine for smoother transition
    this.dayTime = (this.dayTime + delta) % (DAY_DURATION * 2);
    const progress = Math.abs(this.dayTime / DAY_DURATION - 1);
    this.weather.setTimeOfDay(progress);
  }
}

