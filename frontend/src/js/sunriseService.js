// Sunrise Sunset API Service
// Provides astronomical timing data for optimal observation planning

class SunriseService {
    constructor() {
        this.baseUrl = 'https://api.sunrise-sunset.org/json';
        this.data = null;
        this.error = null;
    }

    async fetchSunriseData(latitude, longitude) {
        try {
            const url = `${this.baseUrl}?lat=${latitude}&lng=${longitude}&formatted=0`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.data = data;
            this.error = null;
            return data;
        } catch (error) {
            console.error('Error fetching sunrise data:', error);
            this.error = error.message;
            return null;
        }
    }

    formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    getStargazingRecommendation() {
        if (!this.data) return null;
        
        const astronomicalTwilightEnd = new Date(this.data.results.astronomical_twilight_end);
        const now = new Date();
        const hoursUntilDark = (astronomicalTwilightEnd - now) / (1000 * 60 * 60);
        
        if (hoursUntilDark > 0) {
            return {
                message: `Best stargazing starts at ${this.formatTime(this.data.results.astronomical_twilight_end)}`,
                hoursUntil: Math.round(hoursUntilDark * 10) / 10
            };
        } else {
            return {
                message: "Perfect conditions for stargazing now!",
                hoursUntil: 0
            };
        }
    }

    getObservationPlan() {
        if (!this.data) return null;
        
        return {
            sunrise: this.formatTime(this.data.results.sunrise),
            sunset: this.formatTime(this.data.results.sunset),
            solarNoon: this.formatTime(this.data.results.solar_noon),
            dayLength: this.formatDuration(this.data.results.day_length),
            civilTwilightBegin: this.formatTime(this.data.results.civil_twilight_begin),
            civilTwilightEnd: this.formatTime(this.data.results.civil_twilight_end),
            nauticalTwilightBegin: this.formatTime(this.data.results.nautical_twilight_begin),
            nauticalTwilightEnd: this.formatTime(this.data.results.nautical_twilight_end),
            astronomicalTwilightBegin: this.formatTime(this.data.results.astronomical_twilight_begin),
            astronomicalTwilightEnd: this.formatTime(this.data.results.astronomical_twilight_end)
        };
    }

    getCurrentPhase() {
        if (!this.data) return null;
        
        const now = new Date();
        const sunrise = new Date(this.data.results.sunrise);
        const sunset = new Date(this.data.results.sunset);
        const astronomicalTwilightEnd = new Date(this.data.results.astronomical_twilight_end);
        
        if (now < sunrise) {
            return {
                phase: 'night',
                description: 'Night time - Good for stargazing',
                icon: '🌌'
            };
        } else if (now < sunset) {
            return {
                phase: 'day',
                description: 'Day time - Wait for sunset',
                icon: '☀️'
            };
        } else if (now < astronomicalTwilightEnd) {
            return {
                phase: 'twilight',
                description: 'Twilight - Getting darker',
                icon: '🌆'
            };
        } else {
            return {
                phase: 'dark',
                description: 'Dark - Perfect for stargazing',
                icon: '⭐'
            };
        }
    }
}

export default SunriseService; 