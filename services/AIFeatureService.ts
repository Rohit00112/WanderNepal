import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiService } from './GeminiService';

interface TrekDifficultyPrediction {
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
  reasons: string[];
  recommendations: string[];
  healthRisks?: string[];
  fitnessRequirements?: string[];
}

interface HealthMonitoringData {
  heartRate: number;
  bloodOxygen: number;
  altitude: number;
  symptoms: string[];
  timestamp: string;
}

interface HealthSensorData {
  heartRate: number;
  bloodOxygen: number;
  altitude: number;
}

interface WeatherPrediction {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  visibility: number;
  safetyScore: number;
  recommendations: string[];
}

interface TrekBuddyMatch {
  userId: string;
  compatibility: number;
  interests: string[];
  experience: string;
  plannedDates?: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  criteria: string;
  points: number;
  icon: string;
  unlockedAt?: string;
}

type LandmarkInfo = {
  name: string;
  description: string;
  historicalSignificance: string;
  culturalNotes: string;
  visitingTips: string[];
};

class AIFeatureService {
  private readonly model = geminiService;
  private readonly healthThresholds = {
    minBloodOxygen: 85,
    maxHeartRate: 180,
    criticalAltitude: 4000
  };

  private async getHealthSensorData(): Promise<HealthSensorData> {
    // In a real implementation, this would interface with actual health sensors
    // For now, we'll simulate sensor data with realistic ranges
    return {
      heartRate: Math.floor(Math.random() * (120 - 60) + 60), // 60-120 bpm
      bloodOxygen: Math.floor(Math.random() * (100 - 85) + 85), // 85-100%
      altitude: Math.floor(Math.random() * (4000 - 1000) + 1000) // 1000-4000m
    };
  }

