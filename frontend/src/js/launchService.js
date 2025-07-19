// Launch Service for RocketLaunch.Live API
// https://www.rocketlaunch.live/api
// Free endpoint: https://fdo.rocketlaunch.live/json/launches/next/5

class LaunchService {
    constructor() {
        this.baseUrl = 'https://fdo.rocketlaunch.live/json/launches/next/5';
        this.launches = [];
        this.lastUpdated = null;
    }

    async fetchLaunches(startDate = null, endDate = null) {
        try {
            console.log('🚀 Fetching launch data from RocketLaunch.Live...');
            
            const response = await fetch(this.baseUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.result && Array.isArray(data.result)) {
                // Filter launches based on date range if provided
                let filteredLaunches = data.result;
                
                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    
                    console.log(`🔍 Filtering launches from ${startDate} to ${endDate}`);
                    console.log(`📊 Total launches available: ${data.result.length}`);
                    
                    filteredLaunches = data.result.filter(launch => {
                        if (launch.t0) {
                            const launchDate = new Date(launch.t0);
                            const isInRange = launchDate >= start && launchDate <= end;
                            console.log(`🚀 ${launch.name}: ${launch.t0} -> ${isInRange ? 'IN RANGE' : 'OUT OF RANGE'}`);
                            return isInRange;
                        } else if (launch.sort_date) {
                            // Use sort_date as fallback (Unix timestamp)
                            const launchDate = new Date(launch.sort_date * 1000);
                            const isInRange = launchDate >= start && launchDate <= end;
                            console.log(`🚀 ${launch.name}: ${new Date(launch.sort_date * 1000).toISOString()} -> ${isInRange ? 'IN RANGE' : 'OUT OF RANGE'}`);
                            return isInRange;
                        }
                        console.log(`🚀 ${launch.name}: NO DATE INFO -> EXCLUDED`);
                        return false; // Exclude launches without date info
                    });
                    
                    console.log(`📅 Filtered ${filteredLaunches.length} launches for date range ${startDate} to ${endDate}`);
                }
                
                this.launches = filteredLaunches;
                this.lastUpdated = new Date();
                console.log(`✅ Fetched ${this.launches.length} launches`);
                return this.launches;
            } else {
                throw new Error('Invalid data structure received');
            }
            
        } catch (error) {
            console.error('❌ Error fetching launch data:', error);
            this.launches = [];
            throw error;
        }
    }

    getLaunches() {
        return this.launches;
    }

    getLastUpdated() {
        return this.lastUpdated;
    }

    // Format launch date for display
    formatLaunchDate(launch) {
        if (launch.t0) {
            const launchDate = new Date(launch.t0);
            return launchDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            });
        } else if (launch.date_str) {
            return launch.date_str;
        } else {
            return 'TBD';
        }
    }

    // Get launch status badge
    getLaunchStatusBadge(launch) {
        const status = this.getLaunchStatus(launch.result);
        let badgeClass = 'badge bg-secondary';
        
        switch (launch.result) {
            case 1: // Success
                badgeClass = 'badge bg-success';
                break;
            case 0: // Failure
                badgeClass = 'badge bg-danger';
                break;
            case 2: // Partial Failure
                badgeClass = 'badge bg-warning';
                break;
            case 3: // In-Flight Abort
                badgeClass = 'badge bg-info';
                break;
            case -1: // Not Set (upcoming)
                badgeClass = 'badge bg-primary';
                break;
        }
        
        return `<span class="${badgeClass}">${status}</span>`;
    }

    // Get launch status text
    getLaunchStatus(result) {
        switch (result) {
            case -1: return 'Upcoming';
            case 0: return 'Failure';
            case 1: return 'Success';
            case 2: return 'Partial Failure';
            case 3: return 'In-Flight Abort';
            default: return 'Unknown';
        }
    }

    // Generate HTML for launch display
    getLaunchHtml(launch) {
        const launchDate = this.formatLaunchDate(launch);
        const statusBadge = this.getLaunchStatusBadge(launch);
        const provider = launch.provider?.name || 'Unknown';
        const vehicle = launch.vehicle?.name || 'Unknown';
        const location = launch.pad?.location?.name || 'Unknown';
        const country = launch.pad?.location?.country || 'Unknown';
        const description = launch.launch_description || launch.mission_description || 'No description available';
        
        // Get weather info if available
        let weatherInfo = '';
        if (launch.weather_summary || launch.weather_temp) {
            weatherInfo = `
                <div class="mt-2">
                    <small class="text-muted">
                        <i class="bi bi-cloud"></i> 
                        ${launch.weather_summary || ''} 
                        ${launch.weather_temp ? `(${launch.weather_temp}°F)` : ''}
                    </small>
                </div>
            `;
        }

        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="card-title mb-0">${launch.name}</h6>
                        ${statusBadge}
                    </div>
                    
                    <div class="row g-2 mb-2">
                        <div class="col-6">
                            <small class="text-muted">
                                <i class="bi bi-rocket"></i> ${vehicle}
                            </small>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">
                                <i class="bi bi-building"></i> ${provider}
                            </small>
                        </div>
                    </div>
                    
                    <div class="row g-2 mb-2">
                        <div class="col-6">
                            <small class="text-muted">
                                <i class="bi bi-calendar"></i> ${launchDate}
                            </small>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">
                                <i class="bi bi-geo-alt"></i> ${location}, ${country}
                            </small>
                        </div>
                    </div>
                    
                    <p class="card-text small">${description}</p>
                    ${weatherInfo}
                    
                    <div class="mt-2">
                        <small class="text-muted">
                            <i class="bi bi-link-45deg"></i>
                            <a href="https://www.rocketlaunch.live/launch/${launch.slug}" 
                               target="_blank" class="text-decoration-none">
                                View Details
                            </a>
                        </small>
                    </div>
                </div>
            </div>
        `;
    }

    // Generate HTML for all launches
    getAllLaunchesHtml() {
        if (this.launches.length === 0) {
            return `
                <div class="text-center text-muted">
                    <i class="bi bi-rocket fs-1"></i>
                    <p class="mt-2">No launches found for selected date range</p>
                    <p class="small">Try adjusting the date filter to see upcoming space missions.</p>
                    <small>Data from RocketLaunch.Live</small>
                </div>
            `;
        }

        const launchesHtml = this.launches.map(launch => this.getLaunchHtml(launch)).join('');
        
        return `
            <div class="launches-container">
                ${launchesHtml}
                <div class="text-center mt-3">
                    <small class="text-muted">
                        <i class="bi bi-info-circle"></i>
                        Data by <a href="https://www.rocketlaunch.live" target="_blank" class="text-decoration-none">RocketLaunch.Live</a>
                    </small>
                </div>
            </div>
        `;
    }

    // Check if data is fresh (less than 1 hour old)
    isDataFresh() {
        if (!this.lastUpdated) return false;
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        return (new Date() - this.lastUpdated) < oneHour;
    }
}

// Export for use in other modules
window.LaunchService = LaunchService; 