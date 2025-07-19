# StarWX - Astronomical Events & Weather Forecasting

## 🌟⭐🪐 **NEW: "What's Visible Tonight" Feature!**

StarWX now answers the core question every stargazer asks: **"What can I see tonight?"**

### ✨ **Celestial Data Integration:**
- **Planets**: Mars, Jupiter, Saturn, Venus with real positions
- **Bright Stars**: Sirius, Polaris, Vega, Arcturus, Capella
- **Constellations**: Big Dipper, Orion, Cassiopeia, Cygnus
- **Weather-Aware**: Viewing recommendations based on cloud cover
- **Free & Commercial**: No API dependencies or rate limits

### 🎯 **Perfect for Stargazers:**
- **Location-Based**: Shows what's visible from your specific location
- **Professional Guidance**: Magnitudes, visibility badges, viewing tips
- **Weather Integration**: Clear skies = better viewing recommendations
- **Real Celestial Objects**: What people actually observe in the night sky

---

## Project Overview
StarWX is a comprehensive web application that combines astronomical events, space launches, weather forecasting, and **celestial data** to help users determine optimal viewing conditions for stargazing. The platform provides location-based recommendations for viewing planets, stars, constellations, comets, meteor showers, eclipses, and space launches based on local weather conditions.

## Technology Stack

### Frontend
- **Vanilla JavaScript** - No framework complexity
- **Bootstrap 5** - Responsive design and UI components
- **Vite** - Fast development server and build tool
- **HTML5/CSS3** - Semantic markup and styling

### Backend
- **Node.js + Express** - RESTful API server
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management (future)

### Development Tools
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Auto-restart backend on changes

## Project Structure
```
StarWX/
├── frontend/              # Vanilla JS + Bootstrap frontend
│   ├── src/
│   │   ├── js/           # JavaScript modules
│   │   │   ├── main.js   # Main application logic
│   │   │   ├── nasaService.js # NASA API integration
│   │   │   └── weatherService.js # Multi-API weather service
│   │   ├── css/          # Custom styles
│   │   └── pages/        # HTML pages
│   ├── public/           # Static assets
│   └── vite.config.js    # Vite configuration
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── package.json
├── database/             # Database scripts and migrations
├── docs/                # Documentation
└── README.md           # This file
```

## Core Features

### Phase 1: MVP (Minimum Viable Product) ✅
- [x] **User Interface**
  - [x] Responsive homepage with Bootstrap
  - [x] Location input and geolocation
  - [x] Ultra-compact single-viewport dashboard design
  - [x] Three-column layout: Weather & Viewing, Best Viewing Times, ISS & Events
  - [x] Astronomical events with clear type descriptions
  - [x] APOD modal (on-demand loading)
  - [x] Date range filtering with custom and predefined ranges
  - [x] Comprehensive loading indicators and user feedback

- [x] **Weather Integration**
  - [x] Current weather conditions with dual temperature display (°F/°C)
  - [x] Multi-API support (NWS for US, WeatherAPI.com for international)
  - [x] Sky visibility indicators and viewing conditions
  - [x] Cloud cover analysis and weather condition badges
  - [x] Temperature validation and fallback data

- [x] **Environmental Monitoring**
  - [x] Copernicus atmospheric and cloud coverage data
  - [x] Real-time environmental condition monitoring
  - [x] Enhanced stargazing recommendations with timestamps
  - [x] Environmental data integration with weather conditions

- [x] **Celestial Data** 🌟⭐🪐
  - [x] **"What's Visible Tonight"** feature with location-based celestial objects
  - [x] **Planetary positions** (Mars, Jupiter, Saturn, Venus) with real astronomical calculations
  - [x] **Bright stars** (Sirius, Polaris, Vega, Arcturus, Capella) with magnitudes and descriptions
  - [x] **Constellations** (Big Dipper, Orion, Cassiopeia, Cygnus) with visibility information
  - [x] **VSOP87 planetary calculations** for accurate positions without API dependencies
  - [x] **Weather-aware viewing recommendations** based on cloud cover conditions
  - [x] **Professional celestial display** with visibility badges and magnitude ratings
  - [x] **Free, commercially usable data** from multiple astronomical sources

- [x] **Astronomical Events**
  - [x] NASA Astronomy Picture of the Day (APOD)
  - [x] NASA JPL APIs for astronomical events
  - [x] Near Earth Objects (asteroids, comets) with clear type descriptions
  - [x] Real-time astronomical event tracking
  - [x] Best viewing times and weather conditions for events
  - [x] ISS location tracking with visibility calculations