  async monitorHealthData(): Promise<HealthMonitoringData> {
    try {
      const sensorData = await this.getHealthSensorData();
      const symptoms: string[] = [];

      // Check for concerning health metrics and add relevant symptoms
      if (sensorData.bloodOxygen < this.healthThresholds.minBloodOxygen) {
        symptoms.push('Low blood oxygen');
      }
      if (sensorData.heartRate > this.healthThresholds.maxHeartRate) {
        symptoms.push('Elevated heart rate');
      }
      if (sensorData.altitude > this.healthThresholds.criticalAltitude) {
        symptoms.push('High altitude exposure');
      }

      return {
        ...sensorData,
        symptoms,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error monitoring health data:', error);
      throw new Error('Failed to monitor health data');
    }
  }

  async predictTrekDifficulty(
    elevation: number,
    distance: number,
    terrain: string,
    season: string
  ): Promise<TrekDifficultyPrediction> {
    const prompt = `You are a trek difficulty analysis system. Analyze these parameters and return ONLY a JSON object:

Parameters:
- Elevation: ${elevation} meters
- Distance: ${distance} km
- Terrain: ${terrain}
- Season: ${season}

Required JSON format:
{
  "difficulty": "[Easy|Moderate|Challenging|Extreme]",
  "reasons": ["reason1", "reason2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Respond with ONLY the JSON object, no other text or formatting.`;


    try {
      const response = await geminiService.generateResponse(prompt);
      // Clean and validate the response
      let cleanedResponse = response.text
        .trim()
        // Remove any markdown code block indicators
        .replace(/```json\n?|```/g, '')
        // Remove any explanatory text before or after the JSON
        .replace(/^[^{]*({[\s\S]*})[^}]*$/s, '$1')
        // Remove any line breaks and extra spaces
        .replace(/\s+/g, ' ')
        .trim();

      // Validate JSON structure before parsing
      if (!cleanedResponse.startsWith('{') || !cleanedResponse.endsWith('}')) {
        throw new Error('Response is not a valid JSON object');
      }
      const parsedResponse = JSON.parse(cleanedResponse);
      
      // Validate required fields and types
      if (!parsedResponse.difficulty || !Array.isArray(parsedResponse.reasons) || !Array.isArray(parsedResponse.recommendations)) {
        throw new Error('Missing or invalid required fields in response');
      }
      
      return parsedResponse;
    } catch (error) {
      console.error('Error predicting trek difficulty:', error);
      return {
        difficulty: 'Moderate',
        reasons: ['Unable to analyze parameters accurately'],
        recommendations: ['Please consult local guides for accurate assessment']
      };
    }
  }

  async identifyLandmark(imageData: string): Promise<LandmarkInfo> {
    const prompt = `Analyze this image of a landmark in Nepal and provide detailed information about it.
      Include its name, description, historical significance, cultural notes, and visiting tips.
      Format the response as JSON.`;

    try {
      // Note: Implementation will be updated when Gemini Vision API is integrated
      const response = await geminiService.generateResponse(prompt);
      // Clean and validate the response
      let cleanedResponse = response.text
        .trim()
        // Remove any markdown code block indicators
        .replace(/```json\n?|```/g, '')
        // Remove any explanatory text before or after the JSON
        .replace(/^[^{]*({[\s\S]*})[^}]*$/s, '$1')
        // Remove any line breaks and extra spaces
        .replace(/\s+/g, ' ')
        .trim();

      // Validate JSON structure before parsing
      if (!cleanedResponse.startsWith('{') || !cleanedResponse.endsWith('}')) {
        throw new Error('Response is not a valid JSON object');
      }
      const parsedResponse = JSON.parse(cleanedResponse);
      
      // Validate required fields and types
      if (!parsedResponse.name || !parsedResponse.description || !Array.isArray(parsedResponse.visitingTips)) {
        throw new Error('Missing or invalid required fields in response');
      }
      
      return parsedResponse;
    } catch (error) {
      console.error('Error identifying landmark:', error);
      return {
        name: 'Unknown Landmark',
        description: 'Unable to identify the landmark at this time',
        historicalSignificance: '',
        culturalNotes: '',
        visitingTips: ['Please try again or consult local guides']
      };
    }
  }

  async optimizeItinerary(
    places: string[],
    duration: number,
    preferences: string[],
    weatherData?: WeatherPrediction[],
    crowdData?: { density: number; peakHours: string[] }[]
  ): Promise<string[]> {
    const prompt = `Optimize a ${duration}-day itinerary for the following places in Nepal:
      ${places.join(', ')}\n\nConsider these preferences: ${preferences.join(', ')}\n\n
      Provide an optimized day-by-day itinerary that maximizes experience while minimizing travel time.`;

    try {
      const response = await geminiService.generateResponse(prompt);
      // Clean and validate the response
      let cleanedResponse = response.text
        .trim()
        // Remove any markdown code block indicators
        .replace(/```json\n?|```/g, '')
        // Remove any explanatory text before or after the JSON
        .replace(/^[^{]*({[\s\S]*})[^}]*$/s, '$1')
        // Remove any line breaks and extra spaces
        .replace(/\s+/g, ' ')
        .trim();

      // Validate JSON structure before parsing
      if (!cleanedResponse.startsWith('[') || !cleanedResponse.endsWith(']')) {
        throw new Error('Response is not a valid JSON array');
      }
      const parsedResponse = JSON.parse(cleanedResponse);
      
      // Validate array type
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Response must be an array of strings');
      }
      
      return parsedResponse;
    } catch (error) {
      console.error('Error optimizing itinerary:', error);
      return ['Unable to optimize itinerary. Please try again.'];
    }
  }


  async analyzeHealthData(data: HealthMonitoringData): Promise<{
    status: 'normal' | 'warning' | 'critical';
    recommendations: string[];
  }> {
    try {
      const status = this.evaluateHealthStatus(data);
      const recommendations = this.generateHealthRecommendations(data, status);
      return { status, recommendations };
    } catch (error) {
      console.error('Error analyzing health data:', error);
      return {
        status: 'warning',
        recommendations: ['Unable to analyze health data accurately. Please consult a medical professional if you feel unwell.']
      };
    }
  }

