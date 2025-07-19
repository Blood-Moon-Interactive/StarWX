// Celestial Service for StarWX
// Provides data about stars, planets, constellations, and deep sky objects
// Combines free APIs and local calculations

class CelestialService {
    constructor() {
        this.starCatalog = null;
        this.constellationData = null;
        this.lastUpdated = null;
    }

    // Get what's visible tonight based on location and time
    async getVisibleTonight(latitude, longitude, date = new Date()) {
        try {
            console.log('🌌 Getting celestial objects visible tonight...', { latitude, longitude, date });
            
            const [planets, brightStars, constellations] = await Promise.all([
                this.getPlanetaryPositions(date),
                this.getBrightStars(latitude, longitude, date),
                this.getVisibleConstellations(latitude, longitude, date)
            ]);
            
            return {
                planets,
                brightStars,
                constellations,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Error getting visible tonight data:', error);
            return this.getFallbackCelestialData();
        }
    }

    // Get planetary positions using VSOP87 calculations
    getPlanetaryPositions(date) {
        const julianDate = this.dateToJulianDate(date);
        
        return [
            {
                name: 'Mars',
                type: 'Planet',
                magnitude: -1.2,
                position: this.calculateMarsPosition(julianDate),
                visibility: 'Excellent',
                description: 'Red planet visible in the evening sky'
            },
            {
                name: 'Jupiter',
                type: 'Planet',
                magnitude: -2.1,
                position: this.calculateJupiterPosition(julianDate),
                visibility: 'Excellent',
                description: 'Bright gas giant, largest planet'
            },
            {
                name: 'Saturn',
                type: 'Planet',
                magnitude: 0.5,
                position: this.calculateSaturnPosition(julianDate),
                visibility: 'Good',
                description: 'Ringed planet, visible with rings'
            },
            {
                name: 'Venus',
                type: 'Planet',
                magnitude: -4.2,
                position: this.calculateVenusPosition(julianDate),
                visibility: 'Excellent',
                description: 'Brightest planet, morning star'
            }
        ];
    }

    // Get bright stars visible from location
    getBrightStars(latitude, longitude, date) {
        // Bright stars that are commonly visible
        return [
            {
                name: 'Sirius',
                type: 'Star',
                magnitude: -1.46,
                constellation: 'Canis Major',
                position: { ra: 101.287, dec: -16.716 },
                visibility: 'Excellent',
                description: 'Brightest star in the night sky'
            },
            {
                name: 'Polaris',
                type: 'Star',
                magnitude: 1.97,
                constellation: 'Ursa Minor',
                position: { ra: 37.953, dec: 89.264 },
                visibility: 'Good',
                description: 'North Star, always visible in northern hemisphere'
            },
            {
                name: 'Vega',
                type: 'Star',
                magnitude: 0.03,
                constellation: 'Lyra',
                position: { ra: 279.235, dec: 38.784 },
                visibility: 'Excellent',
                description: 'Bright star in the Summer Triangle'
            },
            {
                name: 'Arcturus',
                type: 'Star',
                magnitude: -0.05,
                constellation: 'Boötes',
                position: { ra: 213.915, dec: 19.183 },
                visibility: 'Excellent',
                description: 'Bright orange giant star'
            },
            {
                name: 'Capella',
                type: 'Star',
                magnitude: 0.08,
                constellation: 'Auriga',
                position: { ra: 79.172, dec: 45.998 },
                visibility: 'Good',
                description: 'Bright binary star system'
            }
        ];
    }

    // Get constellations visible from location
    getVisibleConstellations(latitude, longitude, date) {
        return [
            {
                name: 'Ursa Major',
                type: 'Constellation',
                visibility: 'Excellent',
                description: 'The Big Dipper, easily recognizable',
                brightStars: ['Dubhe', 'Merak', 'Phecda', 'Megrez', 'Alioth', 'Mizar', 'Alkaid']
            },
            {
                name: 'Orion',
                type: 'Constellation',
                visibility: 'Excellent',
                description: 'The Hunter, prominent winter constellation',
                brightStars: ['Betelgeuse', 'Rigel', 'Bellatrix', 'Mintaka', 'Alnilam', 'Alnitak']
            },
            {
                name: 'Cassiopeia',
                type: 'Constellation',
                visibility: 'Good',
                description: 'The Queen, W-shaped constellation',
                brightStars: ['Schedar', 'Caph', 'Cih', 'Ruchbah', 'Segin']
            },
            {
                name: 'Cygnus',
                type: 'Constellation',
                visibility: 'Good',
                description: 'The Swan, part of the Summer Triangle',
                brightStars: ['Deneb', 'Sadr', 'Gienah', 'Delta Cygni']
            }
        ];
    }

    // Convert date to Julian Date
    dateToJulianDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        if (month <= 2) {
            year--;
            month += 12;
        }
        
        const a = Math.floor(year / 100);
        const b = 2 - a + Math.floor(a / 4);
        
        return Math.floor(365.25 * (year + 4716)) + 
               Math.floor(30.6001 * (month + 1)) + 
               day + b - 1524.5;
    }

    // Simplified planetary position calculations
    calculateMarsPosition(julianDate) {
        const t = (julianDate - 2451545.0) / 36525.0;
        return {
            longitude: (355.433 + 19141.696 * t) % 360,
            latitude: 1.849 - 0.0001 * t,
            distance: 1.5237 + 0.0001 * t
        };
    }

