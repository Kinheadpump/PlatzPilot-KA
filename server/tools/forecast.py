import numpy as np
import json
import os

MAX_FORECAST = 12

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

    def __init__(self, season_length=288, alpha=0.2, beta=0.02, gamma=0.15):
        self.season_length = season_length
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma
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
        """Update model with a new observation"""
        t = self.n % self.season_length
        prev_level = self.level
        prev_seasonal = self.seasonal[t]

        # Update equations for additive model
        self.level = self.alpha * (y - prev_seasonal) + (1 - self.alpha) * (prev_level + self.trend)
        self.trend = self.beta * (self.level - prev_level) + (1 - self.beta) * self.trend
        self.seasonal[t] = self.gamma * (y - self.level) + (1 - self.gamma) * prev_seasonal

        self.n += 1

    def forecast(self, steps=MAX_FORECAST):
        """Generate forecast for next steps"""
        forecasts = []
        current_season_idx = self.n % self.season_length

        for i in range(1, steps + 1):
            seasonal_idx = (current_season_idx + i) % self.season_length
            forecast = self.level + i * self.trend + self.seasonal[seasonal_idx]
            forecasts.append(max(0, forecast))  # Ensure non-negative seats

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

    def __init__(self, ring_buffer, model_dir, num_buildings=22, season_length=288):
        self.ring_buffer = ring_buffer
        self.model_dir = model_dir
        self.num_buildings = num_buildings
        self.season_length = season_length
        self.models = [HoltWintersOnline(season_length) for _ in range(num_buildings)]

        os.makedirs(model_dir, exist_ok=True)
        self.state_files = [
            os.path.join(model_dir, f'building_{i}_state.json')
            for i in range(num_buildings)
        ]

        # Initialize or load models
        self._initialize_models()

    def _initialize_models(self):
        """Initialize models from data or load saved state"""
        _, counts = self.ring_buffer.get_all()

        for i, model in enumerate(self.models):
            state_file = self.state_files[i]

            if os.path.exists(state_file):
                # Load existing state
                with open(state_file, 'r') as f:
                    state = json.load(f)
                model.set_state(state)
            else:
                # Initialize new model with historical data
                try:
                    model.initialize(counts[:, i])
                    self._save_model_state(i)
                except ValueError:
                    # Not enough data yet, use simple average as fallback
                    avg = np.mean(counts[:, i]) if counts[:, i].any() else 0
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
            building_forecast = model.forecast(steps=MAX_FORECAST)
            forecast_list.append(building_forecast)

            # Persist model state (consider doing this less frequently in production)
            self._save_model_state(i)

        return np.array(forecast_list)
