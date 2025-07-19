// Copernicus Data Space Ecosystem Service
// Integrates OData API for enhanced environmental monitoring
// https://documentation.dataspace.copernicus.eu/APIs/OData.html

class CopernicusService {
    constructor() {
        this.baseUrl = 'https://catalogue.dataspace.copernicus.eu/odata/v1';
        this.collections = {
            SENTINEL_2: 'SENTINEL-2',
            SENTINEL_5P: 'SENTINEL-5P',
            SENTINEL_1: 'SENTINEL-1',
            LST: 'LST', // Land Surface Temperature
            NDVI: 'NDVI' // Vegetation Indices
        };
    }

    // Fetch recent products for a specific collection
    async fetchRecentProducts(collection, limit = 5) {
        try {
            const url = `${this.baseUrl}/Products?$filter=Collection/Name eq '${collection}'&$top=${limit}&$orderby=ContentDate/Start desc`;
            console.log(`🌍 Fetching recent ${collection} products...`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`✅ Found ${data.value ? data.value.length : 0} ${collection} products`);
            
            return data.value || [];
        } catch (error) {
            console.error(`❌ Error fetching ${collection} products:`, error.message);
            return [];
        }
    }

    // Fetch atmospheric data (Sentinel-5P)
    async fetchAtmosphericData(limit = 3) {
        try {
            console.log('🌤️ Fetching atmospheric composition data...');
            const products = await this.fetchRecentProducts(this.collections.SENTINEL_5P, limit);
            
            return products.map(product => ({
                name: product.Name,
                date: product.ContentDate?.Start,
                size: product.ContentLength,
                location: product.GeoFootprint ? 'Available' : 'Not available',
                type: 'Atmospheric Composition',
                description: 'Air quality and atmospheric transparency data'
            }));
        } catch (error) {
            console.error('❌ Error fetching atmospheric data:', error.message);
            return [];
        }
    }

    // Fetch cloud coverage data (Sentinel-2)
    async fetchCloudCoverageData(limit = 3) {
        try {
            console.log('☁️ Fetching cloud coverage data...');
            const products = await this.fetchRecentProducts(this.collections.SENTINEL_2, limit);
            
            return products.map(product => ({
                name: product.Name,
                date: product.ContentDate?.Start,
                size: product.ContentLength,
                location: product.GeoFootprint ? 'Available' : 'Not available',
                type: 'Cloud Coverage',
                description: 'Optical data for cloud detection and coverage analysis'
            }));
        } catch (error) {
            console.error('❌ Error fetching cloud coverage data:', error.message);
            return [];
        }
    }

    // Fetch land surface temperature data
    async fetchTemperatureData(limit = 3) {
        try {
            console.log('🌡️ Fetching land surface temperature data...');
            const products = await this.fetchRecentProducts(this.collections.LST, limit);
            
            return products.map(product => ({
                name: product.Name,
                date: product.ContentDate?.Start,
                size: product.ContentLength,
                location: product.GeoFootprint ? 'Available' : 'Not available',
                type: 'Land Surface Temperature',
                description: 'Temperature data for environmental conditions'
            }));
        } catch (error) {
            console.error('❌ Error fetching temperature data:', error.message);
            return [];
        }
    }

    // Fetch vegetation indices data
    async fetchVegetationData(limit = 3) {
        try {
            console.log('🌱 Fetching vegetation indices data...');
            const products = await this.fetchRecentProducts(this.collections.NDVI, limit);
            
            return products.map(product => ({
                name: product.Name,
                date: product.ContentDate?.Start,
                size: product.ContentLength,
                location: product.GeoFootprint ? 'Available' : 'Not available',
                type: 'Vegetation Indices',
                description: 'NDVI data for environmental monitoring'
            }));
        } catch (error) {
            console.error('❌ Error fetching vegetation data:', error.message);
            return [];
        }
    }

