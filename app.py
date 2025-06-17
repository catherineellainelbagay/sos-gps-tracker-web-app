from flask import Flask, render_template, jsonify, request
from datetime import datetime
import json
import os


app = Flask(__name__)
HISTORY_FILE = 'history.json'


# Load location history
def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r') as f:
            return json.load(f)
    return []


# Save to history file
def save_history(history):
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)


@app.route('/')
def index():
    return render_template('index.html')


# POST: save new location
@app.route('/api/location', methods=['POST'])
def post_location():
    data = request.get_json()
    lat = float(data['latitude'])
    lng = float(data['longitude'])
    timestamp = datetime.utcnow().isoformat()


    new_entry = {
        'latitude': lat,
        'longitude': lng,
        'timestamp': timestamp
    }


    history = load_history()
    history.append(new_entry)
    save_history(history)


    return jsonify({'message': 'Location saved'}), 201


# GET: latest location
@app.route('/api/location', methods=['GET'])
def get_latest_location():
    history = load_history()
    if history:
        return jsonify(history[-1])
    return jsonify({'latitude': None, 'longitude': None, 'timestamp': None})


# GET: all history
@app.route('/api/history', methods=['GET'])
def get_history():
    return jsonify(load_history())


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


