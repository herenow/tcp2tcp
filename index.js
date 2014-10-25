#!/usr/bin/env node
// Entry point
// Parse arguments and setup the enviroment

// Dependencies
var net = require('net')
var argv = require('optimist')

// Setup args
argv.options('f', {
	alias: 'from',
	describe: 'Proxy traffic from address (where should the proxy listen for connections).',
})
argv.options('t', {
	alias: 'to',
	describe: 'Proxy traffic to address (pass data to this address).',
})
argv.options('d', {
	alias: 'delay',
	describe: 'Adds a delay in ms, before sending packets to the backend.',
})
argv.options('p', {
	alias: 'print',
	describe: 'Print all received data to stdout and stderr. All data sent will be printed to stderr and received data will be printed to stdout!.',
	default: false,
})
argv.options('v', {
	alias: 'verbose',
	describe: 'Verbose output of packets beeing proxies. If print is enabled this will automatically be disabled.',
	default: true,
})
argv.options('h', {
	alias: 'help',
	describe: 'Print help and usage information',
})


// Parse arguments
var arg = argv.argv

// Print help
if(!arg.f || !arg.t || arg.h) {
	console.error("Sample usage: tcp2tcp -f 0.0.0.0:3600 -t 0.0.0.0:3601")
	console.error("Printing to file: tcp2tcp -f 0.0.0.0:3600 -t 0.0.0.0:3601 -p 2> send.data 1> received.data")
	argv.showHelp()
	return
}


// Parse args
var _proxyFrom = arg.f.split(':')
var _proxyTo = arg.t.split(':')
var _delay = arg.d || 0
var _verbose = arg.v || true
var _print =  argv.p || false
var _server = null

// Disable verbose if print is enabled
if(_print) {
	_verbose = false
}

// Start proxy
function init() {
	_server = net.createServer(function(c) {
		print("Client %d connected.", c.fd)

		// Try connect endpoint
		var backend = net.connect(_proxyTo[1], _proxyTo[0], function(s) {
			print("Connected client %d to backend %s.", c.fd, _proxyTo)	

			// Start proxy
			proxy(c, s)
		})

		backend.on('error', function() {
			print("Failed to connect client %d to backend %s.", c.fd, _proxyTo)
		})
	})	

	_server.listen(_proxyFrom[1], _proxyFrom[0])

	print("Waiting for connections on %s...", _proxyFrom)
}

init()

// Print
function print() {
	if(_verbose === false) return

	console.log.apply(this, arguments)
}

// Start proxying
function proxy(fromSocket, toSocket) {
	var client = fromSocket
	var backend = toSocket

	// Data
	client.on('data', function(buf) {
		if(_delay > 0) {
			print("Sending %d bytes from client %d with delay of %d ms.", buf.bytesRead, client.fd, _delay)

			setTimeout(function sendBufferToBackend() {
				backend.write(buf)
			}, _delay)
		}
		else {
			print("Sending %d bytes from client %d.", buf.bytesRead, client.fd)

			backend.write(buf)
		}

		if(_print) {
			console.error(buf)
		}
	})

	// End 
	client.on('end', function() {
		print("Client %d disconnected.", client.fd)
	})

	// Receive
	backend.on('data', function(buf) {
		print("Receiving %d bytes from backend, sending to client %d.", buf.bytesRead, client.fd)
		client.write(buf)

		if(_print) {
			console.log(buf)
		}
	})

	// Unexpected disconnect
	backend.on('end', function() {
		print("Connection to backend lost, disconnecting client %d.", client.fd)
		client.end()
	})
}

// Catch
process.on('exit', exit)
process.on('SIGINT', process.exit)

function exit() {
	if(_server) {
		print("Cleaning up server...")
		_server.close()
	}
}
