export var type = "sub"
export var requires = {
	scripts: ["socket.io/socket.io.js"]
}

class Request {
	constructor(com) {
		this.com = com.c;
		this.arg = com.arg;
		this.dir = com.arg;
		this.id = com.id;
		this.con = com.con.id;
		this.udata = com.con.udata;
	}
}

export var commands = {
	'socket': com => {
		var actions = {
			'connect': ()=> {
				if (com.con.Socket.socket.disconnected) {
					com.con.Socket.socket.connect()
					com.log(`Connecting to ${com.con.Socket.hostname}`, 'info')
				} else {
					com.log(`Socket already connected`, 'error')
				}
				
			},
			'disconnect': () => {
				if (com.con.Socket.socket.connected){
					com.con.Socket.socket.disconnect()
					com.log(`Disconnecting from ${com.con.Socket.hostname}`, 'warning')
				} else {
					com.log(`Socket not connected`, 'error')
				}
				
			}
		}
		actions[com.arg[0]]()
	}
}

export default class Socket {

	constructor(con) {
		this.con = con
		this.hostname = '/'
		this.socket = io(`${this.hostname}`)

		this.waiting = {}

		this.socket.on('auth', d => this._authReceive(d))
		this.socket.on('com', d => this._comReceive(d))
		this.socket.on('req', d => this._reqReceive(d))
		this.socket.on('broadcast', d => this._broadcast(d))

		this.socket.on('connecting', data => con.log('Conecting...', 'info', 2));
		this.socket.on('connect_error', data => con.log(data, 'error'))


		this.socket.on('disconnect', data => {
			con.log(`Disconnected from server: ${data}`, 'warning')
		})

		this.socket.on('connect', data => {

			con.log("Conected to the server", 'ok')
			this._authSend()
			// if (!this._authSend()) this.motd()
			// else con.log("Credentials detected, waiting for auth before motd", "info", 2)

		});
	}

	destructor(){
		this.socket.close()
	}

	get connected(){
		return this.socket.connected
	}

	// motd() {
	// 	if (this.con.first) return
	// 	this.con.first = true
	// 	this.con.commandlineParse('motd');
	// 	if (location.hash != "") {
	// 		this.con.log(`Executing command from URI (${location.hash.slice(1)})`, "info", 3)
	// 		this.con.executeCom(decodeURIComponent(location.hash.slice(1)));
	// 	}
	// }

	reqSend(data){
		return new Promise((resolve, reject) => {
			var out = {
				query: data,
				id: makeID(5)
			}
			this.waiting[out.id] = {resolve: resolve, reject: reject}
			this.socket.emit('req', out)
		})
	}

	comSend(com) {
		// if (this.res) return; // if response is defined, stop

		// this._startLoading(); // start loading animation

		this.socket.emit("com", {
			com: com.c,
			arg: com.arg,
			dir: com.arg,
			id: com.id,
			con: com.con.id,
			udata: com.con.udata
		}); // send Request object

		// this.timer = setTimeout(function (com) { // set server timeout
		// 	com.timeout(false); // call server response timeout
		// }, this.con.timeout, this); // Con.timeout time, Com object

	}

	uAuth(val) {
		if (val) this.con.udataExp = val
		return this.con.udataExp
	}

	_broadcast(cast){
		var actions = {
			'log': ()=>{
				this.con.log(cast.data.data, cast.data.type)
			}
		}
		if(actions[cast.type])
			actions[cast.type]()
	}
	
	_authReceive(udata) {
		con.log("Auth data received", "ok", 2);
		this.con.udata = udata;
		this.con.uAuth(true)
		this.con.elements.$commuser.change(this.con.udata.login, this.con.udata.badge);
		// if (!this.fAuth) this.firstAuth()
		this.con.motd()
	}

	_comReceive(res) {
		this.con.getCom(res.res.id).update(res);
	}

	_reqReceive(res) {
		// this.con.unpack(res)
		this.waiting[res.id].resolve(res)
		delete this.waiting[res.id]
	}

	_authSend() {
		if (con.credentials) {
			con.socket.emit("auth".credentials);
			con.log("Requesting authentication", "info", 2);
			return true
		} else {
			con.log("No credentials found", "info", 2);
			return false
		}
	}
}

