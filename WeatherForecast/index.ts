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
    // Moved city to a class property for better encapsulation and easy modification
    private readonly city: string = 'London'; 
    private readonly apiKey: string = '8294ab245382114f46a37b3c31376d41'; 

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
        await this.fetchAndTransformWeatherData();
        this.renderControl();
    }

    // Separated fetching and transforming data into its own method for better readability and separation of concerns
    private async fetchAndTransformWeatherData(): Promise<void> {
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${this.city}&units=metric&cnt=5&appid=${this.apiKey}`;

        try {
            const response = await axios.get<IWeatherApiResponse>(apiUrl);
            const data = response.data.list;

            this.weatherData = data.map((item: IWeatherApiItem) => this.transformWeatherData(item));

        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    // Created a new method to transform weather data, improving readability and separation of concerns
    private transformWeatherData(item: IWeatherApiItem): IWeatherData {
        const date = new Date(item.dt * 1000);
        const temperature = item.main.temp;
        const weatherType = this.getWeatherType(item.weather[0].main);

        return {
            date: date,
            temperature: Math.round(temperature),
            weatherType: weatherType
        };
    }

    // Simplified the getWeatherType method by combining the cases for 'Rain', 'Drizzle', and 'Thunderstorm' into one line
    private getWeatherType(weather: string): WeatherType {
        switch (weather) {
            case 'Clouds': return WeatherType.CLOUDY;
            case 'Clear': return WeatherType.SUNNY;
            case 'Snow': return WeatherType.SNOW;
            case 'Rain': 
            case 'Drizzle': 
            case 'Thunderstorm': return WeatherType.RAINSNOW;
            default: return WeatherType.PARTLYCLOUDYDAY;
        }
    }

    private renderControl(): void {
        this.container.innerHTML = `<div class="weather-forecast-app">
            ${this.weatherData.map(data => this.createWeatherDayHtml(data)).join('')}
        </div>`;
    }

    // Created a new method to generate the HTML for a single day, separating the concerns of data transformation and HTML generation
    private createWeatherDayHtml(data: IWeatherData): string {
        return `
            <div class="weather-day">
                <h3>${data.date.toDateString()}</h3>
                <div class="weather-icon">${data.weatherType}</div>
                <div class="temperature">${data.temperature}°C</div>
                <div class="weather-type">${data.weatherType}</div>
            </div>
        `;
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
