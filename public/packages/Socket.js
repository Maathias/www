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
		// throw new Error('test')
		// socket event register function modification (pass additional parameter)
		// this.socket.originalOn = this.socket.on;
		// this.socket.on = function (event, data, callback) {
		// 	return this.originalOn.call(this, event, (e) => callback(e, data));
		// };
		// newScript()
		// 	.then(() => {
				this.socket = io('/')

				// socket connecting start event
				this.socket.on('connecting', (data) => con.log("Conecting...", "info", 2));
				this.socket.on("connect_error", (data) => con.log(data, "error"))

				this.socket.on('auth', d => this.auth(d))
				this.socket.on('com', d => this._receive(d))
				this.socket.on('silent', d => this._silent(d))

				// socket disconnected event
				this.socket.on("disconnect", (data) => {
					con.log(`Disconnected from server: ${data}`, "warning")
					this.socket.connect()
				})

				// socket succesfully connected event
				this.socket.on('connect', (data) => {

					con.log("Conected to the server", "ok")
					if (!this.tryAuth()) this.motd()
					else con.log("Credentials detected, waiting for auth before motd", "info", 2)

				});
			// })
	// 		.catch(err=>{
	// 			this.con.log(`socket.io.js download failed: ${err}`, 'error')
	// 		})
	}

	motd() {
		if (this.con.first) return
		this.con.first = true
		this.con.executeCom("motd");
		if (location.hash != "") {
			this.con.log(`Executing command from URI (${location.hash.slice(1)})`, "info", 3)
			this.con.executeCom(decodeURIComponent(location.hash.slice(1)));
		}
	}

	_silent(res){
		this.con.unpack(res)
	}

	_receive(res) {
		this.con.getCom(res.res.id).update(res);
	}

	send(com) {
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

	auth(udata) {
		con.log("Auth data received", "ok", 2);
		this.con.udata = udata;
		this.con.uAuth(true)
		this.con.elements.$commuser.change(this.con.udata.login, this.con.udata.badge);
		// if (!this.fAuth) this.firstAuth()
		this.con.motd()
	}

	tryAuth() {
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

