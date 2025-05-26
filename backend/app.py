from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/location', methods=['POST'])
def add_location():
    data = request.get_json()
    lat = data.get('latitude')
    lon = data.get('longitude')
    timestamp = datetime.utcnow()

    conn = get_db_connection()
    conn.execute('INSERT INTO locations (latitude, longitude, timestamp) VALUES (?, ?, ?)', (lat, lon, timestamp))
    conn.commit()
    conn.close()
    return jsonify({"message": "Location stored"}), 201

@app.route('/api/status', methods=['POST'])
def update_status():
    data = request.get_json()
    button = data.get('button')
    battery = data.get('battery')
    conn = get_db_connection()
    conn.execute('INSERT INTO status (button, battery, timestamp) VALUES (?, ?, ?)', (button, battery, datetime.utcnow()))
    conn.commit()
    conn.close()
    return jsonify({"message": "Status updated"}), 200

@app.route('/api/location/latest', methods=['GET'])
def latest_location():
    conn = get_db_connection()
    location = conn.execute('SELECT * FROM locations ORDER BY timestamp DESC LIMIT 1').fetchone()
    conn.close()
    return jsonify(dict(location)) if location else {}, 200

if __name__ == '__main__':
    conn = sqlite3.connect('database.db')
    conn.execute('CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY, latitude REAL, longitude REAL, timestamp TEXT)')
    conn.execute('CREATE TABLE IF NOT EXISTS status (id INTEGER PRIMARY KEY, button TEXT, battery REAL, timestamp TEXT)')
    conn.commit()
    conn.close()
    app.run(host='0.0.0.0', debug=True)