    // Get comprehensive environmental data for StarWX
    async getEnvironmentalData() {
        try {
            console.log('🌍 Fetching comprehensive environmental data for StarWX...');
            
            const [atmospheric, cloudCoverage, temperature, vegetation] = await Promise.allSettled([
                this.fetchAtmosphericData(),
                this.fetchCloudCoverageData(),
                this.fetchTemperatureData(),
                this.fetchVegetationData()
            ]);
            
            const environmentalData = {
                atmospheric: atmospheric.status === 'fulfilled' ? atmospheric.value : [],
                cloudCoverage: cloudCoverage.status === 'fulfilled' ? cloudCoverage.value : [],
                temperature: temperature.status === 'fulfilled' ? temperature.value : [],
                vegetation: vegetation.status === 'fulfilled' ? vegetation.value : [],
                timestamp: new Date().toISOString()
            };
            
            console.log('✅ Environmental data fetched successfully');
            return environmentalData;
        } catch (error) {
            console.error('❌ Error fetching environmental data:', error.message);
            return {
                atmospheric: [],
                cloudCoverage: [],
                temperature: [],
                vegetation: [],
                timestamp: new Date().toISOString()
            };
        }
    }

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } catch (error) {
            return dateString;
        }
    }

    // Generate stargazing recommendations based on environmental data
    generateStargazingRecommendations(environmentalData) {
        const recommendations = [];
        
        // Check atmospheric data availability
        if (environmentalData.atmospheric.length > 0) {
            const latestAtmospheric = environmentalData.atmospheric[0];
            const atmosphericDate = this.formatDate(latestAtmospheric.date);
            recommendations.push({
                type: 'Atmospheric',
                status: 'Active',
                description: `Latest data: ${atmosphericDate} - Air quality monitoring active`,
                icon: '🌤️',
                details: `Sentinel-5P atmospheric composition data available. Monitoring air quality, transparency, and atmospheric conditions for optimal stargazing.`
            });
        }
        
        // Check cloud coverage data availability
        if (environmentalData.cloudCoverage.length > 0) {
            const latestCloud = environmentalData.cloudCoverage[0];
            const cloudDate = this.formatDate(latestCloud.date);
            recommendations.push({
                type: 'Cloud Coverage',
                status: 'Active',
                description: `Latest data: ${cloudDate} - Cloud detection active`,
                icon: '☁️',
                details: `Sentinel-2 optical data available. Real-time cloud coverage analysis for viewing condition assessment.`
            });
        }
        
        // Check temperature data availability
        if (environmentalData.temperature.length > 0) {
            const latestTemp = environmentalData.temperature[0];
            const tempDate = this.formatDate(latestTemp.date);
            recommendations.push({
                type: 'Temperature',
                status: 'Active',
                description: `Latest data: ${tempDate} - Surface temperature monitoring`,
                icon: '🌡️',
                details: `Land surface temperature data available. Environmental condition monitoring for stargazing comfort.`
            });
        }
        
        // Check vegetation data availability
        if (environmentalData.vegetation.length > 0) {
            const latestVeg = environmentalData.vegetation[0];
            const vegDate = this.formatDate(latestVeg.date);
            recommendations.push({
                type: 'Vegetation',
                status: 'Active',
                description: `Latest data: ${vegDate} - Environmental monitoring`,
                icon: '🌱',
                details: `NDVI vegetation indices available. Environmental health monitoring for optimal viewing conditions.`
            });
        }
        
        return recommendations;
    }

    // Generate specific stargazing insights based on environmental data
    generateStargazingInsights(environmentalData) {
        const insights = [];
        
        // Analyze atmospheric data
        if (environmentalData.atmospheric.length > 0) {
            const latest = environmentalData.atmospheric[0];
            const dataAge = this.getDataAge(latest.date);
            
            if (dataAge < 24) {
                insights.push({
                    type: 'Atmospheric',
                    message: 'Recent atmospheric data available - good transparency conditions likely',
                    icon: '🌤️',
                    confidence: 'High'
                });
            } else {
                insights.push({
                    type: 'Atmospheric',
                    message: 'Atmospheric data available but may be dated - check local conditions',
                    icon: '🌤️',
                    confidence: 'Medium'
                });
            }
        }
        
        // Analyze cloud coverage data
        if (environmentalData.cloudCoverage.length > 0) {
            const latest = environmentalData.cloudCoverage[0];
            const dataAge = this.getDataAge(latest.date);
            
            if (dataAge < 12) {
                insights.push({
                    type: 'Cloud Coverage',
                    message: 'Recent cloud coverage data - current viewing conditions available',
                    icon: '☁️',
                    confidence: 'High'
                });
            } else {
                insights.push({
                    type: 'Cloud Coverage',
                    message: 'Cloud data available but may need local verification',
                    icon: '☁️',
                    confidence: 'Medium'
                });
            }
        }
        
        // Analyze temperature data
        if (environmentalData.temperature.length > 0) {
            insights.push({
                type: 'Temperature',
                message: 'Surface temperature data available for environmental comfort assessment',
                icon: '🌡️',
                confidence: 'High'
            });
        }
        
        // Analyze vegetation data
        if (environmentalData.vegetation.length > 0) {
            insights.push({
                type: 'Environmental',
                message: 'Environmental health data available for optimal viewing conditions',
                icon: '🌱',
                confidence: 'High'
            });
        }
        
        return insights;
    }

    // Calculate data age in hours
    getDataAge(dateString) {
        if (!dateString) return 999;
        try {
            const dataDate = new Date(dateString);
            const now = new Date();
            const diffHours = (now - dataDate) / (1000 * 60 * 60);
            return diffHours;
        } catch (error) {
            return 999;
        }
    }
}

// Export the service
window.CopernicusService = CopernicusService; 