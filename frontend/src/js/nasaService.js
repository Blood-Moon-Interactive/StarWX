class NASAService {
  constructor() {
    this.apiKey = '5aUu02Y7qeM13AUdpsdQF8l8iXwYlaOCprDWMiW5';
    this.baseUrl = 'https://api.nasa.gov';
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

  // Get real astronomical events (comets, meteor showers, etc.)
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