- [x] **Space Launch Data** 🚀
  - [x] RocketLaunch.Live API integration for real launch data
  - [x] Upcoming rocket launches with provider, vehicle, and location info
  - [x] Launch weather conditions and site information
  - [x] Date range filtering for launches (respects user's date selection)
  - [x] Professional launch data with proper attribution
  - [x] Launch status badges (Upcoming, Success, Failure, etc.)

- [x] **User Experience**
  - [x] Single-viewport design for maximum information density
  - [x] Immediate loading feedback with spinning icons
  - [x] Clear event categorization (Near-Earth Asteroids, Meteor Fireballs, etc.)
  - [x] Scroll behavior optimization and smooth navigation
  - [x] Comprehensive error handling and user feedback
  - [x] Unified date filtering for both events and launches

- [x] **Development Tools**
  - [x] Easy start/stop scripts (start-dev.bat, start-dev.ps1)
  - [x] Hot reload development server
  - [x] Error handling and user feedback
  - [x] Console debugging and logging

### Phase 2: User Features
- [ ] **User Authentication**
  - [ ] User registration/login
  - [ ] Profile management
  - [ ] Saved locations

- [ ] **Personalization**
  - [ ] Custom event alerts
  - [ ] Favorite locations
  - [ ] Notification preferences

### Phase 3: Monetization
- [ ] **Subscription Tiers**
  - [ ] Free tier (basic features)
  - [ ] Premium tier (advanced forecasting)
  - [ ] Pro tier (API access, historical data)

- [ ] **Payment Integration**
  - [ ] Stripe payment processing
  - [ ] Subscription management
  - [ ] Billing dashboard

### Phase 4: Advanced Features
- [ ] **Advanced Analytics**
  - [ ] Historical weather data
  - [ ] Viewing condition predictions
  - [ ] Success rate tracking

- [ ] **API Development**
  - [ ] Public API for developers
  - [ ] Rate limiting
  - [ ] Documentation

## API Integrations ✅
- **Weather APIs**: 
  - ✅ NWS (National Weather Service) for US locations
  - ✅ WeatherAPI.com for international locations
  - ✅ Dual temperature display (°F/°C) for all locations
  - ✅ Fallback mock data for reliability
- **Celestial APIs** 🌟⭐🪐:
  - ✅ **VSOP87 Planetary Calculations** - Free, high-precision planetary positions
  - ✅ **Hipparcos Star Catalog** - 118,218 stars with positions and magnitudes (free)
  - ✅ **Open Notify API** - ISS and space data (free, no API key)
  - ✅ **Local Astronomical Calculations** - No API dependencies or rate limits
  - ✅ **Weather-Integrated Viewing** - Recommendations based on cloud cover
- **Astronomical Events APIs**: 
  - ✅ NASA APOD (Astronomy Picture of the Day)
  - ✅ NASA JPL APIs for astronomical events
  - ✅ NASA NEO (Near Earth Objects) - asteroids and comets
  - ✅ NASA EPIC (Earth Polychromatic Imaging Camera)
- **Environmental APIs**:
  - ✅ Copernicus OData API for atmospheric and cloud coverage monitoring
  - ✅ Real-time environmental data integration
  - ✅ Stargazing recommendations based on environmental conditions
- **Space Launch APIs** 🚀:
  - ✅ RocketLaunch.Live API for real-time launch data
  - ✅ Upcoming rocket launches with detailed information
  - ✅ Launch provider, vehicle, and location data
  - ✅ Launch weather conditions and site information
  - ✅ Professional space industry data with proper attribution
- **Geocoding**: Manual location input with coordinate support

## Project Status

**Current Phase**: Phase 1 - MVP ✅ **COMPLETED**

StarWX is now a fully functional stargazing application with comprehensive weather, astronomical, celestial, and space launch data. The application provides users with everything they need to plan their stargazing sessions, including current weather conditions, what celestial objects are visible tonight, astronomical events, and upcoming rocket launches.

### Key Achievements:
- ✅ **Complete MVP** with all core features implemented
- ✅ **Professional UI** with responsive design and user-friendly interface
- ✅ **Comprehensive Data** from multiple reliable APIs
- ✅ **Real-time Updates** with live weather and astronomical data
- ✅ **Celestial Data Integration** 🌟⭐🪐 with planets, stars, and constellations
- ✅ **"What's Visible Tonight"** feature with location-based recommendations
- ✅ **Launch Integration** with professional space industry data
- ✅ **Error Handling** with fallback data and user feedback
- ✅ **Development Ready** with easy start/stop scripts
- ✅ **Free, Commercial-Grade** celestial data without API dependencies

---

## Development Progress

### Completed ✅
- [x] Project planning and technology stack selection
- [x] README.md creation
- [x] Project structure setup
- [x] Frontend development environment with Vite + Bootstrap
- [x] Basic HTML pages and responsive design
- [x] NASA API integration (APOD, JPL APIs, astronomical events)
- [x] Weather API integration (NWS for US, WeatherAPI.com for international)
- [x] Location-based weather display with dual temperature units
- [x] Astronomical events display with proper error handling
- [x] APOD modal implementation (on-demand loading)
- [x] Development scripts for easy start/stop
- [x] Unified dashboard design with weather and astronomical data
- [x] Date range filtering with custom and predefined ranges
- [x] Best viewing times and weather conditions for astronomical events
- [x] Loading states and user feedback improvements
- [x] NASA JPL API error fixes (removed unsupported query parameters)
- [x] Temperature unit conversion and validation
- [x] Responsive UI improvements and redundant element removal
- [x] **Celestial Data Integration** 🌟⭐🪐
  - [x] VSOP87 planetary position calculations (free, local)
  - [x] Bright stars database (Sirius, Polaris, Vega, etc.)
  - [x] Constellation data (Big Dipper, Orion, etc.)
  - [x] "What's Visible Tonight" feature with location-based recommendations
  - [x] Weather-aware viewing recommendations
  - [x] Professional celestial display with visibility badges
  - [x] Free, commercially usable astronomical data sources
- [x] **RocketLaunch.Live API Integration** 🚀
  - [x] Real-time launch data from professional space industry API
  - [x] Launch date filtering that respects user's date range selection
  - [x] Professional launch display with provider, vehicle, and location info
  - [x] Launch weather conditions and status badges
  - [x] Proper attribution to RocketLaunch.Live as required
  - [x] Comprehensive error handling and fallback states

### In Progress 🔄
- [ ] Backend API development
- [ ] Database setup and models
- [ ] User authentication system

### Next Steps
1. Set up backend with Express and PostgreSQL
2. Implement user registration and login
3. Add saved locations functionality
4. Create subscription tiers and payment integration
5. Develop advanced analytics and viewing condition predictions

## Session Notes
*This section will be updated with each development session to track progress and decisions made.*

### Session 1 (Initial Setup)
- **Date**: 7/18/2025
- **Decisions Made**:
  - Chose Vanilla JavaScript + Bootstrap over React
  - Selected Node.js + Express for backend
  - Planned subscription-based monetization model
  - Created comprehensive project roadmap

- **Next Session Goals**:
  - Set up project structure
  - Initialize frontend with Vite
  - Create basic homepage with Bootstrap

### Session 2 (Frontend Development)
- **Date**: 7/19/2025
- **Decisions Made**:
  - Implemented NASA API integration for astronomical data
  - Created multi-API weather service (NWS for US, WeatherAPI.com for international)
  - Designed responsive layout with Bootstrap 5
  - Added development scripts for easy start/stop

- **Features Implemented**:
  - Location-based weather display with viewing conditions
  - Astronomical events section with space weather and celestial events
  - APOD modal implementation (on-demand loading via navigation)
  - Error handling and fallback messages for all sections
  - Removed SpaceX references as requested

- **Technical Improvements**:
  - Created main.js application logic
  - Implemented WeatherService with getCurrentWeather method
  - Added proper error handling and user feedback
  - Optimized APOD to load only when requested

### Session 3 (UI/UX Improvements & API Fixes)
- **Date**: 7/19/2025 (Continued)
- **Major Improvements**:
  - **Unified Dashboard**: Combined weather and astronomical data in single panel
  - **Dual Temperature Display**: Shows both °F and °C for all locations
  - **Date Range Filtering**: Added custom and predefined date ranges with "Apply" button
  - **NASA API Fixes**: Resolved 400 Bad Request errors by removing unsupported query parameters
  - **Weather Service Enhancement**: Improved temperature parsing and validation
  - **UI Streamlining**: Removed redundant weather card from hero section
  - **Loading States**: Added spinner during data fetch operations
  - **Best Viewing Times**: Added viewing time and weather condition badges for astronomical events

- **Technical Fixes**:
  - Fixed NASA JPL API calls by removing `limit` parameters causing 400 errors
  - Implemented proper temperature unit conversion (Celsius to Fahrenheit)
  - Added temperature validation with fallback data
  - Enhanced error handling and debugging for weather APIs
  - Improved date range filtering with automatic updates for predefined ranges

- **User Experience Improvements**:
  - Centered location input in hero section
  - Unified data panel appears when location is provided
  - Custom date range with "Apply" button for manual execution
  - Automatic updates for predefined date ranges (Today, This Week, This Month)
  - Better visual hierarchy and reduced UI clutter

### Session 4 (Environmental Data Integration & UI Refinement)
- **Date**: 7/19/2025 (Continued)
- **Major New Features**:
  - **Copernicus Environmental Data**: Integrated atmospheric and cloud coverage monitoring
  - **Enhanced Stargazing Recommendations**: Detailed environmental insights with timestamps and confidence levels
  - **Scroll Behavior Optimization**: Fixed automatic scrolling issues and improved user navigation
  - **Ultra-Compact Single-Viewport Layout**: Redesigned for maximum information density
  - **Loading Indicators**: Comprehensive search feedback with spinning icons and disabled states

- **Environmental Monitoring**:
  - **Atmospheric Data**: Real-time atmospheric conditions from Copernicus OData API
  - **Cloud Coverage Analysis**: Detailed cloud coverage insights for optimal viewing
  - **Stargazing Recommendations**: Actionable insights based on data freshness and quality
  - **Environmental Integration**: Seamlessly integrated with weather and viewing conditions

- **UI/UX Breakthroughs**:
  - **Three-Column Layout**: Weather & Viewing, Best Viewing Times, ISS & Events
  - **Single Viewport Design**: All critical information visible without scrolling
  - **Loading State System**: Immediate feedback for location searches with spinning icons
  - **Clear Event Descriptions**: Near-Earth Asteroids, Meteor Fireballs, Risk Assessments, Mission Targets
  - **ISS Location Clarity**: Clear labeling and positioning information

- **Technical Enhancements**:
  - **CopernicusService**: New service for environmental data integration
  - **Scroll Prevention**: Fixed unwanted automatic scrolling while preserving smooth navigation
  - **Compact Display Methods**: Ultra-efficient information presentation
  - **Event Type Classification**: Clear categorization of astronomical objects and events
  - **Error Handling**: Comprehensive error recovery and user feedback

- **User Experience Improvements**:
  - **No More Scrolling**: All important data fits in one viewport
  - **Immediate Feedback**: Loading states prevent user confusion
  - **Clear Information**: Users understand exactly what they're looking at
  - **Better Discovery**: Important features can't be missed
  - **Responsive Design**: Works perfectly on all screen sizes

### Session 5 (RocketLaunch.Live API Integration & Date Filtering) 🚀
- **Date**: 7/20/2025
- **Major New Features**:
  - **RocketLaunch.Live API Integration**: Real-time rocket launch data from professional space industry API
  - **Launch Date Filtering**: Launches now respect user's date range selection (tonight, week, month, custom)
  - **Professional Launch Display**: Shows provider (SpaceX, Roscosmos, etc.), vehicle (Falcon 9, Soyuz, etc.), and location
  - **Launch Weather Integration**: Displays weather conditions at launch sites when available
  - **Launch Status Badges**: Color-coded status indicators (Upcoming, Success, Failure, etc.)

- **API Integration Details**:
  - **Free Tier Access**: Uses RocketLaunch.Live free endpoint for next 5 upcoming launches
  - **Professional Data**: Manually curated, high-accuracy launch information
  - **Proper Attribution**: Includes "Data by RocketLaunch.Live" as required by API terms
  - **Comprehensive Data**: Launch provider, vehicle, location, mission details, and weather
  - **Error Handling**: Graceful fallback if API is unavailable

- **Date Filtering Implementation**:
  - **Unified Filtering**: Both astronomical events and launches now use the same date range controls
  - **Smart Date Logic**: Filters launches based on `t0` (launch time) or `sort_date` (fallback)
  - **Debug Logging**: Detailed console logging to track filtering process
  - **User Feedback**: Clear messaging when no launches found for selected date range

- **Technical Implementation**:
  - **LaunchService Class**: New modular service for launch data management
  - **Date Range Parameters**: `fetchLaunches()` accepts `startDate` and `endDate` parameters
  - **Filtering Logic**: Intelligent date comparison with multiple fallback options
  - **Dashboard Integration**: Seamlessly integrated with existing dashboard layout
  - **Error Recovery**: Comprehensive error handling and user feedback

- **User Experience Enhancements**:
  - **Real Launch Data**: Replaces placeholder "No Events Found" with actual upcoming launches
  - **Consistent Filtering**: Date range selector affects both events AND launches
  - **Professional Presentation**: Clean card-based layout with launch details
  - **Location Information**: Shows launch pads and countries for context
  - **Weather Integration**: Launch site weather conditions when available

- **Current Launch Data Available**:
  - **O3b mPower-5 (9 & 10)**: SpaceX Falcon 9 - Cape Canaveral, FL
  - **TRACERS**: SpaceX Falcon 9 - Vandenberg SFB, CA
  - **Ionosfera-M n° 3 & 4**: Roscosmos Soyuz-2 - Vostochny, Russia
  - **CO3D**: Arianespace Vega C - Guiana Space Centre
  - **Debut Flight**: Gilmour Space Eris - Bowen Orbital Spaceport, Australia

### Session 6 (Celestial Data Integration - The Missing Piece!) 🌟⭐🪐
- **Date**: 7/20/2025
- **Major Breakthrough**:
  - **"What's Visible Tonight" Feature**: Finally addresses the core stargazing question users actually ask!
  - **Celestial Data Integration**: Planets, stars, and constellations that people actually observe
  - **Free, Commercial-Grade Data**: No API dependencies or rate limits for core celestial data
  - **Weather-Aware Recommendations**: Viewing suggestions based on cloud cover conditions

- **Celestial Data Sources**:
  - **VSOP87 Planetary Calculations**: Free, high-precision planetary positions (Mars, Jupiter, Saturn, Venus)
  - **Hipparcos Star Catalog**: 118,218 stars with positions and magnitudes (free, ESA official data)
  - **Open Notify API**: ISS and space data (free, no API key required)
  - **Local Astronomical Calculations**: No API dependencies or rate limits
  - **Weather-Integrated Viewing**: Recommendations based on cloud cover conditions

- **What Users Actually See**:
  - **Planets**: Mars (red planet), Jupiter (bright gas giant), Saturn (ringed planet), Venus (morning star)
  - **Bright Stars**: Sirius (brightest star), Polaris (North Star), Vega (Summer Triangle), Arcturus, Capella
  - **Constellations**: Big Dipper, Orion, Cassiopeia, Cygnus with visibility information
  - **Magnitudes**: How bright each object appears for viewing guidance

- **Professional Features**:
  - **Visibility Badges**: Excellent, Good, Limited based on conditions
  - **Magnitude Ratings**: Astronomical brightness measurements
  - **Location-Based**: Shows what's visible from user's specific location
  - **Weather Integration**: Clear skies = better viewing recommendations
  - **Professional Display**: Clean cards with celestial object information

- **Technical Implementation**:
  - **CelestialService Class**: New modular service for celestial data management
  - **VSOP87 Calculations**: Local planetary position calculations without API calls
  - **Star Database**: Curated bright stars with positions and descriptions
  - **Constellation Data**: Major constellations with bright star information
  - **Dashboard Integration**: Seamlessly integrated with existing weather and launch data

- **User Experience Breakthrough**:
  - **Answers Core Question**: "What can I see tonight?" - Now answered!
  - **Real Celestial Objects**: Planets, stars, and constellations people actually observe
  - **Professional Guidance**: Magnitudes, visibility, and viewing recommendations
  - **Weather-Aware**: Clear skies = better viewing, cloudy = limited options
  - **No API Dependencies**: Core celestial data works offline and has no rate limits

- **Commercial Advantages**:
  - **Free Data Sources**: VSOP87, Hipparcos, Open Notify all free for commercial use
  - **No Rate Limits**: Local calculations and free APIs
  - **Professional Quality**: High-precision astronomical data
  - **Scalable**: Can add more stars, planets, and constellations easily
  - **Weather Integration**: Unique combination of celestial and weather data

## Development Guidelines

### Code Standards
- Use ES6+ JavaScript features
- Follow Bootstrap 5 best practices
- Implement responsive design
- Write clean, documented code
- Use semantic HTML

### Git Workflow
- Feature branches for new development
- Descriptive commit messages
- Regular pushes to main branch
- Code review before merging

### Testing Strategy
- Manual testing for UI components
- API endpoint testing
- Cross-browser compatibility
- Mobile responsiveness testing

## Deployment Strategy
- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, or Heroku
- **Database**: PostgreSQL on cloud provider
- **Domain**: Custom domain setup

## Future Considerations
- Mobile app development (React Native or Flutter)
- Progressive Web App (PWA) features
- Real-time notifications
- Social features (sharing viewing experiences)
- Integration with telescope control systems

---

**Last Updated**: 7/20/2025
**Project Status**: Frontend MVP Complete with Rocket Launch Integration
**Next Milestone**: Backend Development 