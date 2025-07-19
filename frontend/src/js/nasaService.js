class NASAService {
  constructor() {
    this.apiKey = '5aUu02Y7qeM13AUdpsdQF8l8iXwYlaOCprDWMiW5';
    this.baseUrl = 'https://api.nasa.gov';
    this.jplBaseUrl = 'https://ssd-api.jpl.nasa.gov';
  }

  // Get Astronomy Picture of the Day
  async getAstronomyPictureOfDay() {
    try {
      const response = await fetch(`${this.baseUrl}/planetary/apod?api_key=${this.apiKey}`);
      const data = await response.json();
      
      console.log('NASA APOD data:', data);
      
      return {
        title: data.title,
        date: data.date,
        explanation: data.explanation,
        imageUrl: data.url,
        mediaType: data.media_type,
        copyright: data.copyright
      };
    } catch (error) {
      console.error('Error fetching NASA APOD:', error);
      return null;
    }
  }

  // Get Near Earth Objects (asteroids, comets)
  async getNearEarthObjects(startDate, endDate) {
    try {
      const response = await fetch(
        `${this.baseUrl}/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${this.apiKey}`
      );
      const data = await response.json();
      
      console.log('NASA NEO data:', data);
      
      // Process the NEO data
      const neos = [];
      if (data.near_earth_objects) {
        Object.keys(data.near_earth_objects).forEach(date => {
          data.near_earth_objects[date].forEach(neo => {
            neos.push({
              id: neo.id,
              name: neo.name,
              date: date,
              distance: neo.close_approach_data[0]?.miss_distance?.kilometers,
              velocity: neo.close_approach_data[0]?.relative_velocity?.kilometers_per_hour,
              diameter: neo.estimated_diameter?.kilometers?.estimated_diameter_max,
              hazardous: neo.is_potentially_hazardous_asteroid,
              nasaUrl: neo.nasa_jpl_url
            });
          });
        });
      }
      
      return neos;
    } catch (error) {
      console.error('Error fetching NASA NEO data:', error);
      return [];
    }
  }

  // Get JPL Fireball Events (atmospheric impact events) - filtered for recent/upcoming
  async getFireballEvents(limit = 10) {
    try {
      const response = await fetch(`${this.jplBaseUrl}/fireball.api?limit=${limit}`);
      const data = await response.json();
      
      console.log('JPL Fireball data:', data);
      
      if (data.data && data.data.length > 0) {
        const now = new Date();
        const events = data.data
          .map(event => ({
            id: `fireball-${event[0].replace(/[^a-zA-Z0-9]/g, '')}`,
            date: event[0],
            eventDate: new Date(event[0]),
            energy: parseFloat(event[1]),
            impactEnergy: parseFloat(event[2]),
            latitude: `${event[3]}°${event[4]}`,
            longitude: `${event[5]}°${event[6]}`,
            altitude: parseFloat(event[7]),
            velocity: event[8] ? parseFloat(event[8]) : null,
            description: `Fireball event with ${event[1]} kt energy detected at ${event[3]}°${event[4]} ${event[5]}°${event[6]}`,
            type: 'Fireball Event',
            visibility: 'Atmospheric Impact'
          }))
          .filter(event => {
            // Show recent events (within last 30 days) and upcoming events
            const daysDiff = (now - event.eventDate) / (1000 * 60 * 60 * 24);
            return daysDiff >= -30 && daysDiff <= 30; // Within 30 days past or future
          })
          .sort((a, b) => a.eventDate - b.eventDate); // Sort by date
        
        return events.slice(0, limit);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching JPL Fireball data:', error);
      return [];
    }
  }

  // Get JPL Close Approach Events (enhanced NEO data) - filtered for upcoming
  async getCloseApproachEvents(limit = 10) {
    try {
      const response = await fetch(`${this.jplBaseUrl}/cad.api?limit=${limit * 2}`); // Get more to filter
      const data = await response.json();
      
      console.log('JPL Close Approach data:', data);
      
      if (data.data && data.data.length > 0) {
        const now = new Date();
        const events = data.data
          .map(event => ({
            id: `close-approach-${event[0].replace(/[^a-zA-Z0-9]/g, '')}`,
            name: event[0],
            date: event[3],
            eventDate: new Date(event[3]),
            distance: parseFloat(event[4]),
            distanceMin: parseFloat(event[5]),
            distanceMax: parseFloat(event[6]),
            relativeVelocity: parseFloat(event[7]),
            infiniteVelocity: parseFloat(event[8]),
            hMagnitude: parseFloat(event[10]),
            description: `${event[0]} will pass within ${(parseFloat(event[4]) * 149597870.7).toFixed(0)} km of Earth`,
            type: 'Close Approach',
            visibility: parseFloat(event[4]) < 0.05 ? 'Very Close' : 'Close Approach',
            distanceKm: parseFloat(event[4]) * 149597870.7 // Convert AU to km
          }))
          .filter(event => {
            // Show upcoming events (within next 90 days) and very recent past events
            const daysDiff = (event.eventDate - now) / (1000 * 60 * 60 * 24);
            return daysDiff >= -7 && daysDiff <= 90; // Within 7 days past or 90 days future
          })
          .sort((a, b) => a.eventDate - b.eventDate); // Sort by date
        
        return events.slice(0, limit);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching JPL Close Approach data:', error);
      return [];
    }
  }

  // Get JPL Sentry Risk Assessment Data - filtered for high-risk upcoming
  async getRiskAssessmentData(limit = 10) {
    try {
      const response = await fetch(`${this.jplBaseUrl}/sentry.api?limit=${limit * 2}`); // Get more to filter
      const data = await response.json();
      
      console.log('JPL Sentry data:', data);
      
      if (data.data && data.data.length > 0) {
        const events = data.data
          .map(event => ({
            id: `risk-${event.des.replace(/[^a-zA-Z0-9]/g, '')}`,
            name: event.fullname,
            designation: event.des,
            impactProbability: parseFloat(event.ps_cum),
            maxImpactProbability: parseFloat(event.ps_max),
            diameter: parseFloat(event.diameter),
            velocity: parseFloat(event.v_inf),
            lastObservation: event.last_obs,
            impactRange: event.range,
            numberOfImpacts: parseInt(event.n_imp),
            hMagnitude: parseFloat(event.h),
            description: `${event.fullname} has a ${(parseFloat(event.ps_cum) * 100).toFixed(6)}% chance of Earth impact`,
            type: 'Risk Assessment',
            visibility: parseFloat(event.ps_cum) > 0.001 ? 'High Risk' : 'Low Risk'
          }))
          .filter(event => {
            // Show only high-risk events or events with recent observations
            return event.impactProbability > 0.0001 || event.visibility === 'High Risk';
          })
          .sort((a, b) => b.impactProbability - a.impactProbability); // Sort by risk (highest first)
        
        return events.slice(0, limit);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching JPL Sentry data:', error);
      return [];
    }
  }

  // Get JPL NHATS Data (human-accessible NEOs) - filtered for upcoming opportunities
  async getNHATSData(limit = 10) {
    try {
      const response = await fetch(`${this.jplBaseUrl}/nhats.api?limit=${limit * 2}`); // Get more to filter
      const data = await response.json();
      
      console.log('JPL NHATS data:', data);
      
      if (data.data && data.data.length > 0) {
        const events = data.data
          .map(event => ({
            id: `nhats-${event.des.replace(/[^a-zA-Z0-9]/g, '')}`,
            name: event.des,
            hMagnitude: parseFloat(event.h),
            minDeltaV: parseFloat(event.min_dv?.dv),
            duration: parseInt(event.min_dv?.dur),
            maxSize: parseFloat(event.max_size),
            minSize: parseFloat(event.min_size),
            observationStart: event.obs_start,
            numberOfTrajectories: parseInt(event.n_via_traj),
            description: `${event.des} is accessible with ΔV of ${event.min_dv?.dv} km/s`,
            type: 'Human Accessible',
            visibility: 'Mission Target'
          }))
          .filter(event => {
            // Show only accessible targets with reasonable mission parameters
            return event.minDeltaV < 15 && event.duration < 1000; // Reasonable mission parameters
          })
          .sort((a, b) => a.minDeltaV - b.minDeltaV); // Sort by accessibility (lowest ΔV first)
        
        return events.slice(0, limit);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching JPL NHATS data:', error);
      return [];
    }
  }

  // Get enhanced astronomical events combining NASA and JPL data - with date range filtering
  async getEnhancedAstronomicalEvents(startDate = null, endDate = null) {
    try {
      // Get data from multiple sources
      const [fireballEvents, closeApproachEvents, riskEvents, nhatsEvents] = await Promise.all([
        this.getFireballEvents(10), // Get more to filter
        this.getCloseApproachEvents(15), // Get more to filter
        this.getRiskAssessmentData(5), // Get more to filter
        this.getNHATSData(5) // Get more to filter
      ]);
      
      // Combine all events
      let allEvents = [
        ...closeApproachEvents.map(event => ({ ...event, priority: 1 })),
        ...fireballEvents.map(event => ({ ...event, priority: 2 })),
        ...riskEvents.map(event => ({ ...event, priority: 3 })),
        ...nhatsEvents.map(event => ({ ...event, priority: 4 }))
      ];
      
      // Filter by date range if provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        allEvents = allEvents.filter(event => {
          if (!event.eventDate) return false;
          return event.eventDate >= start && event.eventDate <= end;
        });
      }
      
      // Sort by priority and date, return top events
      return allEvents
        .sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          // If same priority, sort by date (upcoming first)
          if (a.eventDate && b.eventDate) {
            return a.eventDate - b.eventDate;
          }
          return 0;
        })
        .slice(0, 12); // Show up to 12 events when filtered
        
    } catch (error) {
      console.error('Error fetching enhanced astronomical events:', error);
      return [];
    }
  }

  // Get Mars Rover Photos (for space exploration content)
  async getMarsRoverPhotos(sol = 1000, camera = 'all') {
    try {
      const response = await fetch(
        `${this.baseUrl}/mars-photos/api/v1/rovers/curiosity/photos?sol=${sol}&camera=${camera}&api_key=${this.apiKey}`
      );
      const data = await response.json();
      
      console.log('NASA Mars Rover data:', data);
      
      return data.photos?.slice(0, 5).map(photo => ({
        id: photo.id,
        imgSrc: photo.img_src,
        earthDate: photo.earth_date,
        sol: photo.sol,
        camera: photo.camera.full_name,
        rover: photo.rover.name
      })) || [];
    } catch (error) {
      console.error('Error fetching NASA Mars Rover data:', error);
      return [];
    }
  }

  // Get EPIC (Earth Polychromatic Imaging Camera) data
  async getEarthImages() {
    try {
      const response = await fetch(`${this.baseUrl}/EPIC/api/natural/latest?api_key=${this.apiKey}`);
      const data = await response.json();
      
      console.log('NASA EPIC data:', data);
      
      return data.slice(0, 3).map(image => ({
        identifier: image.identifier,
        caption: image.caption,
        version: image.version,
        date: image.date,
        imageUrl: `https://epic.gsfc.nasa.gov/archive/natural/${image.date.split(' ')[0].split('-').join('/')}/png/${image.image}.png`
      }));
    } catch (error) {
      console.error('Error fetching NASA EPIC data:', error);
      return [];
    }
  }

  // Get real astronomical events (comets, meteor showers, etc.) - Legacy method
  async getAstronomicalEvents() {
    try {
      // Get current date and next 30 days
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30);
      
      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Get NEOs for the next 30 days
      const neos = await this.getNearEarthObjects(startDateStr, endDateStr);
      
      // Filter for interesting events (close approaches, large objects)
      const interestingEvents = neos
        .filter(neo => 
          neo.hazardous || 
          parseFloat(neo.distance) < 5000000 || // Within 5 million km
          parseFloat(neo.diameter) > 0.1 // Larger than 100m
        )
        .slice(0, 5)
        .map(neo => ({
          id: neo.id,
          name: neo.name,
          date: neo.date,
          description: `${neo.name} will pass within ${Math.round(parseFloat(neo.distance) / 1000000)} million km of Earth`,
          visibility: neo.hazardous ? 'Hazardous' : 'Close Approach',
          type: 'Near Earth Object',
          distance: neo.distance,
          diameter: neo.diameter
        }));
      
      return interestingEvents;
    } catch (error) {
      console.error('Error fetching astronomical events:', error);
      return [];
    }
  }

  // Get DONKI space weather events
  async getDONKIEvents(startDate, endDate) {
    try {
      const response = await fetch(
        `${this.baseUrl}/DONKI/notifications?startDate=${startDate}&endDate=${endDate}&type=all&api_key=${this.apiKey}`
      );
      const data = await response.json();
      
      console.log('NASA DONKI data:', data);
      
      return data || [];
    } catch (error) {
      console.error('Error fetching DONKI events:', error);
      return [];
    }
  }

  // Get specific DONKI event types
  async getSolarFlares(startDate, endDate) {
    try {
      const response = await fetch(
        `${this.baseUrl}/DONKI/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${this.apiKey}`
      );
      const data = await response.json();
      
      console.log('NASA Solar Flare data:', data);
      
      return data || [];
    } catch (error) {
      console.error('Error fetching solar flare data:', error);
      return [];
    }
  }

  // Get Coronal Mass Ejections
  async getCoronalMassEjections(startDate, endDate) {
    try {
      const response = await fetch(
        `${this.baseUrl}/DONKI/CME?startDate=${startDate}&endDate=${endDate}&api_key=${this.apiKey}`
      );
      const data = await response.json();
      
      console.log('NASA CME data:', data);
      
      return data || [];
    } catch (error) {
      console.error('Error fetching CME data:', error);
      return [];
    }
  }

  // Get Geomagnetic Storms
  async getGeomagneticStorms(startDate, endDate) {
    try {
      const response = await fetch(
        `${this.baseUrl}/DONKI/GST?startDate=${startDate}&endDate=${endDate}&api_key=${this.apiKey}`
      );
      const data = await response.json();
      
      console.log('NASA Geomagnetic Storm data:', data);
      
      return data || [];
    } catch (error) {
      console.error('Error fetching geomagnetic storm data:', error);
      return [];
    }
  }

  // Get comprehensive space weather events
  async getSpaceWeatherEvents() {
    try {
      // Get current date and next 7 days
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 7);
      
      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Get all space weather events
      const [flares, cmes, storms] = await Promise.all([
        this.getSolarFlares(startDateStr, endDateStr),
        this.getCoronalMassEjections(startDateStr, endDateStr),
        this.getGeomagneticStorms(startDateStr, endDateStr)
      ]);
      
      // Combine and format events
      const events = [];
      
      // Add solar flares
      flares.forEach(flare => {
        events.push({
          id: `flare-${flare.flrID}`,
          name: `Solar Flare - ${flare.classType || 'Unknown Class'}`,
          date: flare.beginTime?.split('T')[0] || 'Unknown',
          description: `Solar flare detected with class ${flare.classType || 'Unknown'}. Activity level: ${flare.activityID || 'Unknown'}`,
          visibility: this.getFlareVisibility(flare.classType),
          type: 'Solar Flare',
          intensity: flare.classType,
          beginTime: flare.beginTime,
          endTime: flare.endTime
        });
      });
      
      // Add CMEs
      cmes.forEach(cme => {
        events.push({
          id: `cme-${cme.activityID}`,
          name: `Coronal Mass Ejection`,
          date: cme.startTime?.split('T')[0] || 'Unknown',
          description: `CME detected with speed ${cme.speed || 'Unknown'} km/s. Direction: ${cme.type || 'Unknown'}`,
          visibility: 'High Impact',
          type: 'Coronal Mass Ejection',
          speed: cme.speed,
          direction: cme.type
        });
      });
      
      // Add geomagnetic storms
      storms.forEach(storm => {
        events.push({
          id: `storm-${storm.gstID}`,
          name: `Geomagnetic Storm - ${storm.scale || 'Unknown Scale'}`,
          date: storm.startTime?.split('T')[0] || 'Unknown',
          description: `Geomagnetic storm with scale ${storm.scale || 'Unknown'}. Kp index: ${storm.kp || 'Unknown'}`,
          visibility: this.getStormVisibility(storm.scale),
          type: 'Geomagnetic Storm',
          scale: storm.scale,
          kpIndex: storm.kp
        });
      });
      
      // Sort by date and return most recent
      return events
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
        
    } catch (error) {
      console.error('Error fetching space weather events:', error);
      return [];
    }
  }

  // Helper methods for space weather
  getFlareVisibility(classType) {
    if (!classType) return 'Unknown';
    
    const classMap = {
      'X': 'Extreme',
      'M': 'High',
      'C': 'Moderate',
      'B': 'Low',
      'A': 'Very Low'
    };
    
    return classMap[classType.charAt(0)] || 'Unknown';
  }

  getStormVisibility(scale) {
    if (!scale) return 'Unknown';
    
    const scaleMap = {
      'G5': 'Extreme',
      'G4': 'Severe',
      'G3': 'Strong',
      'G2': 'Moderate',
      'G1': 'Minor'
    };
    
    return scaleMap[scale] || 'Unknown';
  }

  // Get space exploration content
  async getSpaceExplorationContent() {
    try {
      const [apod, marsPhotos, earthImages] = await Promise.all([
        this.getAstronomyPictureOfDay(),
        this.getMarsRoverPhotos(),
        this.getEarthImages()
      ]);
      
      return {
        apod,
        marsPhotos,
        earthImages
      };
    } catch (error) {
      console.error('Error fetching space exploration content:', error);
      return {};
    }
  }
}

export { NASAService }; 