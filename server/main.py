from flask import Flask, request, abort, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_socketio import send, emit, rooms
from flask_socketio import join_room, leave_room, close_room

import logging
import json
from random import randint

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['DEFAULT_PARSERS'] = [
    'flask.ext.api.parsers.JSONParser',
    'flask.ext.api.parsers.URLEncodedParser',
    'flask.ext.api.parsers.FormParser',
    'flask.ext.api.parsers.MultiPartParser'
]
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
db = SQLAlchemy(app)


socketio = SocketIO(app)
print('### Server Running ###')

Operators = []
Rooms = []

# API ROUTES

@app.route('/')
def index():
	return 'Yey', 201

@app.route('/operators')
def get_operators():
	return json.dumps(Operators), 200

app.route('/operator')
def get_operator_by_session():
	session_id = request.json['session_id']
	user_id = request.json['user_id']
	operator_index = _get_array_index('session_id', session_id, Operators)	
	return jsonify(Operators[operator_index]), 200

@app.route('/rooms')
def get_rooms():
	return json.dumps(Rooms), 200

@app.route('/room/<int:room_id>')
def get_room_by_id(room_id):
	room = {}
	room_index = _get_array_index('id', room_id, Rooms)
	if room_index is not None:
		room = Rooms[room_index]
	return jsonify(room), 200

@app.route('/operator', methods=['POST'])
def handle_add_operator():	
	if not request.json or not 'session_id' in request.json:
		abort(400)
	operator = request.json	
	operator['active'] = True
	Operators.append(operator)		
	socketio.emit('operators', Operators, broadcast=True)		
	return jsonify(operator), 201

@app.route('/room', methods=['POST'])
def handle_add_room():
	room = {}	
	room_id = randint(100000000,999999999)		
	room['id'] = room_id
	room['client'] = request.json
	room['status'] = 'open'
	room['operator'] = {}
	add_room(room)
	payload = {'room_id': room_id}
	return jsonify(payload), 201

@app.route('/accept', methods=['POST'])
def handle_join_operator():	
	room_id = request.json['room_id']
	operator = request.json['operator']	
	room_index = _get_array_index('id', room_id, Rooms)
	Rooms[room_index]['status'] = 'In Progress'
	Rooms[room_index]['operator'] = operator
	socketio.emit('rooms', Rooms, broadcast=True)
	return 'Success', 201	

@app.route('/room/<int:room_id>', methods=['DELETE'])
def handle_close_room(room_id):
	delete_room(int(room_id))	
	return jsonify({'status': 'Success'}), 201


# SOCKET CONNECTIONS

# @socketio.on('connect')
# def connect():
	# print(request.sid)

@socketio.on('disconnect')
def disconnect():
	rooms_connected = rooms()
	for room_id in rooms_connected:
		if room_id != request.sid:			
			delete_room(int(room_id))			

@socketio.on('join')
def join(room_id):	
	join_room(room_id)	

@socketio.on('leave')
def leave(room_id):	
	leave_room(room_id)	

@socketio.on('send_message')
def send_message(data):
	room_id = data['room_id']
	emit('chat', data, room=room_id)


def _get_array_index(key, value, haystack):
	for index, item in enumerate(haystack):	
		if item[key] == value:	
			return index			
	return None

def add_room(room):	
	Rooms.append(room)
	socketio.emit('rooms', Rooms, broadcast=True)	

def delete_room(room_id):
	room_index = _get_array_index('id', room_id, Rooms)
	room = Rooms.pop(room_index)					
	socketio.close_room(room_id)
	socketio.emit('rooms', Rooms, broadcast=True)		


if __name__ == '__main__':
    socketio.run(app)