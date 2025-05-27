from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restx import Api, Resource, fields
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)
api = Api(app, version='1.0', title='SOS Tracker API',
          description='API documentation for SOS GPS Tracker System with location, status, and diagnostics.')

# Database utility
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# Swagger models
location_model = api.model('Location', {
    'latitude': fields.Float(required=True, description='Latitude'),
    'longitude': fields.Float(required=True, description='Longitude')
})

status_model = api.model('Status', {
    'button': fields.String(required=True, description='SOS Button State'),
    'battery': fields.Float(required=True, description='Battery Level in %')
})

# Location endpoint
@api.route('/api/location')
class LocationAPI(Resource):
    @api.expect(location_model)
    def post(self):
        data = request.get_json()
        lat = data.get('latitude')
        lon = data.get('longitude')
        timestamp = datetime.utcnow()

        conn = get_db_connection()
        conn.execute('INSERT INTO locations (latitude, longitude, timestamp) VALUES (?, ?, ?)',
                     (lat, lon, timestamp))
        conn.commit()
        conn.close()
        return {'message': 'Location stored'}, 201

# Status endpoint
@api.route('/api/status')
class StatusAPI(Resource):
    @api.expect(status_model)
    def post(self):
        data = request.get_json()
        button = data.get('button')
        battery = data.get('battery')
        timestamp = datetime.utcnow()

        conn = get_db_connection()
        conn.execute('INSERT INTO status (button, battery, timestamp) VALUES (?, ?, ?)',
                     (button, battery, timestamp))
        conn.commit()
        conn.close()
        return {'message': 'Status updated'}, 200

# Latest location endpoint
@api.route('/api/location/latest')
class LatestLocationAPI(Resource):
    def get(self):
        conn = get_db_connection()
        location = conn.execute('SELECT * FROM locations ORDER BY timestamp DESC LIMIT 1').fetchone()
        conn.close()
        return dict(location) if location else {}

# Initialize database tables
def init_db():
    conn = sqlite3.connect('database.db')
    conn.execute('CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY AUTOINCREMENT, latitude REAL, longitude REAL, timestamp TEXT)')
    conn.execute('CREATE TABLE IF NOT EXISTS status (id INTEGER PRIMARY KEY AUTOINCREMENT, button TEXT, battery REAL, timestamp TEXT)')
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
