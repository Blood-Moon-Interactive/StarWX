# StarWX - Astronomical Events & Weather Forecasting

## Project Overview
StarWX is a web application that combines astronomical events, space launches, and weather forecasting to help users determine optimal viewing conditions for celestial events. The platform provides location-based recommendations for viewing comets, meteor showers, eclipses, and space launches based on local weather conditions.

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
  - [x] Unified dashboard with weather and astronomical data
  - [x] Astronomical events list with best viewing times
  - [x] APOD modal (on-demand loading)
  - [x] Date range filtering with custom and predefined ranges
  - [x] Loading states and user feedback

- [x] **Weather Integration**
  - [x] Current weather conditions with dual temperature display (°F/°C)
  - [x] Multi-API support (NWS for US, WeatherAPI.com for international)
  - [x] Sky visibility indicators and viewing conditions
  - [x] Cloud cover analysis and weather condition badges
  - [x] Temperature validation and fallback data

- [x] **Astronomical Data**
  - [x] NASA Astronomy Picture of the Day (APOD)
  - [x] NASA JPL APIs for astronomical events
  - [x] Near Earth Objects (asteroids, comets)
  - [x] Real-time astronomical event tracking
  - [x] Best viewing times and weather conditions for events

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
- **Astronomical APIs**: 
  - ✅ NASA APOD (Astronomy Picture of the Day)
  - ✅ NASA JPL APIs for astronomical events
  - ✅ NASA NEO (Near Earth Objects) - asteroids and comets
  - ✅ NASA EPIC (Earth Polychromatic Imaging Camera)
- **Geocoding**: Manual location input with coordinate support

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

**Last Updated**: 7/19/2025
**Project Status**: Frontend MVP Complete with Enhanced UI/UX
**Next Milestone**: Backend Development 