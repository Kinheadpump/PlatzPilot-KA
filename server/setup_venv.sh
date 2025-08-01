#!/bin/bash

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

echo "Virtual environment created and requirements installed!"
echo "To activate in the future, run: source venv/bin/activate"
echo "To deactivate, run: deactivate"