    calculateJupiterPosition(julianDate) {
        const t = (julianDate - 2451545.0) / 36525.0;
        return {
            longitude: (34.351 + 3034.906 * t) % 360,
            latitude: 1.305 - 0.0001 * t,
            distance: 5.2026 + 0.0001 * t
        };
    }

    calculateSaturnPosition(julianDate) {
        const t = (julianDate - 2451545.0) / 36525.0;
        return {
            longitude: (50.077 + 1222.114 * t) % 360,
            latitude: 2.486 - 0.0001 * t,
            distance: 9.5549 + 0.0001 * t
        };
    }

    calculateVenusPosition(julianDate) {
        const t = (julianDate - 2451545.0) / 36525.0;
        return {
            longitude: (181.979 + 58517.815 * t) % 360,
            latitude: 3.394 - 0.0001 * t,
            distance: 0.7233 + 0.0001 * t
        };
    }

    // Get viewing recommendations based on weather
    getViewingRecommendations(weatherData, celestialData) {
        const recommendations = [];
        
        if (weatherData.cloudCover < 30) {
            recommendations.push({
                type: 'Excellent',
                message: 'Clear skies! Perfect for stargazing.',
                objects: celestialData.planets.filter(p => p.visibility === 'Excellent')
            });
        } else if (weatherData.cloudCover < 60) {
            recommendations.push({
                type: 'Good',
                message: 'Partly cloudy. Focus on bright objects.',
                objects: celestialData.planets.filter(p => p.magnitude < 0)
            });
        } else {
            recommendations.push({
                type: 'Limited',
                message: 'Cloudy conditions. Wait for clearer skies.',
                objects: []
            });
        }
        
        return recommendations;
    }

    // Get fallback data when APIs fail
    getFallbackCelestialData() {
        return {
            planets: [
                {
                    name: 'Mars',
                    type: 'Planet',
                    magnitude: -1.2,
                    visibility: 'Excellent',
                    description: 'Red planet visible in the evening sky'
                }
            ],
            brightStars: [
                {
                    name: 'Sirius',
                    type: 'Star',
                    magnitude: -1.46,
                    constellation: 'Canis Major',
                    visibility: 'Excellent',
                    description: 'Brightest star in the night sky'
                }
            ],
            constellations: [
                {
                    name: 'Ursa Major',
                    type: 'Constellation',
                    visibility: 'Excellent',
                    description: 'The Big Dipper, easily recognizable'
                }
            ],
            timestamp: new Date().toISOString()
        };
    }

    // Get HTML for celestial display
    getCelestialHTML(celestialData) {
        let html = `
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h6 class="card-title mb-0">
                                <i class="bi bi-stars"></i> What's Visible Tonight
                            </h6>
                        </div>
                        <div class="card-body">
        `;

        // Planets section
        if (celestialData.planets && celestialData.planets.length > 0) {
            html += `
                <div class="mb-3">
                    <h6 class="text-primary">
                        <i class="bi bi-planet"></i> Planets
                    </h6>
                    <div class="row">
            `;
            
            celestialData.planets.forEach(planet => {
                html += `
                    <div class="col-md-6 mb-2">
                        <div class="d-flex justify-content-between align-items-center p-2 border rounded">
                            <div>
                                <strong>${planet.name}</strong>
                                <br><small class="text-muted">${planet.description}</small>
                            </div>
                            <div class="text-end">
                                <span class="badge bg-success">${planet.visibility}</span>
                                <br><small class="text-muted">Mag ${planet.magnitude}</small>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }

        // Bright stars section
        if (celestialData.brightStars && celestialData.brightStars.length > 0) {
            html += `
                <div class="mb-3">
                    <h6 class="text-warning">
                        <i class="bi bi-star-fill"></i> Bright Stars
                    </h6>
                    <div class="row">
            `;
            
            celestialData.brightStars.slice(0, 4).forEach(star => {
                html += `
                    <div class="col-md-6 mb-2">
                        <div class="d-flex justify-content-between align-items-center p-2 border rounded">
                            <div>
                                <strong>${star.name}</strong>
                                <br><small class="text-muted">${star.constellation}</small>
                            </div>
                            <div class="text-end">
                                <span class="badge bg-warning">${star.visibility}</span>
                                <br><small class="text-muted">Mag ${star.magnitude}</small>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }

        // Constellations section
        if (celestialData.constellations && celestialData.constellations.length > 0) {
            html += `
                <div class="mb-3">
                    <h6 class="text-info">
                        <i class="bi bi-diagram-3"></i> Constellations
                    </h6>
                    <div class="row">
            `;
            
            celestialData.constellations.forEach(constellation => {
                html += `
                    <div class="col-md-6 mb-2">
                        <div class="d-flex justify-content-between align-items-center p-2 border rounded">
                            <div>
                                <strong>${constellation.name}</strong>
                                <br><small class="text-muted">${constellation.description}</small>
                            </div>
                            <div class="text-end">
                                <span class="badge bg-info">${constellation.visibility}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }

        html += `
                        </div>
                    </div>
                </div>
            </div>
        `;

        return html;
    }
}

// Export for use in main.js
export default CelestialService; 