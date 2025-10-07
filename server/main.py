import logging
import json
import os
from time import sleep
from tools.log import setup_logger
from tools.fetcher import fetch_seats
from tools.storage import RingBufferStore
from tools.formatting import json_handler
from tools.forecast import ForecastManager
from tools.config import AppConfig

config = AppConfig('config.json')

ring_buffer = RingBufferStore(storage_dir=config.ring_buffer_config)
logger = setup_logger(name="seat_tracker", level=logging.DEBUG, logger_dir=config.logger_config)
forecast_manager = ForecastManager(ring_buffer, **config.forecast_config)


def main():
    logger.info("Starting seat-tracker service")

    while True:
        fetched_data = None
        try:
            fetched_data = fetch_seats(config.fetch_url)
            logger.debug("Raw fetched data: %r", fetched_data)

        except Exception as e:
            logger.error("Failed to fetch seats: %s", e)

        if fetched_data:
            if not isinstance(fetched_data, list) or len(fetched_data) < 2:
                logger.critical("Expected fetched_data to be a list of length 2")
                raise TypeError("Expected a list of length 2")

            seat_estimate = fetched_data[0].get("seatestimate")
            if not isinstance(seat_estimate, dict) or len(seat_estimate) != config.location_number:
                logger.critical("seatestimate malformed: %r", seat_estimate)
                raise ValueError("Expected fetched_data[0]['seatestimate'] to be a dictionary of length %s",
                                 config.location_number)

            last_seat_count_update = seat_estimate['LSG'][0]['timestamp']['date']

            library_is_closed_flag = {}
            number_of_free_seats_currently = []
            for key, timestamp_list in seat_estimate.items():
                if not isinstance(timestamp_list, list) or len(timestamp_list) < 1:
                    number_of_free_seats_currently.append(0)
                    library_is_closed_flag[key] = True
                else:
                    number_of_free_seats_currently.append(timestamp_list[0].get("free_seats"))
                    library_is_closed_flag[key] = False
            logger.debug("registered number of free seats: %s", number_of_free_seats_currently)

            if len(number_of_free_seats_currently) != config.location_number:
                logger.critical("number_of_free_seats_currently not the expected length")
                raise ValueError("Expected number_of_free_seats_currently to be a list of length %s",
                                 config.location_number)

            ring_buffer.append(number_of_free_seats_currently, last_seat_count_update)
            logger.info("Appended %d-seat record at buffer pos %d", len(seat_estimate), ring_buffer.pointer)

            location = fetched_data[1]['location']
            if not isinstance(location, dict) or len(location) != config.location_number:
                logger.critical("location malformed: %r", location)
                raise ValueError("Expected fetched_data[0]['location'] to be a dictionary of length %s",
                                 config.location_number)

            forecasts = forecast_manager.update_and_forecast()
            logger.debug("forecast returned: %s", forecasts)

            json_to_push = json_handler(location, forecasts, number_of_free_seats_currently, library_is_closed_flag,
                                        config)
            logger.debug("json_handler returned: %s", json_to_push)

            with open(os.path.join(config.ring_buffer_config, config.json_save_file), 'w') as f:
                json.dump(json_to_push, f, ensure_ascii=True, indent=2)

            sleep(config.fetch_interval)


if __name__ == "__main__":
    main()
