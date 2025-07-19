// Main application logic for StarWX
import { NASAService } from './nasaService.js';
import { WeatherService } from './weatherService.js';

class StarWXApp {
  constructor() {
    this.nasaService = new NASAService();
    this.weatherService = new WeatherService();
    this.currentLocation = null;
    
    this.init();
  }

  async init() {
    console.log('StarWX App initializing...');
    
    // Initialize event listeners
    this.setupEventListeners();
    
    // Load initial data
    await this.loadAstronomicalEvents();
    await this.loadLaunches();
    
    console.log('StarWX App initialized successfully');
  }

  setupEventListeners() {
    // Location input and button
    const locationInput = document.getElementById('locationInput');
    const getLocationBtn = document.getElementById('getLocationBtn');
    
    if (getLocationBtn) {
      getLocationBtn.addEventListener('click', () => this.getUserLocation());
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
    
    // Date filter event listeners
    this.setupDateFilterListeners();
  }

  async getUserLocation() {
    try {
      console.log('Getting user location...');
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
      
      // Load weather for current location
      await this.loadWeatherData();
      
    } catch (error) {
      console.error('Error getting location:', error);
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
    
    try {
      // For now, we'll use a simple approach
      // In a real app, you'd geocode the location
      this.currentLocation = { lat: 40.7128, lon: -74.0060 }; // Default to NYC
      await this.loadWeatherData();
    } catch (error) {
      console.error('Error handling location search:', error);
      this.showMessage('Error processing location', 'error');
    }
  }

  async loadWeatherData() {
    if (!this.currentLocation) return;
    
    try {
      const weatherData = await this.weatherService.getCurrentWeather(
        this.currentLocation.lat, 
        this.currentLocation.lon
      );
      this.updateWeatherDisplay(weatherData);
    } catch (error) {
      console.error('Error loading weather data:', error);
      this.showMessage('Error loading weather data', 'error');
    }
  }

  updateWeatherDisplay(weatherData) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    if (!weatherDisplay || !weatherData) return;
    
    // Round humidity to 1 decimal place
    const roundedHumidity = Math.round(weatherData.humidity * 10) / 10;
    
    weatherDisplay.innerHTML = `
      <div class="weather-info">
        <h3>${weatherData.temperature}°C</h3>
        <p>${weatherData.description}</p>
        <div class="weather-details">
          <small>Humidity: ${roundedHumidity}%</small><br>
          <small>Wind: ${weatherData.windSpeed} km/h</small><br>
          <small>Visibility: ${weatherData.visibility} km</small>
        </div>
        <div class="viewing-conditions mt-3">
          <span class="badge ${this.getViewingConditionClass(weatherData)}">
            ${this.getViewingConditionText(weatherData)}
          </span>
        </div>
      </div>
    `;
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
      console.log('Loading enhanced astronomical events...', { startDate, endDate });
      
      // Get enhanced astronomical events from JPL API with optional date filtering
      const [spaceWeather, enhancedEvents] = await Promise.all([
        this.nasaService.getSpaceWeatherEvents(),
        this.nasaService.getEnhancedAstronomicalEvents(startDate, endDate)
      ]);
      
      this.displayAstronomicalEvents(spaceWeather, enhancedEvents, startDate, endDate);
      
    } catch (error) {
      console.error('Error loading enhanced astronomical events:', error);
      this.displayAstronomicalEventsError();
    }
  }

  displayAstronomicalEvents(spaceWeather, enhancedEvents, startDate = null, endDate = null) {
    const eventsContainer = document.getElementById('eventsContainer');
    if (!eventsContainer) return;
    
    let eventsHTML = '';
    let hasEvents = false;
    
    // Add date range header if filtering
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString();
      const end = new Date(endDate).toLocaleDateString();
      eventsHTML += `
        <div class="col-12 mb-4">
          <div class="alert alert-info">
            <i class="bi bi-calendar-check"></i> 
            Showing events from <strong>${start}</strong> to <strong>${end}</strong>
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
        this.clearDateFilter();
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
    
    // Initialize with upcoming events
    this.updateDateInputs('upcoming');
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
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new StarWXApp();
}); 