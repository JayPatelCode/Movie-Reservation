#!/bin/bash

# build_files.sh
pip3 install -r requirements.txt

# Make migrations
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput

# Collect static files
python3 manage.py collectstatic --noinput --clear
