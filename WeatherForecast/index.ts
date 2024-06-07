import { IInputs, IOutputs } from "./generated/ManifestTypes";
import axios from 'axios';

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

// Define interfaces for the OpenWeatherMap API response
interface IWeatherApiResponse {
    list: IWeatherApiItem[];
}

interface IWeatherApiItem {
    dt: number;
    main: {
        temp: number;
    };
    weather: {
        main: string;
    }[];
}

export class WeatherForecast implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private weatherData: IWeatherData[];
    private apiKey: string = '8294ab245382114f46a37b3c31376d41'; // Replace with your OpenWeatherMap API Key

    constructor() {
        this.weatherData = [];
    }

    public async init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): Promise<void> {
        this.container = container;
        await this.fetchWeatherData();
        this.renderControl();
    }

    private async fetchWeatherData(): Promise<void> {
        const city = 'London'; // Replace with the city you want to fetch weather for
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=5&appid=${this.apiKey}`;

        try {
            const response = await axios.get<IWeatherApiResponse>(apiUrl);
            const data = response.data.list;

            this.weatherData = data.map((item: IWeatherApiItem) => {
                const date = new Date(item.dt * 1000);
                const temperature = item.main.temp;
                const weatherType = this.getWeatherType(item.weather[0].main);

                return {
                    date: date,
                    temperature: Math.round(temperature),
                    weatherType: weatherType
                };
            });

        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    private getWeatherType(weather: string): WeatherType {
        switch (weather) {
            case 'Clouds': return WeatherType.CLOUDY;
            case 'Clear': return WeatherType.SUNNY;
            case 'Snow': return WeatherType.SNOW;
            case 'Rain': return WeatherType.RAINSNOW;
            case 'Drizzle': return WeatherType.RAINSNOW;
            case 'Thunderstorm': return WeatherType.RAINSNOW;
            default: return WeatherType.PARTLYCLOUDYDAY;
        }
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
