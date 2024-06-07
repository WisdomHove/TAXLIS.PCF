import { IInputs, IOutputs } from "./generated/ManifestTypes";

interface IWeatherData {
    date: Date;
    temperature: number;
    weatherType: WeatherType;
}

enum WeatherType {
    CLOUDY = 'Cloudy',
    SUNNY = 'Sunny',
    SNOW = 'Snow',
    RAINSNOW = 'RainSnow',
    PARTLYCLOUDYDAY = 'PartlyCloudyDay',
}

export class WeatherForecast implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private weatherData: IWeatherData[];

    constructor() {
        this.weatherData = this.generateWeatherData();
    }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.container = container;
        this.renderControl();
    }

    private generateWeatherData(): IWeatherData[] {
        const startDate = new Date();
        const weatherData: IWeatherData[] = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(startDate.getDate() + i);
            const temperature = Math.floor(Math.random() * 51) - 25;
            let weatherType: WeatherType = WeatherType.SUNNY;

            if (temperature <= -5)
                weatherType = WeatherType.SNOW;
            else if (temperature >= -5 && temperature <= 5)
                weatherType = WeatherType.RAINSNOW;
            else if (temperature >= 5 && temperature <= 10)
                weatherType = WeatherType.CLOUDY;
            else if (temperature >= 10 && temperature <= 20)
                weatherType = WeatherType.PARTLYCLOUDYDAY;
            else if (temperature >= 20)
                weatherType = WeatherType.SUNNY;

            weatherData.push({
                date: date,
                temperature: temperature,
                weatherType: weatherType
            });
        }
        return weatherData;
    }

    private renderControl(): void {
        this.container.innerHTML = `<div class="weather-forecast-app">
            ${this.weatherData.map(data => `
                <div class="weather-day">
                    <h3>${data.date.toDateString()}</h3>
                    <div class="weather-icon">${data.weatherType}</div>
                    <div class="temperature">${data.temperature}°C</div>
                    <div class="weather-type">${data.weatherType}</div>
                </div>
            `).join('')}
        </div>`;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Not implemented
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // Cleanup if necessary
    }
}


