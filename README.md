# PRAYAS : Prevention, Response And Yojana for Aapda Suraksha
PRAYAS (Endeavor/Effort) is a comprehensive, AI-powered disaster management platform designed to build safer, flood-resilient communities in India. By integrating real-time meteorological data, digital elevation models, and historical community-driven inputs, PRAYAS provides a holistic solution for flood prevention, emergency response and transparent relief fund allocation.

# Overview
Floods in India cause massive loss of life and property annually. PRAYAS aims to bridge the gap between data and action. The platform serves two main user groups: Citizens (seeking safety and information) and Authorities/Admins (managing resources and alerts).

Core Objective: To provide an "Interactive Map Interface" that acts as a central hub for simulation, routing, and risk visualization, supported by a transparent financial dashboard for relief funds.




https://github.com/user-attachments/assets/321dcb34-c226-47b9-ad78-7eba9818c3e1




# System Workflow
The system architecture flows from data ingestion to user action:

  1. Data Ingestion: Live Weather APIs, Digital Elevation Models (DEM), and Historical Flood Data are fed into the system.
  2. AI Risk Model: Processes this data to continuously update risk predictions.
  3. User Interface: Users access the Main Dashboard via a secure Login/Sign-up.
  4. Actionable Modules: From the dashboard, users can access Maps, Funds, News, and Emergency services.

(Refer to the `Workflow.jpg` in the repository for visual architecture)

# Key Features
### 1. Interactive Map Interface
- Real-Time Flood Risk: Visualizes risk zones based on live rainfall data and terrain elevation.
- "What-If" Simulations: An interactive slider allows users to simulate rainfall (e.g., 50mm vs 150mm) to see how floodwaters might expand over local streets.
- Safe Shelters: Locate nearest relief camps with real-time capacity info.
- Evacuation Routes: AI-generated safe walking/driving routes avoiding flooded zones.
- Bilingual Narration: Text-to-Speech navigation and briefings in English and Hindi.

### 2. Relief Funds Dashboard (Transparency Module)
#### Public View:

  - See total fund summaries.
  - View allocation charts by category (Food, Medical, Reconstruction).
  - Track recent donations and government allocations in real-time.

#### Admin View:

  - Secure portal to add new donations and manage fund distribution.

### 3. Community & Safety Services

- Real-time Alert System: Pushes immediate notifications (SMS/App Alerts) to users in high-risk geo-fenced areas.
- Raise a Ticket: Users can report trapped victims or infrastructure damage directly to authorities.
- Local News Feed: Curated updates regarding the disaster in the specific locality.
- Emergency Contacts: One-tap access to NDRF, Police, Ambulance, and Fire services.

### 4. AI-Powered Risk Model

- Integrates Digital Elevation Models (DEM) for granular, street-level flood prevention.
- Uses historical flooding patterns to validate current risk levels.

# Tech Stack
- Frontend Framework: React.js
- Mapping Engine: Leaflet.js, OpenStreetMap
- Database & Realtime: Firebase Realtime Database (for Shelters, Alerts, and Fund data)
- Authentication: Firebase Authentication
- AI & Processing:
  - Google Gemini API: For generating safety briefings and situational analysis.
  - OpenWeatherMap API: For live meteorological data.
  - Overpass API (OSM): For fetching real-time road network data.
- Authentication: Firebase Authentication.

# Installation & Setup
**Prerequisites**
- Node.js (v16 or higher)
- `npm` or `yarn`

**Steps**
1. Clone the Repository

~~~BASH
git clone https://github.com/suryanandanbabbar/PRAYAS.git
cd PRAYAS
~~~

2. Install Dependencies
Navigate to the project directory and install the required packages from `package.json`.
~~~BASH
npm install
~~~

3. Configure API Keys Open map.html and addShelter.html. Replace the placeholder keys with your actual credentials:
- `firebaseConfig`: Your Firebase project configuration.
- `OPENWEATHER_API_KEY`: Your OpenWeatherMap key.
- `Gemini API Key`: Your Google GenAI key.

4. Database Rules (Firebase) Ensure your Firebase Realtime Database rules allow read/write for the shelter functionality during testing:
~~~JSON
   {
  "rules": {
    "shelters": {
      ".read": true,
      ".write": true
    }
  }
}
~~~
5. Start the Development Server
Runs the app in the development mode.
~~~BASH
npm start
~~~

# Future Roadmap

- IoT Integration: Connect with river-level sensors for automated trigger alerts.
- Offline Mode: PWA implementation to allow map access via SMS/USSD data caching.
- Crowdsourcing: Allow users to upload photos of flooded streets to validate the AI model.
- Blockchain: Implement blockchain for the Relief Funds module to ensure 100% auditability.
