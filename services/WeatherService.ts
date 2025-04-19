import axios, { AxiosError } from 'axios';

type WeatherData = {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
};

class WeatherService {
  private readonly API_KEY = '8ba8d211c720a5613b07c8b4b241b5fe';
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        return `Location not found. Please check the city name and try again.`;
      }
      if (error.response?.status === 401) {
        return `API authentication failed. Please check API key configuration.`;
      }
      if (error.code === 'ECONNABORTED') {
        return `Request timed out. Please try again.`;
      }
      return `API Error: ${error.message}`;
    }
    return 'An unexpected error occurred while fetching weather data.';
  }

  private readonly DESTINATION_COORDINATES = {
    'Upper Mustang': { lat: 29.1892, lon: 83.9689 },
    'Rara Lake': { lat: 29.5333, lon: 82.0833 },
    'Annapurna Base Camp': { lat: 28.5312, lon: 83.8775 },
    'Everest Base Camp': { lat: 28.0025, lon: 86.8535 },
    'Langtang Valley': { lat: 28.2139, lon: 85.6153 },
    'Bhaktapur Durbar Square': { lat: 27.6722, lon: 85.4279 },
    'Pashupatinath Temple': { lat: 27.7109, lon: 85.3487 },
    'Ghorepani Poon Hill': { lat: 28.4043, lon: 83.7003 },
    'Chitwan National Park': { lat: 27.5145, lon: 84.4346 }
  };

  async getWeather(location: string): Promise<WeatherData> {
    let lastError: unknown;
    const coordinates = this.DESTINATION_COORDINATES[location];

    if (!coordinates) {
      throw new Error('Location coordinates not found. Please check the destination name.');
    }

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get(
          `${this.BASE_URL}/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.API_KEY}`,
          { timeout: 5000 }
        );

        if (!response.data?.main || !response.data?.weather?.[0]) {
          throw new Error('Invalid weather data received from API');
        }

        return {
          temperature: Math.round(response.data.main.temp),
          condition: response.data.weather[0].main,
          icon: `https://openweathermap.org/img/w/${response.data.weather[0].icon}.png`,
          humidity: response.data.main.humidity,
          windSpeed: response.data.wind.speed
        };
      } catch (error) {
        lastError = error;
        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt);
          continue;
        }
      }
    }

    const errorMessage = this.getErrorMessage(lastError);
    console.error('Weather service error:', errorMessage);
    throw new Error(errorMessage);
  }
}

export const weatherService = new WeatherService();