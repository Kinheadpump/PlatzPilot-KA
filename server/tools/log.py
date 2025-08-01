import logging
import os
from logging.handlers import RotatingFileHandler


def setup_logger(
    name: str = None,
    level: int = logging.INFO,
    logger_dir: str = "log",
    max_bytes: int = 10 * 1024 * 1024,
    backup_count: int = 5,
    fmt: str = "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt: str = "%Y-%m-%d %H:%M:%S"
) -> logging.Logger:
    """
    Configures and returns a logger.

    Parameters
    ----------
    name : str
        Name of the logger (use __name__ in modules).
    level : int
        Logging level (e.g. logging.DEBUG, INFO, WARNING).
    log_file : str
        Path to the log file.
    max_bytes : int
        Maximum size in bytes before rotating.
    backup_count : int
        Number of rotated files to keep.
    fmt : str
        Log message format.
    datefmt : str
        Date format in log messages.

    Returns
    -------
    logger : logging.Logger
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.propagate = False

    # Prevent duplicate handlers if called multiple times
    if logger.handlers:
        return logger

    ch = logging.StreamHandler()
    ch.setLevel(level)
    ch.setFormatter(logging.Formatter(fmt, datefmt))
    logger.addHandler(ch)

    os.makedirs(logger_dir, exist_ok=True)
    fh = RotatingFileHandler(os.path.join(logger_dir, "seat_tracker.log"), maxBytes=max_bytes, backupCount=backup_count)
    fh.setLevel(level)
    fh.setFormatter(logging.Formatter(fmt, datefmt))
    logger.addHandler(fh)

    return logger
