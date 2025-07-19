// Main application logic for StarWX
import { NASAService } from './nasaService.js';
import { WeatherService } from './weatherService.js';
import ISSService from './issService.js';
import SunriseService from './sunriseService.js';
import './copernicusService.js';

class StarWXApp {
  constructor() {
    this.nasaService = new NASAService();
    this.weatherService = new WeatherService();
    this.issService = new ISSService();
    this.sunriseService = new SunriseService();
    this.copernicusService = new CopernicusService();
    this.currentLocation = null;
    
    this.init();
  }

  async init() {
    console.log('StarWX App initializing...');
    
    // Prevent any automatic scrolling
    this.preventAutoScroll();
    
    // Initialize event listeners
    this.setupEventListeners();
    
    // Load initial data
    await this.loadDashboardData();
    
    console.log('StarWX App initialized successfully');
  }

  preventAutoScroll() {
    // Prevent automatic scrolling to hash fragments
    if (window.location.hash) {
      history.replaceState(null, null, window.location.pathname);
    }
    
    // Prevent scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Ensure page starts at top
    window.scrollTo(0, 0);
  }

  setupEventListeners() {
    // Location input and buttons
    const locationInput = document.getElementById('locationInput');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const searchLocationBtn = document.getElementById('searchLocationBtn');
    
    if (getLocationBtn) {
      getLocationBtn.addEventListener('click', () => this.getUserLocation());
    }
    
    if (searchLocationBtn) {
      searchLocationBtn.addEventListener('click', () => {
        if (locationInput) {
          this.handleLocationSearch(locationInput.value);
        }
      });
    }
    
    if (locationInput) {
      locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleLocationSearch(locationInput.value);
        }
      });
    }
    
    // APOD navigation link
    const apodLink = document.querySelector('a[href="#apod"]');
    if (apodLink) {
      apodLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showAPODModal();
      });
    }
    
    // Dashboard date filter event listeners
    this.setupDashboardDateFilterListeners();
  }

  async getUserLocation() {
    try {
      console.log('Getting user location...');
      
      // Show loading state
      this.showSearchLoading(true);
      
      const position = await this.getCurrentPosition();
      this.currentLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };
      
      // Update location input with a user-friendly message
      const locationInput = document.getElementById('locationInput');
      if (locationInput) {
        locationInput.value = 'Your Location';
        locationInput.placeholder = 'Your Location';
      }
      
      // Update location status
      this.updateLocationStatus();
      
      // Load weather, sunrise, and environmental data for current location
      await this.loadWeatherData();
      await this.loadSunriseData();
      await this.loadEnvironmentalData();
      
      // Show astronomical data panel and load data
      this.showAstronomicalDataPanel();
      await this.loadDashboardData();
      
      // Hide loading state
      this.showSearchLoading(false);
      
    } catch (error) {
      console.error('Error getting location:', error);
      this.showSearchLoading(false);
      this.showMessage('Unable to get your location. Please enter it manually.', 'warning');
    }
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });
  }

  async handleLocationSearch(location) {
    if (!location.trim()) {
      this.showMessage('Please enter a location', 'warning');
      return;
    }
    
    // Basic validation to prevent obviously invalid searches
    if (location.length < 2) {
      this.showMessage('Please enter a longer location name', 'warning');
      return;
    }
    
    // Check for common invalid inputs
    const invalidPatterns = [
      /^[0-9]+$/, // Just numbers
      /^[a-zA-Z]{1,2}$/, // Very short text
      /^[^a-zA-Z0-9\s]+$/, // Only special characters
      /^test$/i, // Test inputs
      /^mybutt$/i, // Your example
      /^asdf$/i, // Common test input
      /^qwerty$/i, // Common test input
    ];
    
    for (const pattern of invalidPatterns) {
      if (pattern.test(location.trim())) {
        this.showMessage('Please enter a valid location name (city, state, country, etc.)', 'warning');
        return;
      }
    }
    
    try {
      console.log('Geocoding location:', location);
      
      // Show loading state with spinner
      this.showSearchLoading(true);
      
      // Geocode the location using Nominatim API
      const coordinates = await this.geocodeLocation(location);
      
      if (!coordinates) {
        this.showSearchLoading(false);
        this.showMessage('Location not found. Please try a different search term.', 'warning');
        return;
      }
      
      this.currentLocation = coordinates;
      
      // Update location input with the found location name
      const locationInput = document.getElementById('locationInput');
      if (locationInput) {
        locationInput.value = coordinates.displayName || location;
        locationInput.placeholder = 'Enter location...';
      }
      
      // Update location status
      this.updateLocationStatus();
      
      // Load weather, sunrise, and environmental data for the geocoded location
      await this.loadWeatherData();
      await this.loadSunriseData();
      await this.loadEnvironmentalData();
      
      // Show astronomical data panel and load data
      this.showAstronomicalDataPanel();
      await this.loadDashboardData();
      
    } catch (error) {
      console.error('Error handling location search:', error);
      this.showSearchLoading(false);
      this.showMessage('Error processing location. Please try again.', 'error');
    }
  }

  async geocodeLocation(location) {
    try {
      // Use Nominatim API (OpenStreetMap) for geocoding
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&addressdetails=1`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        console.log('No results found for location:', location);
        return null;
      }
      
      const result = data[0];
      console.log('Geocoding result:', result);
      
      // Extract coordinates and display name
      const coordinates = {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        displayName: result.display_name || location
      };
      
      // Validate coordinates
      if (isNaN(coordinates.lat) || isNaN(coordinates.lon)) {
        console.error('Invalid coordinates returned:', coordinates);
        return null;
      }
      
      // Check if coordinates are reasonable (not in the middle of nowhere)
      if (coordinates.lat === 0 && coordinates.lon === 0) {
        console.warn('Suspicious coordinates (0,0) returned');
        return null;
      }
      
      // Additional validation: check if coordinates are within reasonable bounds
      if (coordinates.lat < -90 || coordinates.lat > 90 || 
          coordinates.lon < -180 || coordinates.lon > 180) {
        console.error('Coordinates out of valid range:', coordinates);
        return null;
      }
      
      // Check if the result seems relevant (not just a random point)
      const relevanceScore = this.calculateRelevanceScore(location, result);
      if (relevanceScore < 0.3) {
        console.warn('Low relevance score for location:', location, 'Score:', relevanceScore);
        // Still return the result but log the warning
      }
      
      return coordinates;
      
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  calculateRelevanceScore(searchTerm, result) {
    // Simple relevance scoring based on how well the search term matches the result
    const searchLower = searchTerm.toLowerCase();
    const displayName = result.display_name.toLowerCase();
    
    // Check if search terms appear in the display name
    const searchWords = searchLower.split(/\s+/).filter(word => word.length > 2);
    let matches = 0;
    
    for (const word of searchWords) {
      if (displayName.includes(word)) {
        matches++;
      }
    }
    
    // Calculate relevance score (0-1)
    const relevanceScore = searchWords.length > 0 ? matches / searchWords.length : 0;
    
    return relevanceScore;
  }

  async loadWeatherData() {
    if (!this.currentLocation) return;
    
    try {
      const weatherData = await this.weatherService.getCurrentWeather(
        this.currentLocation.lat, 
        this.currentLocation.lon
      );
      
      // Store current weather data for use in other methods
      this.currentWeatherData = weatherData;
      
      this.updateWeatherDisplay(weatherData);
    } catch (error) {
      console.error('Error loading weather data:', error);
      this.showMessage('Error loading weather data', 'error');
    }
  }

  async loadSunriseData() {
    if (!this.currentLocation) {
      console.log('No location set, skipping sunrise data load');
      return;
    }
    
    try {
      console.log('Loading sunrise data for location:', this.currentLocation);
      const sunriseData = await this.sunriseService.fetchSunriseData(
        this.currentLocation.lat,
        this.currentLocation.lon
      );
      
      console.log('Sunrise data received:', sunriseData);
      
      if (sunriseData) {
        this.updateSunriseDisplay(sunriseData);
      } else {
        console.warn('No sunrise data received');
      }
    } catch (error) {
      console.error('Error loading sunrise data:', error);
    }
  }

  async loadEnvironmentalData() {
    try {
      console.log('Loading environmental data from Copernicus...');
      const environmentalData = await this.copernicusService.getEnvironmentalData();
      
      if (environmentalData) {
        this.updateEnvironmentalDisplay(environmentalData);
      }
    } catch (error) {
      console.error('Error loading environmental data:', error);
    }
  }

  updateWeatherDisplay(weatherData) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    const weatherSummary = document.getElementById('weatherSummary');
    
    if (!weatherData) return;
    
    // Round humidity to 1 decimal place
    const roundedHumidity = Math.round(weatherData.humidity * 10) / 10;
    
    // Get current date range for display
    const dateRangeSelect = document.getElementById('dateRangeSelect');
    let dateRangeText = 'Current conditions';
    if (dateRangeSelect) {
      switch (dateRangeSelect.value) {
        case 'tonight':
          dateRangeText = 'Tonight';
          break;
        case 'week':
          dateRangeText = 'This Week';
          break;
        case 'month':
          dateRangeText = 'This Month';
          break;
        case 'custom':
          const startDateInput = document.getElementById('startDate');
          const endDateInput = document.getElementById('endDate');
          if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
            dateRangeText = `${startDateInput.value} to ${endDateInput.value}`;
          } else {
            dateRangeText = 'Custom Range';
          }
          break;
      }
    }
    
    // Update weather summary with ultra-compact view for single viewport
    if (weatherSummary) {
      weatherSummary.innerHTML = `
        <div class="text-center mb-3">
          <h4 class="mb-2">${weatherData.temperatureFahrenheit}°F</h4>
          <p class="mb-2 small">${weatherData.description}</p>
          <span class="badge ${this.getViewingConditionClass(weatherData)} mb-3">
            ${this.getViewingConditionText(weatherData)}
          </span>
        </div>
        <div class="row text-center">
          <div class="col-4 mb-2">
            <i class="bi bi-cloud text-info fs-5"></i>
            <div class="small"><strong>${weatherData.cloudCover}%</strong></div>
            <div class="small text-muted">Clouds</div>
          </div>
          <div class="col-4 mb-2">
            <i class="bi bi-droplet text-primary fs-5"></i>
            <div class="small"><strong>${roundedHumidity}%</strong></div>
            <div class="small text-muted">Humidity</div>
          </div>
          <div class="col-4 mb-2">
            <i class="bi bi-wind text-success fs-5"></i>
            <div class="small"><strong>${weatherData.windSpeed}</strong></div>
            <div class="small text-muted">Wind</div>
          </div>
        </div>
      `;
    }
  }

  getViewingConditionClass(weatherData) {
    // Simple logic for viewing conditions
    if (weatherData.cloudCover < 20) return 'bg-success';
    if (weatherData.cloudCover < 50) return 'bg-warning';
    return 'bg-danger';
  }

  getViewingConditionText(weatherData) {
    if (weatherData.cloudCover < 20) return 'Excellent Viewing';
    if (weatherData.cloudCover < 50) return 'Good Viewing';
    return 'Poor Viewing';
  }

  updateSunriseDisplay(sunriseData) {
    console.log('Updating sunrise display with data:', sunriseData);
    
    const observationPlan = this.sunriseService.getObservationPlan();
    const currentPhase = this.sunriseService.getCurrentPhase();
    const stargazingRecommendation = this.sunriseService.getStargazingRecommendation();
    
    console.log('Observation plan:', observationPlan);
    console.log('Current phase:', currentPhase);
    console.log('Stargazing recommendation:', stargazingRecommendation);
    
    if (!observationPlan || !currentPhase) {
      console.warn('Missing observation plan or current phase data');
      return;
    }
    
    // Create ultra-compact sunrise display HTML for single viewport
    const sunriseHTML = `
      <div class="text-center mb-3">
        <div class="fs-2 mb-2">${currentPhase.icon}</div>
        <h6 class="mb-2">${currentPhase.description}</h6>
        ${stargazingRecommendation ? `
          <div class="mb-3">
            <small class="text-muted">
              <i class="bi bi-stars"></i> ${stargazingRecommendation.message}
            </small>
          </div>
        ` : ''}
      </div>
      <div class="row text-center">
        <div class="col-6 mb-2">
          <div class="small">
            <strong>Sunrise</strong><br>
            ${observationPlan.sunrise}
          </div>
        </div>
        <div class="col-6 mb-2">
          <div class="small">
            <strong>Sunset</strong><br>
            ${observationPlan.sunset}
          </div>
        </div>
        <div class="col-6 mb-2">
          <div class="small">
            <strong>Best Viewing</strong><br>
            ${observationPlan.astronomicalTwilightEnd}
          </div>
        </div>
        <div class="col-6 mb-2">
          <div class="small">
            <strong>Day Length</strong><br>
            ${observationPlan.dayLength}
          </div>
        </div>
      </div>
    `;
    
    // Find sunrise display container (now in the HTML structure)
    let sunriseContainer = document.getElementById('sunriseDisplay');
    if (!sunriseContainer) {
      console.warn('Could not find sunriseDisplay container');
      return;
    }
    
    if (sunriseContainer) {
      sunriseContainer.innerHTML = sunriseHTML;
      console.log('Updated sunrise display with HTML');
      
      // Force a reflow to ensure the display is visible
      sunriseContainer.style.display = 'block';
      sunriseContainer.offsetHeight; // Trigger reflow
    } else {
      console.warn('Could not find or create sunrise display container');
    }
  }

  updateEnvironmentalDisplay(environmentalData) {
    console.log('Updating environmental display with data:', environmentalData);
    
    const recommendations = this.copernicusService.generateStargazingRecommendations(environmentalData);
    const insights = this.copernicusService.generateStargazingInsights(environmentalData);
    
    if (recommendations.length === 0) {
      console.log('No environmental data available');
      return;
    }
    
    // Create compact environmental insights for the main weather card
    const environmentalInsights = insights.slice(0, 2).map(insight => `
      <div class="col-6 mb-2">
        <div class="text-center">
          <div class="small text-muted">${insight.icon} ${insight.type}</div>
          <div class="small"><strong>${insight.confidence}</strong></div>
        </div>
      </div>
    `).join('');
    
    // Add environmental insights to the weather summary if available
    const weatherSummary = document.getElementById('weatherSummary');
    if (weatherSummary && environmentalInsights) {
      const currentContent = weatherSummary.innerHTML;
      const environmentalSection = `
        <div class="row mt-3 pt-3 border-top">
          <div class="col-12">
            <div class="small text-muted mb-2">
              <i class="bi bi-globe"></i> Environmental Data
            </div>
            <div class="row">
              ${environmentalInsights}
            </div>
          </div>
        </div>
      `;
      
      // Only add if not already present
      if (!currentContent.includes('Environmental Data')) {
        weatherSummary.innerHTML += environmentalSection;
      }
    }
  }

  async showAPODModal() {
    try {
      console.log('Loading APOD for modal...');
      const apod = await this.nasaService.getAstronomyPictureOfDay();
      this.displayAPODModal(apod);
    } catch (error) {
      console.error('Error loading APOD:', error);
      this.displayAPODErrorModal();
    }
  }

  displayAPODModal(apod) {
    if (!apod) {
      this.displayAPODErrorModal();
      return;
    }

    // Create modal HTML
    const modalHTML = `
      <div class="modal fade" id="apodModal" tabindex="-1" aria-labelledby="apodModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content bg-dark text-white">
            <div class="modal-header border-secondary">
              <h5 class="modal-title" id="apodModalLabel">Astronomy Picture of the Day</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="text-center">
                <img src="${apod.imageUrl}" 
                     alt="${apod.title}" 
                     class="img-fluid rounded shadow-lg apod-modal-image" 
                     style="max-height: 60vh; cursor: pointer;"
                     onclick="window.open('${apod.imageUrl}', '_blank')"
                     title="Click to view full size">
                <div class="mt-4">
                  <h4>${apod.title}</h4>
                  <p class="text-muted">${apod.date}</p>
                  <p class="apod-explanation">${apod.explanation}</p>
                  ${apod.copyright ? `<p class="text-muted"><small>Copyright: ${apod.copyright}</small></p>` : ''}
                </div>
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" onclick="window.open('${apod.imageUrl}', '_blank')">
                <i class="bi bi-box-arrow-up-right"></i> View Full Size
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('apodModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('apodModal'));
    modal.show();

    // Clean up modal when hidden
    document.getElementById('apodModal').addEventListener('hidden.bs.modal', function () {
      this.remove();
    });
  }

  displayAPODErrorModal() {
    const modalHTML = `
      <div class="modal fade" id="apodModal" tabindex="-1" aria-labelledby="apodModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content bg-dark text-white">
            <div class="modal-header border-secondary">
              <h5 class="modal-title" id="apodModalLabel">Astronomy Picture of the Day</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
              <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
              <h4 class="mt-3 text-warning">Unable to Load APOD</h4>
              <p class="text-muted">There was an error loading today's astronomy picture. Please try again later.</p>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('apodModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('apodModal'));
    modal.show();

    // Clean up modal when hidden
    document.getElementById('apodModal').addEventListener('hidden.bs.modal', function () {
      this.remove();
    });
  }

  async loadAstronomicalEvents(startDate = null, endDate = null) {
    try {
      console.log('Loading enhanced astronomical events...', { startDate, endDate, location: this.currentLocation });
      
      // Get enhanced astronomical events from JPL API with optional date and location filtering
      const [spaceWeather, enhancedEvents] = await Promise.all([
        this.nasaService.getSpaceWeatherEvents(),
        this.nasaService.getEnhancedAstronomicalEvents(startDate, endDate, this.currentLocation)
      ]);
      
      this.displayAstronomicalEvents(spaceWeather, enhancedEvents, startDate, endDate);
      
    } catch (error) {
      console.error('Error loading enhanced astronomical events:', error);
      this.displayAstronomicalEventsError();
    }
  }

  displayAstronomicalEvents(spaceWeather, enhancedEvents, startDate = null, endDate = null, useLocationFilter = false) {
    const eventsContainer = document.getElementById('eventsContainer');
    if (!eventsContainer) return;
    
    let eventsHTML = '';
    let hasEvents = false;
    
    // Add filter status header
    let filterInfo = [];
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString();
      const end = new Date(endDate).toLocaleDateString();
      filterInfo.push(`Date: ${start} to ${end}`);
    }
    if (useLocationFilter && this.currentLocation) {
      const lat = this.currentLocation.lat.toFixed(4);
      const lon = this.currentLocation.lon.toFixed(4);
      filterInfo.push(`Location: ${lat}°, ${lon}°`);
    }
    
    if (filterInfo.length > 0) {
      eventsHTML += `
        <div class="col-12 mb-4">
          <div class="alert alert-info">
            <i class="bi bi-funnel"></i> 
            <strong>Active Filters:</strong> ${filterInfo.join(' | ')}
            <button type="button" class="btn-close float-end" id="clearDateFilter"></button>
          </div>
        </div>
      `;
    }
    
    // Add space weather events
    if (spaceWeather && spaceWeather.length > 0) {
      hasEvents = true;
      spaceWeather.slice(0, 3).forEach(event => {
        eventsHTML += `
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-body">
                <h6 class="card-title">${event.name}</h6>
                <p class="card-text">${event.description}</p>
                <span class="badge ${this.getEventVisibilityClass(event.visibility)}">
                  ${event.visibility}
                </span>
                <small class="text-muted d-block mt-2">${event.date}</small>
              </div>
            </div>
          </div>
        `;
      });
    }
    
    // Add enhanced astronomical events (JPL data)
    if (enhancedEvents && enhancedEvents.length > 0) {
      hasEvents = true;
      enhancedEvents.forEach(event => {
        // Create additional details based on event type
        let additionalInfo = '';
        if (event.type === 'Fireball Event') {
          additionalInfo = `
            <div class="mt-2">
              <small class="text-muted">
                <i class="bi bi-lightning"></i> Energy: ${event.energy} kt<br>
                <i class="bi bi-geo-alt"></i> Location: ${event.latitude} ${event.longitude}<br>
                <i class="bi bi-arrow-up"></i> Altitude: ${event.altitude} km
              </small>
            </div>
          `;
        } else if (event.type === 'Close Approach') {
          additionalInfo = `
            <div class="mt-2">
              <small class="text-muted">
                <i class="bi bi-arrow-right"></i> Distance: ${event.distanceKm?.toFixed(0)} km<br>
                <i class="bi bi-speedometer2"></i> Velocity: ${event.relativeVelocity?.toFixed(1)} km/s<br>
                <i class="bi bi-eye"></i> Magnitude: ${event.hMagnitude?.toFixed(1)}
              </small>
            </div>
          `;
        } else if (event.type === 'Risk Assessment') {
          additionalInfo = `
            <div class="mt-2">
              <small class="text-muted">
                <i class="bi bi-exclamation-triangle"></i> Impact Probability: ${(event.impactProbability * 100).toFixed(6)}%<br>
                <i class="bi bi-rulers"></i> Diameter: ${event.diameter?.toFixed(1)} m<br>
                <i class="bi bi-calendar"></i> Last Obs: ${event.lastObservation}
              </small>
            </div>
          `;
        } else if (event.type === 'Human Accessible') {
          additionalInfo = `
            <div class="mt-2">
              <small class="text-muted">
                <i class="bi bi-rocket"></i> ΔV: ${event.minDeltaV?.toFixed(1)} km/s<br>
                <i class="bi bi-clock"></i> Duration: ${event.duration} days<br>
                <i class="bi bi-rulers"></i> Size: ${event.minSize?.toFixed(0)}-${event.maxSize?.toFixed(0)} m
              </small>
            </div>
          `;
        }
        
        // Add location visibility info if available
        let locationInfo = '';
        if (event.visibilityFromLocation) {
          const visibility = event.visibilityFromLocation;
          locationInfo = `
            <div class="mt-2">
              <small class="text-success">
                <i class="bi bi-eye"></i> ${visibility.reason}
                ${visibility.distance ? ` (${visibility.distance.toFixed(0)} km)` : ''}
                ${visibility.direction ? ` - Direction: ${visibility.direction}` : ''}
              </small>
            </div>
          `;
        }
        
        eventsHTML += `
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-body">
                <h6 class="card-title">${event.name || event.type}</h6>
                <p class="card-text">${event.description}</p>
                <span class="badge ${this.getEventVisibilityClass(event.visibility)}">
                  ${event.visibility}
                </span>
                <small class="text-muted d-block mt-2">${event.date}</small>
                ${additionalInfo}
                ${locationInfo}
              </div>
            </div>
          </div>
        `;
      });
    }
    
    // If no events found, show a message
    if (!hasEvents) {
      eventsHTML += `
        <div class="col-12">
          <div class="text-center py-5">
            <i class="bi bi-stars display-1 text-muted"></i>
            <h4 class="mt-3 text-muted">No Astronomical Events Found</h4>
            <p class="text-muted">${startDate && endDate ? 'No events found in the selected date range.' : 'Check back later for upcoming celestial events.'}</p>
          </div>
        </div>
      `;
    }
    
    eventsContainer.innerHTML = eventsHTML;
    
    // Add event listener for clear filter button
    const clearFilterBtn = document.getElementById('clearDateFilter');
    if (clearFilterBtn) {
      clearFilterBtn.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }
  }

  displayAstronomicalEventsError() {
    const eventsContainer = document.getElementById('eventsContainer');
    if (!eventsContainer) return;
    
    eventsContainer.innerHTML = `
      <div class="col-12">
        <div class="text-center py-5">
          <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
          <h4 class="mt-3 text-warning">Unable to Load Events</h4>
          <p class="text-muted">There was an error loading astronomical events. Please try again later.</p>
        </div>
      </div>
    `;
  }

  async loadLaunches() {
    try {
      console.log('Loading launches...');
      
      // For now, we'll show a placeholder since we don't have a launch API yet
      // In the future, this would integrate with SpaceX API or similar
      this.displayLaunches([]);
      
    } catch (error) {
      console.error('Error loading launches:', error);
      this.displayLaunchesError();
    }
  }

  displayLaunches(launches) {
    const launchesContainer = document.getElementById('launchesContainer');
    if (!launchesContainer) return;
    
    if (launches.length === 0) {
      launchesContainer.innerHTML = `
        <div class="col-12">
          <div class="text-center py-5">
            <i class="bi bi-rocket display-1 text-muted"></i>
            <h4 class="mt-3 text-muted">No Upcoming Launches</h4>
            <p class="text-muted">Check back later for upcoming space launches.</p>
          </div>
        </div>
      `;
    } else {
      // Display actual launches when available
      let launchesHTML = '';
      launches.forEach(launch => {
        launchesHTML += `
          <div class="col-lg-6 col-md-12 mb-4">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">${launch.name}</h5>
                <p class="card-text">${launch.description}</p>
                <div class="launch-details">
                  <small class="text-muted">Launch Date: ${launch.date}</small><br>
                  <small class="text-muted">Mission: ${launch.mission}</small>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      launchesContainer.innerHTML = launchesHTML;
    }
  }

  displayLaunchesError() {
    const launchesContainer = document.getElementById('launchesContainer');
    if (!launchesContainer) return;
    
    launchesContainer.innerHTML = `
      <div class="col-12">
        <div class="text-center py-5">
          <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
          <h4 class="mt-3 text-warning">Unable to Load Launches</h4>
          <p class="text-muted">There was an error loading launch information. Please try again later.</p>
        </div>
      </div>
    `;
  }

  getEventVisibilityClass(visibility) {
    const classMap = {
      'Extreme': 'bg-danger',
      'High': 'bg-warning',
      'Moderate': 'bg-info',
      'Low': 'bg-success',
      'Very Low': 'bg-secondary',
      'Hazardous': 'bg-danger',
      'Close Approach': 'bg-warning',
      'Atmospheric Impact': 'bg-danger',
      'Very Close': 'bg-danger',
      'High Risk': 'bg-danger',
      'Low Risk': 'bg-warning',
      'Mission Target': 'bg-info'
    };
    return classMap[visibility] || 'bg-secondary';
  }

  showSearchLoading(show) {
    const searchLocationBtn = document.getElementById('searchLocationBtn');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationInput = document.getElementById('locationInput');
    
    if (show) {
      // Show loading state
      if (searchLocationBtn) {
        searchLocationBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i> Searching...';
        searchLocationBtn.disabled = true;
      }
      if (getLocationBtn) {
        getLocationBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i> Searching...';
        getLocationBtn.disabled = true;
      }
      if (locationInput) {
        locationInput.disabled = true;
        locationInput.placeholder = 'Searching...';
      }
    } else {
      // Hide loading state
      if (searchLocationBtn) {
        searchLocationBtn.innerHTML = '<i class="bi bi-search"></i> Search';
        searchLocationBtn.disabled = false;
      }
      if (getLocationBtn) {
        getLocationBtn.innerHTML = '<i class="bi bi-geo-alt"></i> My Location';
        getLocationBtn.disabled = false;
      }
      if (locationInput) {
        locationInput.disabled = false;
        locationInput.placeholder = 'Enter location...';
      }
    }
  }

  showMessage(message, type = 'info') {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    toast.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);
  }

  // Date filter functionality
  setupDateFilterListeners() {
    const dateRangeSelect = document.getElementById('dateRangeSelect');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyFilterBtn = document.getElementById('applyDateFilter');
    const locationFilterToggle = document.getElementById('locationFilterToggle');
    const setLocationBtn = document.getElementById('setLocationBtn');
    
    if (dateRangeSelect) {
      dateRangeSelect.addEventListener('change', () => {
        this.updateDateInputs(dateRangeSelect.value);
      });
    }
    
    if (applyFilterBtn) {
      applyFilterBtn.addEventListener('click', () => {
        this.applyDateFilter();
      });
    }
    
    if (locationFilterToggle) {
      locationFilterToggle.addEventListener('change', () => {
        this.updateLocationFilter();
      });
    }
    
    if (setLocationBtn) {
      setLocationBtn.addEventListener('click', () => {
        this.getUserLocation();
      });
    }
    
    // Initialize with upcoming events
    this.updateDateInputs('upcoming');
    
    // Update location status
    this.updateLocationStatus();
  }

  updateDateInputs(rangeType) {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (!startDateInput || !endDateInput) return;
    
    const today = new Date();
    let startDate, endDate;
    
    switch (rangeType) {
      case 'upcoming':
        startDate = today;
        endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        break;
      case 'past':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        endDate = today;
        break;
      case 'week':
        startDate = today;
        endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        break;
      case 'month':
        startDate = today;
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()); // Next month
        break;
      case 'quarter':
        startDate = today;
        endDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
        break;
      case 'custom':
        // Don't change the inputs for custom
        return;
      default:
        startDate = today;
        endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    
    startDateInput.value = startDate.toISOString().split('T')[0];
    endDateInput.value = endDate.toISOString().split('T')[0];
  }

  async applyDateFilter() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (!startDateInput || !endDateInput) return;
    
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    if (!startDate || !endDate) {
      this.showMessage('Please select both start and end dates', 'warning');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      this.showMessage('Start date must be before end date', 'warning');
      return;
    }
    
    // Load events with date filter
    await this.loadAstronomicalEvents(startDate, endDate);
  }

  clearDateFilter() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const dateRangeSelect = document.getElementById('dateRangeSelect');
    
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    if (dateRangeSelect) dateRangeSelect.value = 'upcoming';
    
    // Reset to default view
    this.loadAstronomicalEvents();
  }

  clearAllFilters() {
    // Clear date filters
    this.clearDateFilter();
    
    // Reset location filter to default (enabled)
    const locationFilterToggle = document.getElementById('locationFilterToggle');
    if (locationFilterToggle) {
      locationFilterToggle.checked = true;
    }
    
    // Reload events with default settings
    this.loadAstronomicalEvents();
  }

  // Location filter functionality
  updateLocationStatus() {
    const locationStatus = document.getElementById('locationStatus');
    const setLocationBtn = document.getElementById('setLocationBtn');
    
    if (!locationStatus || !setLocationBtn) return;
    
    if (this.currentLocation) {
      const lat = this.currentLocation.lat.toFixed(4);
      const lon = this.currentLocation.lon.toFixed(4);
      locationStatus.innerHTML = `<i class="bi bi-geo-alt"></i> ${lat}°, ${lon}°`;
      locationStatus.className = 'badge bg-success me-2';
      setLocationBtn.textContent = 'Update Location';
    } else {
      locationStatus.innerHTML = '<i class="bi bi-geo-alt"></i> Location: Not Set';
      locationStatus.className = 'badge bg-warning me-2';
      setLocationBtn.textContent = 'Set Location';
    }
  }

  updateLocationFilter() {
    const locationFilterToggle = document.getElementById('locationFilterToggle');
    
    if (!locationFilterToggle) return;
    
    // Reload events with current filter settings
    this.loadAstronomicalEvents();
  }

  // Override loadAstronomicalEvents to respect location filter
  async loadAstronomicalEvents(startDate = null, endDate = null) {
    try {
      const locationFilterToggle = document.getElementById('locationFilterToggle');
      const useLocationFilter = locationFilterToggle ? locationFilterToggle.checked : false;
      
      console.log('Loading enhanced astronomical events...', { 
        startDate, 
        endDate, 
        location: this.currentLocation,
        useLocationFilter 
      });
      
      // Get enhanced astronomical events from JPL API with optional filtering
      const [spaceWeather, enhancedEvents] = await Promise.all([
        this.nasaService.getSpaceWeatherEvents(),
        this.nasaService.getEnhancedAstronomicalEvents(
          startDate, 
          endDate, 
          useLocationFilter ? this.currentLocation : null
        )
      ]);
      
      this.displayAstronomicalEvents(spaceWeather, enhancedEvents, startDate, endDate, useLocationFilter);
      
    } catch (error) {
      console.error('Error loading enhanced astronomical events:', error);
      this.displayAstronomicalEventsError();
    }
  }

  // ISS Tracking functionality
  async loadISSData() {
    try {
      console.log('Loading ISS data...');
      
      // Load current ISS position
      const issPosition = await this.issService.getCurrentISSPosition();
      this.displayISSCurrentStatus(issPosition);
      
      // Load ISS pass predictions if location is set
      if (this.currentLocation) {
        await this.loadISSPassPredictions();
      }
      
    } catch (error) {
      console.error('Error loading ISS data:', error);
      this.displayISSError();
    }
  }

  displayISSCurrentStatus(issPosition) {
    const issStatusContainer = document.getElementById('issCurrentStatus');
    if (!issStatusContainer) return;
    
    const status = this.issService.getISSStatus(issPosition);
    const visibility = issPosition.visibility;
    const altitude = issPosition.altitude;
    const velocity = issPosition.velocity;
    
    issStatusContainer.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <h6 class="text-muted">Current Position</h6>
          <p class="mb-1">
            <i class="bi bi-geo-alt"></i> 
            <strong>${issPosition.latitude.toFixed(4)}°N, ${issPosition.longitude.toFixed(4)}°E</strong>
          </p>
          <p class="mb-1">
            <i class="bi bi-arrow-up"></i> 
            <strong>${altitude.toFixed(0)} km</strong> altitude
          </p>
          <p class="mb-1">
            <i class="bi bi-speedometer2"></i> 
            <strong>${velocity.toFixed(1)} km/h</strong> velocity
          </p>
        </div>
        <div class="col-md-6">
          <h6 class="text-muted">Status</h6>
          <p class="mb-1">
            <span class="badge ${status === 'Live' ? 'bg-success' : status === 'Recent' ? 'bg-warning' : 'bg-danger'}">
              ${status}
            </span>
          </p>
          <p class="mb-1">
            <span class="badge ${visibility === 'nighttime' ? 'bg-dark' : 'bg-warning'}">
              ${visibility === 'nighttime' ? 'Night' : 'Day'}
            </span>
          </p>
          <p class="mb-1">
            <small class="text-muted">
              Last updated: ${this.issService.formatTimestamp(issPosition.timestamp)}
            </small>
          </p>
        </div>
      </div>
      ${this.currentLocation ? this.getISSVisibilityInfo(issPosition) : ''}
    `;
  }

  getISSVisibilityInfo(issPosition) {
    const visibility = this.issService.calculateISSVisibility(issPosition, this.currentLocation);
    if (!visibility) return '';
    
    return `
      <div class="row mt-3">
        <div class="col-12">
          <h6 class="text-muted">Visibility from Your Location</h6>
          <p class="mb-1">
            <span class="badge ${visibility.isVisible ? 'bg-success' : 'bg-secondary'}">
              <i class="bi bi-eye"></i> ${visibility.isVisible ? 'Visible' : 'Not Visible'}
            </span>
          </p>
          <p class="mb-1">
            <small class="text-muted">
              ${visibility.reason}
              ${visibility.direction ? ` - Direction: ${visibility.direction}` : ''}
            </small>
          </p>
        </div>
      </div>
    `;
  }

  async loadISSPassPredictions() {
    try {
      console.log('Loading ISS pass predictions...');
      
      const passes = await this.issService.getISSPassPredictions(this.currentLocation, 24);
      this.displayISSPassPredictions(passes);
      
    } catch (error) {
      console.error('Error loading ISS pass predictions:', error);
      this.displayISSPassPredictionsError();
    }
  }

  displayISSPassPredictions(passes) {
    const predictionsContainer = document.getElementById('issPassPredictions');
    if (!predictionsContainer) return;
    
    if (passes.length === 0) {
      predictionsContainer.innerHTML = `
        <div class="text-center">
          <i class="bi bi-moon-stars text-muted"></i>
          <p class="text-muted">No visible ISS passes in the next 24 hours.</p>
          <small class="text-muted">The ISS may be in daylight or too far from your location.</small>
        </div>
      `;
      return;
    }
    
    let passesHTML = `
      <div class="row">
        <div class="col-12">
          <p class="text-muted mb-3">
            <i class="bi bi-info-circle"></i> 
            Found ${passes.length} visible ISS pass${passes.length > 1 ? 'es' : ''} in the next 24 hours
          </p>
        </div>
      </div>
    `;
    
    passes.forEach((pass, index) => {
      const startTime = this.issService.formatTimestamp(pass.startTime);
      const duration = Math.round(pass.duration / 60); // Convert to minutes
      
      passesHTML += `
        <div class="col-lg-6 col-md-12 mb-3">
          <div class="card">
            <div class="card-body">
              <h6 class="card-title">
                <i class="bi bi-calendar-event"></i> Pass ${index + 1}
              </h6>
              <p class="mb-1">
                <i class="bi bi-clock"></i> <strong>${startTime}</strong>
              </p>
              <p class="mb-1">
                <i class="bi bi-stopwatch"></i> Duration: <strong>${duration} minutes</strong>
              </p>
              <p class="mb-1">
                <i class="bi bi-arrow-up"></i> Max Altitude: <strong>${pass.maxAltitude.toFixed(0)} km</strong>
              </p>
              <p class="mb-1">
                <i class="bi bi-geo-alt"></i> Closest Distance: <strong>${pass.maxDistance.toFixed(0)} km</strong>
              </p>
            </div>
          </div>
        </div>
      `;
    });
    
    predictionsContainer.innerHTML = `
      <div class="row">
        ${passesHTML}
      </div>
    `;
  }

  displayISSPassPredictionsError() {
    const predictionsContainer = document.getElementById('issPassPredictions');
    if (!predictionsContainer) return;
    
    predictionsContainer.innerHTML = `
      <div class="text-center">
        <i class="bi bi-exclamation-triangle text-warning"></i>
        <p class="text-muted">Unable to load ISS pass predictions.</p>
        <small class="text-muted">Please try again later.</small>
      </div>
    `;
  }

  displayISSError() {
    const issStatusContainer = document.getElementById('issCurrentStatus');
    if (!issStatusContainer) return;
    
    issStatusContainer.innerHTML = `
      <div class="text-center">
        <i class="bi bi-exclamation-triangle text-warning"></i>
        <p class="text-muted">Unable to load ISS data.</p>
        <small class="text-muted">Please try again later.</small>
      </div>
    `;
  }

  // Unified Dashboard functionality
  async loadDashboardData() {
    try {
      console.log('Loading unified dashboard data...');
      
      // Show loading state
      const dashboardContent = document.getElementById('dashboardContent');
      if (dashboardContent) {
        dashboardContent.innerHTML = `
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading astronomical events...</p>
          </div>
        `;
      }
      
      // Get current date range from the UI
      const dateRangeSelect = document.getElementById('dateRangeSelect');
      const startDateInput = document.getElementById('startDate');
      const endDateInput = document.getElementById('endDate');
      
      let startDate = null;
      let endDate = null;
      
      if (dateRangeSelect && dateRangeSelect.value === 'custom') {
        // Use custom date range
        if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
          startDate = startDateInput.value;
          endDate = endDateInput.value;
        }
      } else if (dateRangeSelect) {
        // Use predefined date range
        const today = new Date();
        switch (dateRangeSelect.value) {
          case 'tonight':
            startDate = today.toISOString().split('T')[0];
            endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case 'week':
            startDate = today.toISOString().split('T')[0];
            endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case 'month':
            startDate = today.toISOString().split('T')[0];
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString().split('T')[0];
            break;
        }
      }
      
      console.log('Date range for dashboard:', { startDate, endDate });
      
      // Load all data in parallel
      const [spaceWeather, enhancedEvents, launches, issPosition] = await Promise.all([
        this.nasaService.getSpaceWeatherEvents(),
        this.nasaService.getEnhancedAstronomicalEvents(startDate, endDate, this.currentLocation),
        this.loadLaunches(),
        this.issService.getCurrentISSPosition()
      ]);
      
      this.displayDashboardContent(spaceWeather, enhancedEvents, launches, issPosition);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.displayDashboardError();
    }
  }

  displayDashboardContent(spaceWeather, enhancedEvents, launches, issPosition) {
    console.log('Displaying dashboard content with new layout...');
    
    // Update ISS Status in the right column
    const issStatus = document.getElementById('issStatus');
    if (issStatus && issPosition) {
      issStatus.innerHTML = this.getCompactISSHtml(issPosition);
    }
    
    // Update Astronomical Events in the right column
    const astronomicalEvents = document.getElementById('astronomicalEvents');
    if (astronomicalEvents && enhancedEvents && enhancedEvents.length > 0) {
      astronomicalEvents.innerHTML = this.getCompactEventsHtml(enhancedEvents);
    }
    
    // Update dashboard content for launches and other full-width content
    const dashboardContent = document.getElementById('dashboardContent');
    if (dashboardContent) {
      let contentHTML = '';
      
      // Add launches
      if (launches && launches.length > 0) {
        contentHTML += this.getLaunchesDashboardHTML(launches);
      }
      
      // If no content, show message
      if (!contentHTML) {
        contentHTML = `
          <div class="text-center py-4">
            <i class="bi bi-rocket display-4 text-muted"></i>
            <h4 class="mt-3 text-muted">Space Launches</h4>
            <p class="text-muted">No planned launches found for your selected date range. Try adjusting the date filter to see upcoming space missions.</p>
          </div>
        `;
      }
      
      dashboardContent.innerHTML = contentHTML;
    }
    
    console.log('Dashboard content updated with new layout');
  }

  getCompactISSHtml(issPosition) {
    const visibility = this.currentLocation ? 
      this.issService.calculateISSVisibility(issPosition, this.currentLocation) : null;
    
    return `
      <div class="text-center mb-3">
        <div class="mb-2">
          <i class="bi bi-satellite text-primary fs-3"></i>
        </div>
        <div class="small">
          <div class="mb-1">
            <strong>ISS Location</strong>
          </div>
          <div class="mb-1">
            <strong>${issPosition.latitude.toFixed(1)}°N, ${issPosition.longitude.toFixed(1)}°E</strong>
          </div>
          <div class="mb-1">
            <i class="bi bi-arrow-up"></i> ${issPosition.altitude.toFixed(0)} km
          </div>
          <div class="mb-2">
            <span class="badge ${issPosition.visibility === 'nighttime' ? 'bg-dark' : 'bg-warning'} small">
              ${issPosition.visibility === 'nighttime' ? 'Night' : 'Day'}
            </span>
            ${visibility ? `
              <span class="badge ${visibility.isVisible ? 'bg-success' : 'bg-secondary'} small ms-1">
                <i class="bi bi-eye"></i> ${visibility.isVisible ? 'Visible' : 'Not Visible'}
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  getCompactEventsHtml(events) {
    let eventsHTML = '';
    
    events.slice(0, 2).forEach(event => {
      const bestViewingTime = this.getBestViewingTime(event);
      const eventInfo = this.getEventTypeInfo(event);
      
      eventsHTML += `
        <div class="mb-2 p-2 border rounded">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <h6 class="mb-0 small">${event.name || event.type}</h6>
            <span class="badge ${this.getEventVisibilityClass(event.visibility)} small">
              ${event.visibility}
            </span>
          </div>
          <div class="small text-muted mb-1">
            <strong>${eventInfo.type}</strong> - ${event.description.substring(0, 50)}${event.description.length > 50 ? '...' : ''}
          </div>
          <div class="small">
            <i class="bi bi-clock"></i> ${bestViewingTime}
          </div>
        </div>
      `;
    });
    
    if (events.length === 0) {
      eventsHTML = `
        <div class="text-center py-2">
          <i class="bi bi-stars text-muted"></i>
          <p class="text-muted mb-0 small">No events found</p>
        </div>
      `;
    }
    
    return eventsHTML;
  }

  getEventTypeInfo(event) {
    const eventType = event.type?.toLowerCase() || '';
    
    switch (eventType) {
      case 'close approach':
        return {
          type: 'Near-Earth Asteroid',
          icon: 'bi-asterisk',
          description: 'Asteroid passing close to Earth'
        };
      case 'fireball event':
        return {
          type: 'Meteor Fireball',
          icon: 'bi-fire',
          description: 'Bright meteor in atmosphere'
        };
      case 'risk assessment':
        return {
          type: 'Risk Assessment',
          icon: 'bi-exclamation-triangle',
          description: 'Asteroid impact risk analysis'
        };
      case 'human accessible':
        return {
          type: 'Mission Target',
          icon: 'bi-rocket',
          description: 'Asteroid accessible for missions'
        };
      default:
        return {
          type: 'Astronomical Event',
          icon: 'bi-stars',
          description: 'Space event or object'
        };
    }
  }

  getWeatherStatusHTML() {
    return `
      <div class="row mb-4">
        <div class="col-12">
          <div class="alert alert-info">
            <h6 class="alert-heading">
              <i class="bi bi-cloud-sun"></i> Current Viewing Conditions
            </h6>
            <div id="weatherStatusDisplay">
              <!-- Weather status will be populated by updateWeatherDisplay -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getISSDashboardHTML(issPosition) {
    const visibility = this.currentLocation ? 
      this.issService.calculateISSVisibility(issPosition, this.currentLocation) : null;
    
    return `
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h6 class="card-title mb-0">
                <i class="bi bi-satellite"></i> International Space Station
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <p class="mb-1">
                    <i class="bi bi-geo-alt"></i> 
                    <strong>${issPosition.latitude.toFixed(4)}°N, ${issPosition.longitude.toFixed(4)}°E</strong>
                  </p>
                  <p class="mb-1">
                    <i class="bi bi-arrow-up"></i> 
                    <strong>${issPosition.altitude.toFixed(0)} km</strong> altitude
                  </p>
                  <p class="mb-1">
                    <i class="bi bi-speedometer2"></i> 
                    <strong>${issPosition.velocity.toFixed(1)} km/h</strong> velocity
                  </p>
                </div>
                <div class="col-md-6">
                  <p class="mb-1">
                    <span class="badge ${issPosition.visibility === 'nighttime' ? 'bg-dark' : 'bg-warning'}">
                      ${issPosition.visibility === 'nighttime' ? 'Night' : 'Day'}
                    </span>
                  </p>
                  ${visibility ? `
                    <p class="mb-1">
                      <span class="badge ${visibility.isVisible ? 'bg-success' : 'bg-secondary'}">
                        <i class="bi bi-eye"></i> ${visibility.isVisible ? 'Visible' : 'Not Visible'}
                      </span>
                    </p>
                    <small class="text-muted">${visibility.reason}</small>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getAstronomicalEventsDashboardHTML(events) {
    let eventsHTML = `
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-success text-white">
              <h6 class="card-title mb-0">
                <i class="bi bi-stars"></i> Astronomical Events
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
    `;
    
    events.slice(0, 6).forEach(event => {
      // Calculate best viewing time based on event type
      const bestViewingTime = this.getBestViewingTime(event);
      const weatherAtViewingTime = this.getWeatherAtViewingTime(bestViewingTime);
      
      eventsHTML += `
        <div class="col-lg-6 col-md-12 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="card-title mb-0">${event.name || event.type}</h6>
                <span class="badge ${this.getEventVisibilityClass(event.visibility)}">
                  ${event.visibility}
                </span>
              </div>
              <p class="card-text small">${event.description}</p>
              
              <div class="row mt-3">
                <div class="col-6">
                  <div class="small">
                    <strong>Best Viewing:</strong><br>
                    <i class="bi bi-clock"></i> ${bestViewingTime}<br>
                    <small class="text-muted">${event.date}</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="small">
                    <strong>Weather:</strong><br>
                    <span class="badge ${weatherAtViewingTime.class}">
                      ${weatherAtViewingTime.condition}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    eventsHTML += `
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    return eventsHTML;
  }

  getLaunchesDashboardHTML(launches) {
    let launchesHTML = `
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-warning text-dark">
              <h6 class="card-title mb-0">
                <i class="bi bi-rocket"></i> Upcoming Launches
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
    `;
    
    launches.slice(0, 3).forEach(launch => {
      launchesHTML += `
        <div class="col-lg-4 col-md-6 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-title">${launch.name}</h6>
              <p class="card-text">${launch.description}</p>
              <small class="text-muted d-block">${launch.date}</small>
            </div>
          </div>
        </div>
      `;
    });
    
    launchesHTML += `
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    return launchesHTML;
  }



  displayDashboardError() {
    const dashboardContent = document.getElementById('dashboardContent');
    if (!dashboardContent) return;
    
    dashboardContent.innerHTML = `
      <div class="text-center py-4">
        <i class="bi bi-exclamation-triangle text-warning"></i>
        <h4 class="mt-3 text-muted">Unable to Load Data</h4>
        <p class="text-muted">Please try again later.</p>
      </div>
    `;
  }

  // Dashboard date filter functionality
  setupDashboardDateFilterListeners() {
    const dateRangeSelect = document.getElementById('dateRangeSelect');
    const customDateInputs = document.getElementById('customDateInputs');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyCustomDatesBtn = document.getElementById('applyCustomDates');
    
    if (dateRangeSelect) {
      dateRangeSelect.addEventListener('change', () => {
        this.updateDashboardDateInputs(dateRangeSelect.value);
      });
    }
    
    if (applyCustomDatesBtn) {
      applyCustomDatesBtn.addEventListener('click', () => {
        this.applyCustomDateRange();
      });
    }
    
    // Initialize with tonight
    this.updateDashboardDateInputs('tonight');
  }

  updateDashboardDateInputs(rangeType) {
    const customDateInputs = document.getElementById('customDateInputs');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (!customDateInputs || !startDateInput || !endDateInput) return;
    
    const today = new Date();
    let startDate, endDate;
    
    switch (rangeType) {
      case 'tonight':
        startDate = today;
        endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
        customDateInputs.classList.add('d-none');
        break;
      case 'week':
        startDate = today;
        endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        customDateInputs.classList.add('d-none');
        break;
      case 'month':
        startDate = today;
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()); // Next month
        customDateInputs.classList.add('d-none');
        break;
      case 'custom':
        customDateInputs.classList.remove('d-none');
        return; // Don't reload for custom, wait for user to click apply
      default:
        startDate = today;
        endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        customDateInputs.classList.add('d-none');
    }
    
    startDateInput.value = startDate.toISOString().split('T')[0];
    endDateInput.value = endDate.toISOString().split('T')[0];
    
    // Reload dashboard with new date range
    console.log('Date range changed to:', rangeType);
    this.loadDashboardData();
  }

  // Show/hide astronomical data panel
  showAstronomicalDataPanel() {
    const astronomicalDataPanel = document.getElementById('astronomicalData');
    if (astronomicalDataPanel) {
      astronomicalDataPanel.style.display = 'block';
      
      // Smooth scroll to the panel when user searches for location
      astronomicalDataPanel.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  hideAstronomicalDataPanel() {
    const astronomicalDataPanel = document.getElementById('astronomicalData');
    if (astronomicalDataPanel) {
      astronomicalDataPanel.style.display = 'none';
    }
  }

  // Apply custom date range
  applyCustomDateRange() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (!startDateInput || !endDateInput) return;
    
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    if (!startDate || !endDate) {
      this.showMessage('Please select both start and end dates', 'warning');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      this.showMessage('Start date must be before end date', 'warning');
      return;
    }
    
    // Reload dashboard with custom date range
    this.loadDashboardData();
  }

  // Calculate best viewing time for astronomical events
  getBestViewingTime(event) {
    const eventType = event.type?.toLowerCase() || '';
    const eventName = event.name?.toLowerCase() || '';
    
    // Determine best viewing time based on event type
    if (eventType.includes('meteor') || eventName.includes('meteor')) {
      return 'After Midnight (2-4 AM)';
    } else if (eventType.includes('planet') || eventName.includes('planet')) {
      return 'Dusk to Dawn';
    } else if (eventType.includes('moon') || eventName.includes('moon')) {
      return 'Evening to Midnight';
    } else if (eventType.includes('star') || eventName.includes('star')) {
      return 'Late Evening (9-11 PM)';
    } else if (eventType.includes('galaxy') || eventName.includes('galaxy')) {
      return 'Dark Hours (10 PM - 2 AM)';
    } else {
      return 'Evening Hours';
    }
  }

  // Get weather conditions for viewing time
  getWeatherAtViewingTime(viewingTime) {
    // This would ideally use forecast data for the specific time
    // For now, we'll use current conditions as a proxy
    const currentWeather = this.currentWeatherData;
    
    if (!currentWeather) {
      return { class: 'bg-secondary', condition: 'Unknown' };
    }
    
    // Simple logic based on current conditions
    if (currentWeather.cloudCover < 20) {
      return { class: 'bg-success', condition: 'Clear Skies' };
    } else if (currentWeather.cloudCover < 50) {
      return { class: 'bg-warning', condition: 'Partly Cloudy' };
    } else {
      return { class: 'bg-danger', condition: 'Cloudy' };
    }
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Prevent automatic scrolling to hash fragments
  if (window.location.hash) {
    // Clear the hash without scrolling
    history.replaceState(null, null, window.location.pathname);
  }
  
  new StarWXApp();
}); 