  async predictWeatherImpact(location: string, date: string): Promise<WeatherPrediction> {
    const prompt = `Analyze weather conditions and their impact on trekking for ${location} on ${date}. Consider safety and provide recommendations. Return ONLY a JSON object with the following format:
{
  "temperature": number,
  "humidity": number,
  "precipitation": number,
  "windSpeed": number,
  "visibility": number,
  "safetyScore": number,
  "recommendations": [string]
}`;

    try {
      const response = await geminiService.generateResponse(prompt);
      // Clean and validate the response
      let cleanedResponse = response.text
        .trim()
        // Remove any markdown code block indicators
        .replace(/```json\n?|```/g, '')
        // Remove any explanatory text before or after the JSON
        .replace(/^[^{]*({[\s\S]*})[^}]*$/s, '$1')
        // Remove any line breaks and extra spaces
        .replace(/\s+/g, ' ')
        .trim();

      // Validate JSON structure before parsing
      if (!cleanedResponse.startsWith('{') || !cleanedResponse.endsWith('}')) {
        throw new Error('Response is not a valid JSON object');
      }
      const parsedResponse = JSON.parse(cleanedResponse);
      
      // Validate required fields and types
      if (typeof parsedResponse.temperature !== 'number' ||
          typeof parsedResponse.humidity !== 'number' ||
          typeof parsedResponse.precipitation !== 'number' ||
          typeof parsedResponse.windSpeed !== 'number' ||
          typeof parsedResponse.visibility !== 'number' ||
          typeof parsedResponse.safetyScore !== 'number' ||
          !Array.isArray(parsedResponse.recommendations)) {
        throw new Error('Missing or invalid required fields in response');
      }
      
      return parsedResponse;
    } catch (error) {
      console.error('Error predicting weather impact:', error);
      return {
        temperature: 20,
        humidity: 60,
        precipitation: 0,
        windSpeed: 10,
        visibility: 10000,
        safetyScore: 8,
        recommendations: ['Weather prediction unavailable. Check local weather reports.']
      };
    }
  }

  async findTrekBuddies(userId: string, preferences: {
    dates: string[];
    difficulty: string;
    interests: string[];
  }): Promise<TrekBuddyMatch[]> {
    const prompt = `Find compatible trek buddies for user with preferences: ${JSON.stringify(preferences)}`;

    try {
      const response = await geminiService.generateResponse(prompt);
      return JSON.parse(response.text);
    } catch (error) {
      console.error('Error finding trek buddies:', error);
      return [];
    }
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    try {
      const prompt = `Generate achievements for trekking user profile ${userId}`;
      const response = await geminiService.generateResponse(prompt);
      return JSON.parse(response.text);
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  private evaluateHealthStatus(data: HealthMonitoringData): 'normal' | 'warning' | 'critical' {
    if (
      data.bloodOxygen < this.healthThresholds.minBloodOxygen ||
      data.heartRate > this.healthThresholds.maxHeartRate ||
      data.altitude > this.healthThresholds.criticalAltitude
    ) {
      return 'critical';
    }

    if (data.symptoms.length > 0) {
      return 'warning';
    }

    return 'normal';
  }

  private generateHealthRecommendations(data: HealthMonitoringData, status: string): string[] {
    const recommendations: string[] = [];

    if (status === 'critical') {
      recommendations.push('Immediately descend to a lower altitude');
      recommendations.push('Seek medical attention');
      recommendations.push('Rest and avoid physical exertion');
    } else if (status === 'warning') {
      recommendations.push('Take a break and monitor symptoms');
      recommendations.push('Stay hydrated and warm');
      recommendations.push('Consider using supplemental oxygen if available');
    } else {
      recommendations.push('Continue monitoring your health');
      recommendations.push('Stay hydrated and maintain a steady pace');
    }

    return recommendations;
  }
}

export const aiFeatureService = new AIFeatureService();