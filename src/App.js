import React, { useState, useEffect } from 'react';
import './App.css';
import Reports from './pages/Reports';
import Map from './pages/Map';
import Help from './pages/Help';
import Fund from './pages/Fund'; // Import the Fund component

// Header Component
const Header = ({ darkMode, toggleDarkMode, setCurrentPage, currentPage }) => {
	const [currentTime, setCurrentTime] = useState('');

	useEffect(() => {
		const updateTime = () => {
			const now = new Date();
			const dateOptions = {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			};
			const timeOptions = {
				hour: '2-digit',
				minute: '2-digit',
			};

			const dateStr = now.toLocaleDateString('en-US', dateOptions);
			const timeStr = now.toLocaleTimeString('en-US', timeOptions);

			setCurrentTime(`${dateStr} • ${timeStr}`);
		};

		updateTime();
		const interval = setInterval(updateTime, 60000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="header">
			<div className="header-left">
				<h1>PRAYAS</h1>
				<p>{currentTime}</p>
			</div>
			<div className="header-icons">
				<div
					className="icon-card"
					onClick={() => setCurrentPage('report')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="icon-svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					<span>Reports</span>
				</div>

				{/* New Funds Icon */}
				<div
					className="icon-card"
					onClick={() => setCurrentPage('funds')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="icon-svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>Funds</span>
				</div>

				<div
					className="icon-card"
					onClick={() => setCurrentPage('map')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="icon-svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11a2 2 0 100-4 2 2 0 000 4z"
						/>
					</svg>
					<span>Map</span>
				</div>

				<div
					className="icon-card"
					onClick={() => setCurrentPage('help')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="icon-svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.5 4.5a1 1 0 01-.217 1.013l-2.1 2.1a11.042 11.042 0 005.516 5.516l2.1-2.1a1 1 0 011.013-.217l4.5 1.5a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z"
						/>
					</svg>
					<span>Contact</span>
				</div>

				{/* Back to Dashboard button - only show when not on dashboard */}
				{currentPage !== 'dashboard' && (
					<div
						className="icon-card"
						onClick={() => setCurrentPage('dashboard')}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="icon-svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							/>
						</svg>
						<span>Dashboard</span>
					</div>
				)}

				<div className="icon-card" onClick={toggleDarkMode}>
					<svg
						className="icon-svg"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						{darkMode ? (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
							/>
						) : (
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07 6.07l-.7-.7M6.34 6.34l-.7-.7m12.02 0l-.7.7M6.34 17.66l-.7.7M12 5a7 7 0 100 14 7 7 0 000-14z"
							/>
						)}
					</svg>
					<span>{darkMode ? 'Dark' : 'Light'}</span>
				</div>
			</div>
		</div>
	);
};

// Weather Card Component
const WeatherCard = () => {
	const [weather, setWeather] = useState({
		temperature: '--',
		condition: '--',
		humidity: '--',
		rainfall: '--',
		wind: '--',
	});
	const [cityInput, setCityInput] = useState('');

	const getWeather = async (city = 'Delhi') => {
		const apiKey = '';
		const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

		try {
			const response = await fetch(url);
			const data = await response.json();

			if (data.cod !== 200) {
				alert('City not found!');
				return;
			}

			setWeather({
				temperature: `${data.main.temp}°C`,
				condition: data.weather[0].description,
				humidity: `${data.main.humidity}%`,
				rainfall: data.rain
					? `${data.rain['1h'] || data.rain['3h'] || 0}mm`
					: '0mm',
				wind: `${data.wind.speed} km/h`,
			});
		} catch (error) {
			console.error('Error fetching weather data:', error);
		}
	};

	useEffect(() => {
		getWeather();
	}, []);

	const handleSearch = () => {
		getWeather(cityInput || 'Delhi');
	};

	return (
		<div className="card">
			<div className="card-header">
				<h2 className="card-title">
					<svg
						className="icon"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z"
						></path>
					</svg>
					Weather Forecast
				</h2>
			</div>

			<div className="search-box" style={{ margin: '10px 0' }}>
				<input
					type="text"
					value={cityInput}
					onChange={(e) => setCityInput(e.target.value)}
					placeholder="Enter city name"
				/>
				<button onClick={handleSearch}>Search</button>
			</div>

			<div className="weather-info">
				<div className="temperature">
					<div className="temperature-value">
						{weather.temperature}
					</div>
					<div className="weather-condition">{weather.condition}</div>
				</div>
				<div className="weather-details">
					<div className="weather-item">
						<span>Humidity:</span>
						<span>{weather.humidity}</span>
					</div>
					<div className="weather-item">
						<span>Rainfall:</span>
						<span>{weather.rainfall}</span>
					</div>
					<div className="weather-item">
						<span>Wind:</span>
						<span>{weather.wind}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

// Risk Indicator Component
const RiskIndicator = () => {
	const floodRisk = 0;

	const getRiskLevel = (risk) => {
		if (risk < 30)
			return { level: 'Low', color: '#10B981', bgColor: '#ECFDF5' };
		if (risk < 70)
			return { level: 'Medium', color: '#F59E0B', bgColor: '#FFFBEB' };
		return { level: 'High', color: '#EF4444', bgColor: '#FEF2F2' };
	};

	const riskInfo = getRiskLevel(floodRisk);
	const radius = 42;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (floodRisk / 100) * circumference;

	return (
		<div className="card">
			<h2 className="card-title">
				<svg
					className="icon"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
					></path>
				</svg>
				Flood Risk Indicator
			</h2>
			<div className="risk-indicator">
				<div className="circular-progress">
					<svg viewBox="0 0 100 100">
						<circle
							className="progress-bg"
							cx="50"
							cy="50"
							r="42"
						></circle>
						<circle
							className="progress-bar"
							cx="50"
							cy="50"
							r="42"
							style={{
								stroke: riskInfo.color,
								strokeDasharray: circumference,
								strokeDashoffset: strokeDashoffset,
							}}
						></circle>
					</svg>
					<div className="progress-text">
						<div
							className="progress-percentage"
							style={{ color: riskInfo.color }}
						>
							{floodRisk}%
						</div>
						<div className="progress-label">{riskInfo.level}</div>
					</div>
				</div>
				<div
					className="risk-level"
					style={{ backgroundColor: riskInfo.bgColor }}
				>
					<div style={{ color: riskInfo.color }}>
						{riskInfo.level} Risk Level
					</div>
					<div className="risk-level-text">
						Based on current weather conditions
					</div>
				</div>
			</div>
		</div>
	);
};

// Shelters List Component
const SheltersList = () => {
	const shelters = [
		{
			id: 1,
			name: 'Chiheru Railway Station',
			distance: 3.8,
			type: 'government',
			icon: '🚉',
		},
	].sort((a, b) => a.distance - b.distance);

	return (
		<div className="card">
			<h2 className="card-title">
				<svg
					className="icon"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
					></path>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
					></path>
				</svg>
				Nearest Shelters
			</h2>
			<div className="shelters-list">
				{shelters.map((shelter) => (
					<div key={shelter.id} className="shelter-item">
						<div className="shelter-info">
							<div className="shelter-icon">{shelter.icon}</div>
							<div>
								<div className="shelter-name">
									{shelter.name}
								</div>
								<div className="shelter-type">
									{shelter.type}
								</div>
							</div>
						</div>
						<div className="shelter-distance">
							<div className="distance-value">
								{shelter.distance} km
							</div>
							<div className="distance-label">away</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

// Alerts List Component
const AlertsList = () => {
	const recentAlerts = [
		{
			id: 3,
			message: 'No risk around your area',
			time: '1 hour ago',
			isNew: false,
		},
	];

	return (
		<div className="card">
			<h2 className="card-title">
				<svg
					className="icon"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M15 17h5l-5 5v-5zM11 17H6l5 5v-5zM8 12V7a4 4 0 118 0v5H8z"
					></path>
				</svg>
				Recent Alerts
			</h2>
			<div className="alerts-list">
				{recentAlerts.map((alert) => (
					<div key={alert.id} className="alert-item">
						<div
							className={`alert-indicator ${alert.isNew ? 'alert-new' : 'alert-old'}`}
						></div>
						<div className="alert-content">
							<div className="alert-message">{alert.message}</div>
							<div className="alert-time">{alert.time}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

// News List Component
const NewsList = () => {
	const [news, setNews] = useState([]);

	const fetchIndiaNews = async () => {
		const apiKey = '';
		const url = `https://newsapi.org/v2/everything?q=flood OR disaster AND India&sortBy=publishedAt&language=en&pageSize=5&apiKey=${apiKey}`;

		try {
			const res = await fetch(url);
			const data = await res.json();

			const newsItems = data.articles.map((article, index) => ({
				id: index + 1,
				title: article.title,
				time: new Date(article.publishedAt).toLocaleString(),
				url: article.url,
			}));

			setNews(newsItems);
		} catch (error) {
			console.error('Error fetching news:', error);
			// Fallback news data
			setNews([
				{
					id: 1,
					title: 'Local authorities prepare for monsoon season',
					time: '2 hours ago',
					url: '#',
				},
				{
					id: 2,
					title: 'New flood early warning system installed',
					time: '4 hours ago',
					url: '#',
				},
				{
					id: 3,
					title: 'Emergency services conduct rescue drills',
					time: '6 hours ago',
					url: '#',
				},
				{
					id: 4,
					title: 'Community volunteers trained in disaster response',
					time: '8 hours ago',
					url: '#',
				},
			]);
		}
	};

	useEffect(() => {
		fetchIndiaNews();
	}, []);

	return (
		<div className="card">
			<h2 className="card-title">Recent News</h2>
			<div className="news-list">
				{news.map((item) => (
					<div key={item.id} className="news-item">
						<div className="news-header">
							<h3 className="news-title">{item.title}</h3>
							<a
								className="news-link"
								href={item.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								Read
							</a>
						</div>
						<div className="news-time">{item.time}</div>
					</div>
				))}
			</div>
		</div>
	);
};

// Main App Component
const App = () => {
	const [darkMode, setDarkMode] = useState(false);
	const [currentPage, setCurrentPage] = useState('dashboard'); // default view

	const toggleDarkMode = () => {
		setDarkMode(!darkMode);
	};

	// Handle dark mode
	useEffect(() => {
		if (darkMode) {
			document.body.classList.add('dark-mode');
		} else {
			document.body.classList.remove('dark-mode');
		}
	}, [darkMode]);

	// Render dashboard content
	const renderDashboard = () => (
		<>
			<div className="grid grid-2">
				<WeatherCard />
				<RiskIndicator />
			</div>
			<SheltersList />
			<div className="grid grid-2">
				<AlertsList />
				<NewsList />
			</div>
		</>
	);

	// Determine if current page should be full width
	const isFullWidthPage =
		currentPage === 'map' ||
		currentPage === 'report' ||
		currentPage === 'help' ||
		currentPage === 'funds';

	return (
		<div className={`container ${isFullWidthPage ? 'full-width' : ''}`}>
			<Header
				darkMode={darkMode}
				toggleDarkMode={toggleDarkMode}
				setCurrentPage={setCurrentPage}
				currentPage={currentPage}
			/>

			{/* Conditional rendering based on current page */}
			{currentPage === 'dashboard' && renderDashboard()}
			{currentPage === 'report' && <Reports />}
			{currentPage === 'funds' && <Fund />}
			{currentPage === 'map' && <Map />}
			{currentPage === 'help' && <Help />}
		</div>
	);
};

export default App;
