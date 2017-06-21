from flask import Flask, request, abort, jsonify, render_template
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_socketio import send, emit
from flask_socketio import join_room, leave_room

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

socketio = SocketIO(app)
print('### Server Running ###')

sockets = []
Operators = []
# {'room_id':123456789, 'name':'john', 'client_pending':[]}

Clients = []

# API ROUTES

@app.route('/')
def index():
	return 'Yey', 201

@app.route('/operators')
def get_operators():
	return json.dumps(Operators), 200

@app.route('/clients')
def get_clients():
	return json.dumps(Clients), 200

@app.route('/operator', methods=['POST'])
def handle_operator():	
	if not request.json or not 'name' in request.json:
		abort(400)
	operator = request.json	
	Operators.append(operator)		
	socketio.emit('operators', Operators, broadcast=True)		
	return jsonify(operator), 201

@app.route('/client', methods=['POST'])
def handle_client():
	room_id = randint(100000000,999999999)	
	client = request.json
	client['room_id'] = room_id
	client['serviced'] = False
	add_client(client)
	payload = {'room_id': room_id}
	return jsonify(payload), 201

@app.route('/accept', methods=['POST'])
def handle_request():	
	if not request.json or not 'room_id' in request.json:
		abort(400)
	room_id = request.json['room_id']
	operator_name = request.json['operator_name']

	client_index = get_array_index('room_id', room_id, Clients)
	Clients[client_index]['serviced'] = True
	socketio.emit('clients', Clients, broadcast=True)

	payload = {
		'room_id': room_id,
      	'sender': 'system',
      	'name': operator_name,
      	'message': 'Operator has connected.'
	}
	socketio.emit('chat', payload, room=room_id)	
	return 'Success', 201	

def add_client(client):	
	Clients.append(client)
	socketio.emit('clients', Clients, broadcast=True)

def delete_client(room_id):
	client_index = get_array_index('room_id', room_id, Clients)
	Clients.pop(client_index)
	socketio.emit('clients', Clients, broadcast=True)

def get_array_index(needle, value, haystack):	
	for index, item in enumerate(haystack):			
		if item[needle] == value:		
			return index			
	return None


# SOCKET CONNECTIONS

# @socketio.on('connect')
# def connect():
	# print(request.sid)
# @socketio.on('disconnect')
# def disconnect():
	

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


if __name__ == '__main__':
    socketio.run(app)