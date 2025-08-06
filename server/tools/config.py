import json


class AppConfig:
    def __init__(self, config_path):
        with open(config_path, 'r') as f:
            self.data = json.load(f)

    @property
    def ring_buffer_config(self):
        return self.data["save_files"]["ring_buffer_save_dir"]

    @property
    def logger_config(self):
        return self.data["save_files"]["log_dir"]

    @property
    def forecast_config(self):
        return {
            "model_dir": self.data["save_files"]["forecast_model_dir"],
            "max_seats_list": self.data["library_info"]["max_seats_list"],
            "max_forecast": self.data["other"]["max_forecast"],
            "num_buildings": self.data["library_info"]["number_of_locations"],
            "season_length": 288  # Ein Tag
        }

    @property
    def fetch_url(self):
        return self.data["other"]["seats_url"]

    @property
    def location_number(self):
        return self.data["library_info"]["number_of_locations"]

    @property
    def json_save_file(self):
        return self.data["save_files"]["json_save_file"]

    @property
    def fetch_interval(self):
        return self.data["other"]["fetch_interval"]

    @property
    def formatting_grouping(self):
        return self.data["library_info"]["grouping"]