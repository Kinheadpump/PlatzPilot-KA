import json
import requests
import logging
from typing import Any, Dict, List, Union
from requests.adapters import HTTPAdapter
from requests.exceptions import RequestException, HTTPError, Timeout

logger = logging.getLogger("seat_tracker")


class FetchSeatsError(Exception):
    """Raised when fetching or parsing seat‐occupancy data fails."""


def fetch_seats(
        url: str,
        *,
        timeout: float = 5.0,
        retries: int = 3,
        backoff_factor: float = 0.3
) -> Union[Dict[str, Any], List[Any]]:
    """
    Fetch seat‐occupancy JSONP from `url`, strip the padding, parse JSON, and clean it.

    Raises
    ------
    FetchSeatsError
        On network errors, invalid HTTP status, parse failures, or cleanup errors.
    """
    session = requests.Session()
    adapter = HTTPAdapter(max_retries=retries)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    try:
        resp = session.get(url, timeout=timeout)
        resp.raise_for_status()
    except Timeout as e:
        logger.error("Timeout after %ss fetching %s", timeout, url)
        raise FetchSeatsError(f"Timeout fetching {url}") from e
    except HTTPError as e:
        logger.error("HTTP error %s fetching %s", e, url)
        raise FetchSeatsError(f"HTTP error {e.response.status_code}") from e
    except RequestException as e:
        logger.error("Network error fetching %s: %s", url, e)
        raise FetchSeatsError("Network error") from e

    text = resp.text.strip()
    if not text:
        logger.error("Empty response from %s", url)
        raise FetchSeatsError("Empty response body")

    try:
        start = text.find("(")
        end = text.rfind(")")
        if start < 0 or end < 0 or end <= start + 1:
            raise ValueError("No JSONP callback wrapper found")
        json_str = text[start + 1: end].strip().rstrip(";")
        data = json.loads(json_str)
    except (ValueError, json.JSONDecodeError) as e:
        logger.error("Failed to extract/parse JSON: %s", e)
        raise FetchSeatsError("Invalid JSONP format") from e

    if not isinstance(data, (dict, list)):
        logger.error("Expected dict or list, got %s", type(data))
        raise FetchSeatsError("Unexpected JSON structure")

    return data
