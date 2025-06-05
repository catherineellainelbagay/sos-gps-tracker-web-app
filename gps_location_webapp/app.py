from flask import Flask, request, jsonify, render_template
import json
import time
import os

app = Flask(__name__)

# Route for frontend map
@app.route('/')
def home():
    return render_template('index.html')

# Route to get the latest GPS location
@app.route('/api/location', methods=['GET'])
def get_location():
    if os.path.exists('data.json'):
        with open('data.json', 'r') as f:
            data = json.load(f)
    else:
        data = {"latitude": 0.0, "longitude": 0.0, "timestamp": "Not available"}
    return jsonify(data)

# Route to receive GPS data from ESP32
@app.route('/api/location', methods=['POST'])
def receive_location():
    data = request.json
    data['timestamp'] = time.strftime('%Y-%m-%d %H:%M:%S')

    with open('data.json', 'w') as f:
        json.dump(data, f)

    return jsonify({'status': 'success', 'received': data})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
