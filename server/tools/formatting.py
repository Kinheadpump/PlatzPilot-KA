from datetime import datetime
from copy import deepcopy
import calendar
import logging

logger = logging.getLogger("seat_tracker")


def extract_time_range(interval):
    try:
        start = datetime.strptime(interval[0]["date"], "%Y-%m-%d %H:%M:%S.%f")
        end = datetime.strptime(interval[1]["date"], "%Y-%m-%d %H:%M:%S.%f")
        return start.strftime("%H:%M"), end.strftime("%H:%M"), start
    except (KeyError, ValueError, TypeError, IndexError):
        return None, None, None


def convert_opening_hours(opening_hours):
    weekly_schedule = {day: [] for day in calendar.day_name}
    weekly_opening_hours = opening_hours.get("weekly_opening_hours", [])

    if not isinstance(weekly_opening_hours, list) or not weekly_opening_hours:
        return weekly_schedule

    first_interval = weekly_opening_hours[0]
    if isinstance(first_interval, list) and len(first_interval) == 2:
        start_str, end_str, _ = extract_time_range(first_interval)
        if start_str == "00:00" and end_str == "23:59":
            for day in weekly_schedule:
                weekly_schedule[day].append(("00:00", "23:59"))
            return weekly_schedule

    for interval in weekly_opening_hours:
        if not isinstance(interval, list) or len(interval) != 2:
            continue
        start_str, end_str, start_dt = extract_time_range(interval)
        if not start_str or not end_str or not start_dt:
            continue
        try:
            weekday = calendar.day_name[start_dt.weekday()]
            weekly_schedule[weekday].append((start_str, end_str))
        except (AttributeError, IndexError):
            continue

    return weekly_schedule


def replace_place_with_dict(data: dict[str, list[str]], place: str, new_entry: dict) -> str | None:
    """
    Looks in dict `data` for the value `place`, replaces it in the list
    with the dict `new_entry`.
    """
    for codeword, places in data.items():
        if place in places:
            idx = places.index(place)
            places[idx] = new_entry


def json_handler(location_dict, forecasts, number_of_free_seats, is_closed_flag, config):
    combined = deepcopy(config.formatting_grouping)

    counting_locations = 0
    for key, loc_list in location_dict.items():
        first_loc_entry = loc_list[0]
        first_loc_entry = first_loc_entry.copy()

        first_loc_entry.pop("name", None)
        first_loc_entry.pop("timestamp", None)
        first_loc_entry.pop("super_location", None)
        first_loc_entry["opening_hours"] = convert_opening_hours(first_loc_entry.get("opening_hours"))
        first_loc_entry["free_seats_currently"] = number_of_free_seats[counting_locations]
        first_loc_entry["predictions"] = forecasts[counting_locations].tolist()
        first_loc_entry["is_closed"] = is_closed_flag[key]

        replace_place_with_dict(combined, key, first_loc_entry)
        counting_locations += 1

    return combined
