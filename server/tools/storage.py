import os
import json
import numpy as np
from datetime import datetime, timedelta
from math import floor

class RingBufferStore:
    """
    A ring buffer ring_buffer using NumPy memmap for fixed-size storage of time series data,
    inferring timestamps implicitly from a fixed start time and interval.

    Attributes:
        capacity (int): Number of time slots (e.g., 2016 for one-week at 5-min intervals).
        num_buildings (int): Number of building columns (22).
        counts_file (str): Path to memmap file for counts (uint8).
        pointer_file (str): Path to file storing the current write pointer and start time.
        start_time (datetime): UTC datetime marking buffer index 0.
        interval (timedelta): Fixed sampling interval between entries.
    """
    def __init__(
        self,
        storage_dir: str,
        capacity: int = 2016,
        num_buildings: int = 22,
        interval_minutes: int = 5,
        dtype_counts: np.dtype = np.uint8,
    ):
        os.makedirs(storage_dir, exist_ok=True)
        self.capacity = capacity
        self.num_buildings = num_buildings
        self.interval = timedelta(minutes=interval_minutes)
        self.counts_file = os.path.join(storage_dir, 'counts.dat')
        self.pointer_file = os.path.join(storage_dir, 'pointer.json')

        # Initialize memmap for counts and pointer/start metadata
        self._init_memmap(dtype_counts)
        self._load_metadata()

    def _init_memmap(self, dtype_counts):
        # counts memmap
        if not os.path.exists(self.counts_file):
            arr = np.memmap(
                self.counts_file,
                dtype=dtype_counts,
                mode='w+',
                shape=(self.capacity, self.num_buildings)
            )
            arr[:] = 0
            arr.flush()
        self.counts = np.memmap(
            self.counts_file,
            dtype=dtype_counts,
            mode='r+',
            shape=(self.capacity, self.num_buildings)
        )

    def _load_metadata(self):
        if os.path.exists(self.pointer_file):
            with open(self.pointer_file, 'r') as f:
                data = json.load(f)
                self.pointer = data.get('pointer', 0)
                self.start_time = datetime.fromisoformat(data['start_time'])
        else:
            # initialize pointer and start_time at first run
            self.pointer = 0
            self.start_time = datetime.now()
            self._save_metadata()

    def _save_metadata(self):
        with open(self.pointer_file, 'w') as f:
            json.dump({
                'pointer': self.pointer,
                'start_time': self.start_time.isoformat()
            }, f)

    def append(self, counts: list, reading_time):
        """
        Append a new record into the ring buffer by storing counts.
        Args:
            counts (list[int]): List of length num_buildings with seat counts.
        """
        self.pointer = (floor((datetime.strptime(reading_time,"%Y-%m-%d %H:%M:%S.%f")-self.start_time).total_seconds()/300)) % self.capacity
        self.counts[self.pointer, :] = counts
        self._save_metadata()
        # flush changes
        self.counts.flush()

    def get_all(self):
        """
        Retrieve ordered data from oldest to newest.
        Returns:
            timestamps: np.ndarray of dtype datetime64[ms] shape (capacity,)
            counts: np.ndarray of shape (capacity, num_buildings)
        """
        # reorder counts
        idx = (np.arange(self.pointer, self.pointer + self.capacity) % self.capacity)
        cnts = self.counts[idx]
        # infer timestamps
        times = np.array([
            np.datetime64(self.start_time + i * self.interval, 'ms')
            for i in range(self.capacity)
        ])
        return times, cnts

    def get_recent(self, n: int):
        """
        Retrieve the most recent n records.
        Returns:
            timestamps: np.ndarray of dtype datetime64[ms] shape (n,)
            counts: np.ndarray of shape (n, num_buildings)
        """
        if n > self.capacity:
            raise ValueError("n exceeds buffer capacity")
        idx_end = (self.pointer - 1) % self.capacity
        idx_start = (self.pointer - n) % self.capacity
        if idx_start <= idx_end:
            cnts = self.counts[idx_start:idx_end+1]
        else:
            cnts = np.concatenate((
                self.counts[idx_start:],
                self.counts[:idx_end+1]
            ))
        # infer timestamps for these indices
        times = np.array([
            np.datetime64(
                self.start_time + ((i % self.capacity) * self.interval),
                'ms'
            )
            for i in range(idx_start, idx_start + n)
        ])
        return times, cnts
