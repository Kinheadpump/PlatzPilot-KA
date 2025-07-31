import logging
import json
from tools.log import setup_logger
from tools.fetcher import fetch_seats
from tools.storage import RingBufferStore
from tools.formatting import json_handler
from time import sleep
from datetime import datetime

SEATS_URL = "https://seatfinder.bibliothek.kit.edu/karlsruhe/getdata.php?callback=jQuery37101524490458818586_1753302096731&location%5B0%5D=LSG%2CLSM%2CLST%2CLSN%2CLSW%2CLBS%2CBIB-N%2CL3%2CL2%2CSAR%2CL1%2CLEG%2CFBC%2CFBP%2CLAF%2CFBA%2CFBI%2CFBM%2CFBH%2CFBD%2CBLB%2CWIS&values%5B0%5D=seatestimate%2Cmanualcount&after%5B0%5D=-10800seconds&before%5B0%5D=now&limit%5B0%5D=-17&location%5B1%5D=LSG%2CLSM%2CLST%2CLSN%2CLSW%2CLBS%2CBIB-N%2CL3%2CL2%2CSAR%2CL1%2CLEG%2CFBC%2CFBP%2CLAF%2CFBA%2CFBI%2CFBM%2CFBH%2CFBD%2CBLB%2CWIS&values%5B1%5D=location&after%5B1%5D=&before%5B1%5D=now&limit%5B1%5D=1&_=1753302096732"
LOCATION_NUMBER = 22
FETCH_INTERVAL = 300

log_file = "log\\seat_tracker.log"
ring_buffer_save_file = "data"
json_save_file = "data\\seat_finder_data.json"

store = RingBufferStore(storage_dir=ring_buffer_save_file)
logger = setup_logger(name="seat_tracker", level=logging.DEBUG, log_file=log_file)



def main():
    logger.info("Starting seat-tracker service")
    while True:

        fetched_data = None
        try:
            fetched_data = fetch_seats(SEATS_URL)
            logger.debug("Raw fetched data: %r", fetched_data)

        except Exception as e:
            logger.error("Failed to fetch seats: %s", e)

        if fetched_data:
            if not isinstance(fetched_data, list) or len(fetched_data) < 2:
                logger.critical("Expected fetched_data to be a list of length 2")
                raise TypeError("Expected a list of length 2")

            seat_estimate = fetched_data[0].get("seatestimate")
            if not isinstance(seat_estimate, dict) or len(seat_estimate) != LOCATION_NUMBER:
                logger.critical("seatestimate malformed: %r", seat_estimate)
                raise ValueError("Expected fetched_data[0]['seatestimate'] to be a dictionary of length %s",
                                 LOCATION_NUMBER)

            last_seat_count_update = seat_estimate['LSG'][0]['timestamp']['date']

            number_of_free_seats_currently = []
            for key, timestamp_list in seat_estimate.items():
                if not isinstance(timestamp_list, list) or len(timestamp_list) < 1:
                    number_of_free_seats_currently.append(0)
                else:
                    number_of_free_seats_currently.append(timestamp_list[0].get("free_seats"))
            logger.debug("registered number of free seats: %s", number_of_free_seats_currently)

            if len(number_of_free_seats_currently) != LOCATION_NUMBER:
                logger.critical("number_of_free_seats_currently not the expected length")
                raise ValueError("Expected number_of_free_seats_currently to be a list of length %s", LOCATION_NUMBER)

            store.append(number_of_free_seats_currently)
            logger.info("Appended %d-seat record at buffer pos %d", len(seat_estimate), store.pointer)

            location = fetched_data[1]['location']
            if not isinstance(location, dict) or len(location) != LOCATION_NUMBER:
                logger.critical("location malformed: %r", location)
                raise ValueError("Expected fetched_data[0]['location'] to be a dictionary of length %s",
                                 LOCATION_NUMBER)

            json_to_push = json_handler(location, number_of_free_seats_currently)
            logger.debug("json_handler returned: %s", json_to_push)

            """add_predictions(json_to_push, qb)"""
            with open(json_save_file, 'w') as f:
                json.dump(json_to_push, f, ensure_ascii=True, indent=2)

            last_data_update = datetime.strptime(last_seat_count_update, '%Y-%m-%d %H:%M:%S.%f')
            time_since_update = (datetime.now() - last_data_update).total_seconds()
            wait_time = FETCH_INTERVAL - time_since_update
            wait_time = wait_time if wait_time > 0 else FETCH_INTERVAL
            logger.debug("sleeping now for %s s", wait_time)

            sleep(wait_time)

if __name__ == "__main__":
    main()
