import numpy as np
import json
import os


class HoltWintersOnline:
    """
    Online Holt-Winters exponential smoothing model with additive trend and seasonality.
    Supports incremental updates and fast forecasting.

    Attributes:
        season_length (int): Number of periods in a seasonal cycle (288 for 5-min intervals in 24h)
        alpha (float): Level smoothing parameter
        beta (float): Trend smoothing parameter
        gamma (float): Seasonal smoothing parameter
        level (float): Current level component
        trend (float): Current trend component
        seasonal (ndarray): Array of seasonal components
        n (int): Number of observations processed
    """

    def __init__(self, season_length=288, alpha=0.2, beta=0.02, gamma=0.15, max_seats=100):
        self.season_length = season_length
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma
        self.max_seats = max_seats
        self.level = 0.0
        self.trend = 0.0
        self.seasonal = np.zeros(season_length)
        self.n = 0


    def initialize(self, y):
        """Initialize model with historical data (at least two seasons)"""
        if len(y) < 2 * self.season_length:
            raise ValueError("Need at least two full seasons for initialization")

        # Initial trend from first and second season averages
        season1 = y[:self.season_length]
        season2 = y[self.season_length:2 * self.season_length]
        avg1 = np.mean(season1)
        avg2 = np.mean(season2)
        self.trend = (avg2 - avg1) / self.season_length

        # Initial level adjusted for trend
        self.level = avg1 + self.trend / 2

        # Initial seasonal components (detrended)
        detrended1 = season1 - (self.level - self.trend / 2)
        detrended2 = season2 - (self.level + self.season_length * self.trend + self.trend / 2)
        self.seasonal = 0.5 * (detrended1 + detrended2)

        # Normalize seasonals to sum to zero
        self.seasonal -= np.mean(self.seasonal)

        self.n = 2 * self.season_length

    def update(self, y):
        """Update model with a new observation (clipped to bounds)"""
        # Clip input to physical bounds [0, max_seats]
        y_clipped = max(0, min(y, self.max_seats))
        t = self.n % self.season_length
        prev_level = self.level
        prev_seasonal = self.seasonal[t]

        # Update equations using clipped value
        self.level = self.alpha * (y_clipped - prev_seasonal) + (1 - self.alpha) * (prev_level + self.trend)
        self.trend = self.beta * (self.level - prev_level) + (1 - self.beta) * self.trend
        self.seasonal[t] = self.gamma * (y_clipped - self.level) + (1 - self.gamma) * prev_seasonal

        self.n += 1

    def forecast(self, steps=12):
        """Generate forecast with bounds enforcement"""
        forecasts = []
        current_season_idx = self.n % self.season_length

        for i in range(1, steps + 1):
            seasonal_idx = (current_season_idx + i) % self.season_length
            forecast = self.level + i * self.trend + self.seasonal[seasonal_idx]
            # Clip forecast to physical bounds [0, max_seats]
            bounded_forecast = max(0, min(forecast, self.max_seats))
            forecasts.append(bounded_forecast)

        return forecasts

    def get_state(self):
        """Get current model state for persistence"""
        return {
            'level': self.level,
            'trend': self.trend,
            'seasonal': self.seasonal.tolist(),
            'n': self.n
        }

    def set_state(self, state):
        """Restore model state from persisted data"""
        self.level = state['level']
        self.trend = state['trend']
        self.seasonal = np.array(state['seasonal'])
        self.n = state['n']


class ForecastManager:
    """
        Manages forecasting models for all libraries, integrates with RingBufferStore,
        and handles model persistence.
        """

    def __init__(self, ring_buffer, model_dir, max_seats_list, max_forecast=12, num_buildings=22, season_length=288):
        self.ring_buffer = ring_buffer
        self.model_dir = model_dir
        self.num_buildings = num_buildings
        self.season_length = season_length
        self.max_seats_list = max_seats_list  # List of max seats per library
        self.max_forecast = max_forecast

        # Create models with individual max_seats
        self.models = [
            HoltWintersOnline(
                season_length,
                max_seats=max_seats_list[i]
            ) for i in range(num_buildings)
        ]

        os.makedirs(model_dir, exist_ok=True)
        self.state_files = [
            os.path.join(model_dir, f'building_{i}_state.json')
            for i in range(num_buildings)
        ]

        self._initialize_models()

    def _initialize_models(self):
        _, counts = self.ring_buffer.get_all()

        for i, model in enumerate(self.models):
            state_file = self.state_files[i]

            if os.path.exists(state_file):
                with open(state_file, 'r') as f:
                    state = json.load(f)
                model.set_state(state)
            else:
                try:
                    # Initialize with clipped historical data
                    clipped_data = np.clip(counts[:, i], 0, model.max_seats)
                    model.initialize(clipped_data)
                    self._save_model_state(i)
                except ValueError:
                    # Fallback with bounded average
                    clipped_data = np.clip(counts[:, i], 0, model.max_seats)
                    avg = np.mean(clipped_data) if len(clipped_data) > 0 else 0
                    model.level = avg
                    model.trend = 0
                    model.seasonal = np.zeros(self.season_length)
                    model.n = len(counts)

    def _save_model_state(self, building_idx):
        """Save model state to disk"""
        state = self.models[building_idx].get_state()
        with open(self.state_files[building_idx], 'w') as f:
            json.dump(state, f)

    def update_and_forecast(self):
        """Update models with latest data and generate forecast_list"""
        # Get most recent observation
        _, counts = self.ring_buffer.get_recent(1)
        latest_counts = counts[0]

        forecast_list = []

        for i, model in enumerate(self.models):
            # Update model with latest observation
            model.update(latest_counts[i])

            # Generate forecast for this building
            building_forecast = model.forecast(steps=self.max_forecast)
            forecast_list.append(building_forecast)

            # Persist model state (consider doing this less frequently in production)
            self._save_model_state(i)

        return np.array(forecast_list).round()
