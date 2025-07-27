#!/bin/bash

# build_files.sh
pip install -r requirements.txt

# Make migrations
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput --clear
