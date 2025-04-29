# NOOV_ Time Awareness Tool

A time awareness tool built around Islamic prayer times that divides the day into 7 flexible segments.

## Architecture

### Core Principles
- Idiomatic directory structure
- Self-contained modules
- Clean interfaces between components

### Directory Structure

ost-noov/ ├── src/ │ ├── components/ # React components │ │ ├── Timer/ # Timer component │ │ ├── Segments/ # Segment visualization │ │ └── Location/ # Location handling │ ├── services/ # Core services │ │ └── prayerTimes.ts # Prayer times API integration │ ├── hooks/ # Custom React hooks │ ├── types/ # TypeScript types │ └── utils/ # Utility functions └── tests/ # Test files

### Modules

1. **Prayer Times Service** (Priority 1)
- Aladhan API integration
- Location handling (geolocation + city input)
- Daily prayer times caching
- Segment calculations

2. **Timer Module** (Priority 2)
- Custom timer implementation using `use-timer`
- Timer state persistence
- Timer controls

3. **Segment Visualization** (Priority 3)
- Circular progress using `react-circular-progressbar`
- Current segment display
- Next segment calculation

4. **Location Handler** (Priority 4)
- Browser geolocation
- City name input
- Location persistence

### Data Structures

```typescript
type Segment = {
  name: 'Layl' | 'Fajr' | 'Subuh' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'
  startTime: Date
  endTime: Date
}

type PrayerTimes = {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

type Location = {
  type: 'coordinates' | 'city'
  value: {
    lat?: number
    lng?: number
    cityName?: string
  }
}
```

local Storage
Location preferences
Active timer state
Daily prayer times cache
Current segment
External Dependencies
use-timer: Timer implementation
react-circular-progressbar: Segment visualization
Aladhan API: Prayer times data
Development Plan
Phase 1: Core Services
Set up project structure
Implement prayer times service
Add location handling
Create basic data management
Phase 2: UI Components
Implement timer component
Build segment visualization
Add location input UI
Create basic layout
Phase 3: Integration
Connect all components
Add persistence layer
Implement error handling
Add loading states
Phase 4: Polish
Add transitions/animations
Improve error messages
Add loading indicators
Implement dark theme
Integration with ost-website
To be implemented as a standalone module first
Will be integrated into toolset section
Will maintain cosmic/geometric theme