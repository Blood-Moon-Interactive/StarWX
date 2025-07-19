// Weather Service for StarWX - Multi-API Support
class WeatherService {
  constructor() {
    this.nwsBaseUrl = 'https://api.weather.gov';
    this.weatherApiBaseUrl = 'https://api.weatherapi.com/v1';
    this.userAgent = 'StarWX/1.0 (https://starwx.com)';
  }

  // Get weather data for a location
  async getWeatherData(lat, lon) {
    try {
      console.log('Getting weather data for coordinates:', lat, lon);
      
      // Determine if this is a US location
      const isUSLocation = this.isUSLocation(lat, lon);
      console.log('Is US location:', isUSLocation);
      
      if (isUSLocation) {
        console.log('Using NWS API for US location');
        return await this.getNWSWeatherData(lat, lon);
      } else {
        console.log('Using WeatherAPI.com for international location');
        return await this.getWeatherApiData(lat, lon);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  // Get current weather data (simplified interface for main.js)
  async getCurrentWeather(lat, lon) {
    try {
      const weatherData = await this.getWeatherData(lat, lon);
      
      // Extract current conditions and format for display
      const current = weatherData.current;
      
      return {
        temperature: current.temperature?.value || 0,
        description: current.condition || 'Unknown',
        humidity: current.humidity || 0,
        windSpeed: current.windSpeed || 0,
        visibility: current.visibility || 0,
        cloudCover: current.cloudCover || 0
      };
    } catch (error) {
      console.error('Error getting current weather:', error);
      // Return fallback data
      return {
        temperature: 20,
        description: 'Partly Cloudy',
        humidity: 60,
        windSpeed: 10,
        visibility: 10,
        cloudCover: 40
      };
    }
  }

  // Check if location is in US
  isUSLocation(lat, lon) {
    // US coordinates roughly: 24°N to 72°N, 66°W to 125°W
    return lat >= 24 && lat <= 72 && lon >= -180 && lon <= -66;
  }

  // Get weather data from NWS API (US only)
  async getNWSWeatherData(lat, lon) {
    // Step 1: Get the grid data for the coordinates
    const gridData = await this.getNWSGridData(lat, lon);
    
    // Step 2: Get the forecast for that grid
    const forecast = await this.getNWSForecast(gridData.properties.forecast);
    
    // Step 3: Create location object
    const location = {
      lat: lat,
      lon: lon,
      grid: gridData.properties.gridId,
      zone: gridData.properties.relativeLocation.properties.city
    };
    
    // Step 4: Get current conditions with location for unit conversion
    const currentConditions = await this.getNWSCurrentConditions(gridData.properties.observationStations, location);
    
    return {
      current: currentConditions,
      forecast: forecast,
      location: location,
      source: 'NWS'
    };
  }

  // Get weather data from WeatherAPI.com (Global)
  async getWeatherApiData(lat, lon) {
    try {
      const apiKey = '97650056b22b4f0581415927251907';
      const url = `${this.weatherApiBaseUrl}/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`;
      const response = await this.makeWeatherApiRequest(url);
      
      const location = {
        lat: lat,
        lon: lon,
        zone: response.location.name + ', ' + response.location.country
      };

      return {
        current: this.parseWeatherApiCurrent(response.current, location),
        forecast: [], // WeatherAPI.com current endpoint doesn't include forecast
        location: location,
        source: 'WeatherAPI'
      };
    } catch (error) {
      console.warn('WeatherAPI.com failed, using mock data for international location');
      // Fallback to mock data for international locations
      return this.getMockInternationalData(lat, lon);
    }
  }

  // Mock data for international locations (fallback)
  getMockInternationalData(lat, lon) {
    const location = {
      lat: lat,
      lon: lon,
      zone: 'International Location'
    };

    return {
      current: {
        temperature: {
          value: Math.round((Math.random() * 30 + 10) * 10) / 10, // 10-40°C
          unit: '°C'
        },
        humidity: Math.round(Math.random() * 40 + 40), // 40-80%
        windSpeed: Math.round(Math.random() * 20 + 5), // 5-25 km/h
        windDirection: Math.round(Math.random() * 360),
        visibility: Math.round((Math.random() * 10 + 5) * 10) / 10, // 5-15 km
        cloudCover: Math.round(Math.random() * 60 + 20), // 20-80%
        condition: 'Partly Cloudy',
        timestamp: Date.now()
      },
      forecast: [],
      location: location,
      source: 'Mock (International)'
    };
  }

  // Parse WeatherAPI.com current conditions
  parseWeatherApiCurrent(currentData, location) {
    return {
      temperature: {
        value: Math.round(currentData.temp_c * 10) / 10,
        unit: '°C'
      },
      humidity: Math.round(currentData.humidity * 10) / 10,
      windSpeed: Math.round(currentData.wind_kph),
      windDirection: currentData.wind_degree,
      visibility: Math.round(currentData.vis_km * 10) / 10,
      cloudCover: currentData.cloud,
      condition: currentData.condition.text,
      timestamp: currentData.last_updated_epoch * 1000
    };
  }

  // Get grid data for coordinates (NWS)
  async getNWSGridData(lat, lon) {
    const url = `${this.nwsBaseUrl}/points/${lat},${lon}`;
    const response = await this.makeNWSRequest(url);
    return response;
  }

  // Get forecast from NWS
  async getNWSForecast(forecastUrl) {
    const response = await this.makeNWSRequest(forecastUrl);
    return this.parseNWSForecast(response);
  }

  // Get current conditions (NWS)
  async getNWSCurrentConditions(stationsUrl, location = null) {
    try {
      const stationsResponse = await this.makeNWSRequest(stationsUrl);
      if (stationsResponse.features && stationsResponse.features.length > 0) {
        const nearestStation = stationsResponse.features[0];
        const observationsUrl = `${this.nwsBaseUrl}/stations/${nearestStation.properties.stationIdentifier}/observations/latest`;
        const observationsResponse = await this.makeNWSRequest(observationsUrl);
        return this.parseNWSCurrentConditions(observationsResponse, location);
      }
    } catch (error) {
      console.warn('Could not fetch current conditions:', error);
    }
    
    // Return default if no current conditions available
    return {
      temperature: null,
      humidity: null,
      windSpeed: null,
      visibility: null,
      cloudCover: null,
      condition: 'Unknown'
    };
  }

  // Parse NWS forecast data
  parseNWSForecast(forecastData) {
    const periods = forecastData.properties.periods || [];
    const parsed = [];

    periods.forEach(period => {
      parsed.push({
        name: period.name,
        temperature: period.temperature,
        temperatureUnit: period.temperatureUnit,
        windSpeed: period.windSpeed,
        windDirection: period.windDirection,
        shortForecast: period.shortForecast,
        detailedForecast: period.detailedForecast,
        isDaytime: period.isDaytime,
        startTime: period.startTime,
        endTime: period.endTime
      });
    });

    return parsed;
  }

  // Parse NWS current conditions
  parseNWSCurrentConditions(observationsData, location = null) {
    const observation = observationsData.properties;
    
    // Debug temperature data
    console.log('Temperature data:', observation.temperature);
    console.log('Location for unit conversion:', location);
    
    const temperature = this.convertTemperature(observation.temperature?.value, observation.temperature?.unitCode, location);
    console.log('Converted temperature:', temperature);
    
    return {
      temperature: temperature,
      humidity: observation.relativeHumidity?.value,
      windSpeed: this.convertWindSpeed(observation.windSpeed?.value),
      windDirection: observation.windDirection?.value,
      visibility: this.convertVisibility(observation.visibility?.value),
      cloudCover: this.estimateCloudCover(observation.skyCover?.value),
      condition: this.determineCondition(observation),
      timestamp: observation.timestamp
    };
  }

  // Convert temperature based on unit code and location
  convertTemperature(value, unitCode, location = null) {
    if (value === null || value === undefined) return null;
    
    // First convert to Celsius
    let celsius;
    if (unitCode === 'wmoUnit:degC') {
      celsius = value;
    } else if (unitCode === 'wmoUnit:K') {
      celsius = value - 273.15;
    } else if (unitCode === 'wmoUnit:degF') {
      celsius = (value - 32) * 5/9;
    } else {
      celsius = value; // Default assumption: value is in Celsius
    }
    
    // Determine if location uses Fahrenheit (US locations)
    const useFahrenheit = this.shouldUseFahrenheit(location);
    
    if (useFahrenheit) {
      const fahrenheit = (celsius * 9/5) + 32;
      return {
        value: Math.round(fahrenheit * 10) / 10,
        unit: '°F'
      };
    } else {
      return {
        value: Math.round(celsius * 10) / 10,
        unit: '°C'
      };
    }
  }

  // Determine if location should use Fahrenheit
  shouldUseFahrenheit(location) {
    if (!location) {
      console.log('No location provided for Fahrenheit check');
      return false;
    }
    
    // Since NWS API only covers the United States, all locations should use Fahrenheit
    // But let's be more precise by checking coordinates for US territory
    if (location.lat && location.lon) {
      // US coordinates roughly: 24°N to 72°N, 66°W to 125°W
      const isUSLocation = location.lat >= 24 && location.lat <= 72 && 
                          location.lon >= -180 && location.lon <= -66;
      
      console.log('Location coordinates:', location.lat, location.lon);
      console.log('Is US location:', isUSLocation);
      
      return isUSLocation;
    }
    
    // Fallback: check location name for US states
    const usStates = [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
      'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
      'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
      'Wisconsin', 'Wyoming'
    ];
    
    const locationName = location.name || location.zone || '';
    console.log('Checking Fahrenheit for location:', locationName);
    
    const shouldUseF = usStates.some(state => locationName.includes(state));
    console.log('Should use Fahrenheit:', shouldUseF);
    
    return shouldUseF;
  }

  // Convert wind speed from m/s to km/h
  convertWindSpeed(mps) {
    if (mps === null || mps === undefined) return null;
    return Math.round(mps * 3.6);
  }

  // Convert visibility from meters to km
  convertVisibility(meters) {
    if (meters === null || meters === undefined) return null;
    return Math.round(meters / 1000 * 10) / 10;
  }

  // Estimate cloud cover from sky cover percentage
  estimateCloudCover(skyCover) {
    if (skyCover === null || skyCover === undefined) return null;
    return skyCover;
  }

  // Determine viewing conditions for astronomy
  determineViewingConditions(forecast, currentConditions) {
    const conditions = {
      visibility: 'Unknown',
      cloudCover: currentConditions.cloudCover || 0,
      windSpeed: currentConditions.windSpeed || 0,
      recommendation: 'Check local conditions'
    };

    // Check for bad weather conditions first
    const condition = currentConditions.condition?.toLowerCase() || '';
    const hasBadWeather = condition.includes('rain') || 
                         condition.includes('snow') || 
                         condition.includes('storm') || 
                         condition.includes('thunder') || 
                         condition.includes('shower') ||
                         condition.includes('drizzle');

    if (hasBadWeather) {
      conditions.visibility = 'Poor';
      conditions.recommendation = 'Weather conditions are not suitable for stargazing';
      return conditions;
    }

    // Check for fog or mist
    if (condition.includes('fog') || condition.includes('mist')) {
      conditions.visibility = 'Poor';
      conditions.recommendation = 'Foggy conditions reduce visibility';
      return conditions;
    }

    // Now check cloud cover for clear conditions
    if (currentConditions.cloudCover <= 20) {
      conditions.visibility = 'Excellent';
      conditions.recommendation = 'Perfect for stargazing!';
    } else if (currentConditions.cloudCover <= 40) {
      conditions.visibility = 'Good';
      conditions.recommendation = 'Good conditions for viewing';
    } else if (currentConditions.cloudCover <= 60) {
      conditions.visibility = 'Fair';
      conditions.recommendation = 'Some clouds may interfere';
    } else {
      conditions.visibility = 'Poor';
      conditions.recommendation = 'Too cloudy for optimal viewing';
    }

    // Adjust for wind conditions
    if (currentConditions.windSpeed > 30) {
      conditions.recommendation += ' - High winds may affect telescope stability';
    }

    // Adjust for humidity (high humidity can cause dew on optics)
    if (currentConditions.humidity > 80) {
      conditions.recommendation += ' - High humidity may cause dew on telescope optics';
    }

    return conditions;
  }

  // Determine weather condition
  determineCondition(observation) {
    const presentWeather = observation.presentWeather || [];
    const skyCover = observation.skyCover?.value;
    
    if (presentWeather.length > 0) {
      return presentWeather[0].value;
    } else if (skyCover <= 20) {
      return 'Clear';
    } else if (skyCover <= 40) {
      return 'Mostly Clear';
    } else if (skyCover <= 60) {
      return 'Partly Cloudy';
    } else if (skyCover <= 80) {
      return 'Mostly Cloudy';
    } else {
      return 'Cloudy';
    }
  }

  // Make HTTP request to NWS API
  async makeNWSRequest(url) {
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/geo+json'
      }
    });

    if (!response.ok) {
      throw new Error(`NWS HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Make HTTP request to WeatherAPI.com
  async makeWeatherApiRequest(url) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`WeatherAPI HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get weather icon based on conditions
  getWeatherIcon(condition) {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('clear')) return 'bi-sun-fill';
    if (conditionLower.includes('cloudy')) return 'bi-cloud-fill';
    if (conditionLower.includes('rain')) return 'bi-cloud-rain-fill';
    if (conditionLower.includes('snow')) return 'bi-cloud-snow-fill';
    if (conditionLower.includes('thunder')) return 'bi-lightning-fill';
    if (conditionLower.includes('fog')) return 'bi-cloud-fog-fill';
    
    return 'bi-sun-fill'; // default
  }

  // Get viewing recommendation color
  getViewingColor(visibility) {
    switch (visibility) {
      case 'Excellent': return 'text-success';
      case 'Good': return 'text-info';
      case 'Fair': return 'text-warning';
      case 'Poor': return 'text-danger';
      default: return 'text-muted';
    }
  }
}

// Export for use in main.js
export { WeatherService }; 