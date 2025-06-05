from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restx import Api, Resource, fields
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)
api = Api(app, version='1.0', title='SOS Tracker API',
          description='API documentation for SOS GPS Tracker System')

# Database helper
def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# Swagger models
location_model = api.model('Location', {
    'latitude': fields.Float(required=True),
    'longitude': fields.Float(required=True)
})

status_model = api.model('Status', {
    'button': fields.String(required=True),
    'battery': fields.Float(required=True)
})

# Endpoints
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

@api.route('/api/emergency')
class EmergencyAPI(Resource):
    @api.expect(location_model)
    def post(self):
        data = request.get_json()
        lat = data.get('latitude')
        lon = data.get('longitude')
        timestamp = datetime.utcnow()

        conn = get_db_connection()
        conn.execute('DELETE FROM emergency')
        conn.execute('INSERT INTO emergency (latitude, longitude, timestamp, is_active, is_acknowledged) VALUES (?, ?, ?, 1, 0)',
                     (lat, lon, timestamp))
        conn.commit()
        conn.close()
        return {'message': 'Emergency reported'}, 201

    def get(self):
        conn = get_db_connection()
        row = conn.execute('SELECT * FROM emergency WHERE is_active = 1 ORDER BY timestamp DESC LIMIT 1').fetchone()
        conn.close()
        return dict(row) if row else {}

@api.route('/api/emergency/acknowledge')
class EmergencyAcknowledgeAPI(Resource):
    def post(self):
        conn = get_db_connection()
        conn.execute('UPDATE emergency SET is_acknowledged = 1 WHERE is_active = 1')
        conn.commit()
        conn.close()
        return {'message': 'Emergency acknowledged'}, 200

@api.route('/api/emergency/reset')
class EmergencyResetAPI(Resource):
    def post(self):
        conn = get_db_connection()
        conn.execute('UPDATE emergency SET is_active = 0')
        conn.commit()
        conn.close()
        return {'message': 'Emergency cleared'}, 200

@api.route('/api/emergency/ack/status')
class EmergencyAckStatusAPI(Resource):
    def get(self):
        conn = get_db_connection()
        row = conn.execute('SELECT is_acknowledged FROM emergency WHERE is_active = 1 ORDER BY timestamp DESC LIMIT 1').fetchone()
        conn.close()

        if row:
            return jsonify({'acknowledged': bool(row['is_acknowledged'])})
        else:
            return jsonify({'acknowledged': False})

# Initialize DB
def init_db():
    conn = sqlite3.connect('database.db')
    conn.execute('CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY, latitude REAL, longitude REAL, timestamp TEXT)')
    conn.execute('CREATE TABLE IF NOT EXISTS status (id INTEGER PRIMARY KEY, button TEXT, battery REAL, timestamp TEXT)')
    conn.execute('CREATE TABLE IF NOT EXISTS emergency (id INTEGER PRIMARY KEY, latitude REAL, longitude REAL, timestamp TEXT, is_active INTEGER DEFAULT 1, is_acknowledged INTEGER DEFAULT 0)')
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
