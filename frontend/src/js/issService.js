// ISS Service for StarWX - Real-time ISS tracking
class ISSService {
  constructor() {
    this.baseUrl = 'https://api.wheretheiss.at/v1';
    this.issId = 25544; // NORAD ID for ISS
  }

  // Get current ISS position
  async getCurrentISSPosition() {
    try {
      const response = await fetch(`${this.baseUrl}/satellites/${this.issId}`);
      const data = await response.json();
      
      console.log('ISS Current Position:', data);
      
      return {
        name: data.name,
        id: data.id,
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude,
        velocity: data.velocity,
        visibility: data.visibility,
        footprint: data.footprint,
        timestamp: data.timestamp,
        solarLat: data.solar_lat,
        solarLon: data.solar_lon,
        units: data.units
      };
    } catch (error) {
      console.error('Error fetching ISS position:', error);
      throw error;
    }
  }

  // Get ISS positions for multiple timestamps (for pass predictions)
  async getISSPositions(timestamps) {
    try {
      const timestampsParam = timestamps.join(',');
      const response = await fetch(`${this.baseUrl}/satellites/${this.issId}/positions?timestamps=${timestampsParam}`);
      const data = await response.json();
      
      console.log('ISS Positions:', data);
      
      return data.map(position => ({
        name: position.name,
        id: position.id,
        latitude: position.latitude,
        longitude: position.longitude,
        altitude: position.altitude,
        velocity: position.velocity,
        visibility: position.visibility,
        footprint: position.footprint,
        timestamp: position.timestamp,
        solarLat: position.solar_lat,
        solarLon: position.solar_lon,
        units: position.units
      }));
    } catch (error) {
      console.error('Error fetching ISS positions:', error);
      throw error;
    }
  }

  // Calculate if ISS is visible from user location
  calculateISSVisibility(issPosition, userLocation) {
    if (!userLocation || !issPosition) return null;
    
    const { lat: userLat, lon: userLon } = userLocation;
    const { latitude: issLat, longitude: issLon, altitude: issAltitude, visibility: issVisibility } = issPosition;
    
    // Calculate distance from user to ISS ground track
    const distance = this.calculateDistance(userLat, userLon, issLat, issLon);
    
    // ISS is typically visible when:
    // 1. It's within ~2000 km of the observer
    // 2. It's in darkness (not in daylight)
    // 3. It's above the horizon (altitude > 0)
    const isVisible = distance <= 2000 && issVisibility === 'nighttime';
    
    return {
      isVisible,
      distance: distance,
      altitude: issAltitude,
      visibility: issVisibility,
      direction: this.getDirection(userLat, userLon, issLat, issLon),
      reason: isVisible ? 
        `ISS visible ${distance.toFixed(0)} km away` : 
        `ISS ${distance.toFixed(0)} km away, ${issVisibility === 'daylight' ? 'in daylight' : 'too far'}`
    };
  }

  // Generate pass predictions for the next 24 hours
  async getISSPassPredictions(userLocation, hours = 24) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const timestamps = [];
      
      // Generate timestamps for the next 24 hours (every 10 minutes)
      for (let i = 0; i < hours * 6; i++) {
        timestamps.push(now + (i * 600)); // 10 minutes intervals
      }
      
      const positions = await this.getISSPositions(timestamps);
      
      // Find visible passes
      const passes = [];
      let currentPass = null;
      
      for (const position of positions) {
        const visibility = this.calculateISSVisibility(position, userLocation);
        
        if (visibility && visibility.isVisible) {
          if (!currentPass) {
            // Start of a new pass
            currentPass = {
              startTime: position.timestamp,
              startPosition: position,
              maxAltitude: position.altitude,
              maxDistance: visibility.distance
            };
          } else {
            // Continue current pass
            if (position.altitude > currentPass.maxAltitude) {
              currentPass.maxAltitude = position.altitude;
            }
            if (visibility.distance < currentPass.maxDistance) {
              currentPass.maxDistance = visibility.distance;
            }
          }
        } else if (currentPass) {
          // End of current pass
          currentPass.endTime = position.timestamp;
          currentPass.endPosition = position;
          currentPass.duration = currentPass.endTime - currentPass.startTime;
          passes.push(currentPass);
          currentPass = null;
        }
      }
      
      return passes;
    } catch (error) {
      console.error('Error generating ISS pass predictions:', error);
      return [];
    }
  }

  // Calculate distance between two points on Earth
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // Get direction from user to ISS
  getDirection(userLat, userLon, issLat, issLon) {
    const dLon = this.toRadians(issLon - userLon);
    const lat1 = this.toRadians(userLat);
    const lat2 = this.toRadians(issLat);
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const bearing = Math.atan2(y, x);
    
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing * 4 / Math.PI + 4) % 8;
    return directions[index];
  }

  // Format timestamp for display
  formatTimestamp(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
  }

  // Get ISS status for display
  getISSStatus(issPosition) {
    if (!issPosition) return 'Unknown';
    
    const now = Math.floor(Date.now() / 1000);
    const age = now - issPosition.timestamp;
    
    if (age < 60) return 'Live';
    if (age < 300) return 'Recent';
    return 'Stale';
  }
}

export default ISSService; 