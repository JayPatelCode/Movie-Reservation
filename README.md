# Movie Reservation System

This is a movie reservation system with a React frontend and a Django backend.

## Getting Started

### Prerequisites

*   Python 3.8+
*   Node.js 14+
*   npm or yarn

### Backend Setup (Django)

1.  Navigate to the `MovieReservation` backend directory:
    ```bash
    cd MovieReservation
    ```
2.  Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
    (Note: You may need to create a `requirements.txt` file first if it doesn't exist: `pip freeze > requirements.txt`)
4.  Apply migrations:
    ```bash
    python manage.py migrate
    ```
5.  Create a superuser (for admin access):
    ```bash
    python manage.py createsuperuser
    ```
6.  Run the development server:
    ```bash
    python manage.py runserver
    ```

### Frontend Setup (React)

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or yarn install
    ```
3.  Start the development server:
    ```bash
    npm start
    # or yarn start
    ```
    The frontend application should open in your browser at `http://localhost:3000`.

## Code Quality

To maintain code quality and consistency, it is recommended to use the following tools:

*   **Python (Backend):** [Black](https://github.com/psf/black) for code formatting.
    To run Black:
    ```bash
    black .
    ```

*   **JavaScript (Frontend):** [ESLint](https://eslint.org/) for linting and code style.
    To run ESLint (from the `frontend` directory):
    ```bash
    npm run lint
    # or yarn lint
    ```

## Deployment

### Environment Variables

For production deployment, ensure the following environment variables are set:

*   `DJANGO_SECRET_KEY`: A strong, unique secret key for Django.
*   `DJANGO_DEBUG`: Set to `False` in production.
*   `DJANGO_ALLOWED_HOSTS`: A comma-separated list of allowed hostnames for your Django application (e.g., `yourdomain.com,www.yourdomain.com`).
*   `CORS_ALLOWED_ORIGINS`: A comma-separated list of origins that are allowed to make cross-origin requests (e.g., `https://yourfrontend.com`).

### Static Files

Before deploying, collect static files:

```bash
python manage.py collectstatic
```

### Database

For production, it is highly recommended to use a robust database like PostgreSQL instead of SQLite. Update your `DATABASES` setting in `MovieReservation/settings.py` accordingly.

## Project Structure

*   `MovieReservation/`: Django backend project.
*   `frontend/`: React frontend application.
*   `reservation/`: Django app containing models, views, serializers, etc.
*   `static/`: Static files for Django (e.g., CSS, JS, images).
*   `media/`: User-uploaded media files.

