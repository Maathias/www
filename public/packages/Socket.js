export var type = "sub"
export default class Socket {

	constructor(con) {
		this.con = con

		// socket event register function modification (pass additional parameter)
		// this.socket.originalOn = this.socket.on;
		// this.socket.on = function (event, data, callback) {
		// 	return this.originalOn.call(this, event, (e) => callback(e, data));
		// };

		this.socket = io('/')

		// socket connecting start event
		this.socket.on('connecting', (data) => con.log("Conecting...", "info", 2));
		this.socket.on("connect_error", (data) => con.log(data, "error"))

		this.socket.on('auth', (data) => this.auth(data));
		this.socket.on('com', (data) => this.receive(data));

		// socket disconnected event
		this.socket.on("disconnect", (data) => {
			con.log(`Disconnected from server: ${data}`, "warning")
			con.uAuth(false)
		})
		
		// socket succesfully connected event
		this.socket.on('connect', (data) => {

			con.log("Conected to the server", "ok")
			if (!this.tryAuth()) this.motd()
			else con.log("Credentials detected, waiting for auth before motd", "info", 2)

		});

		// // dynamic (refreshed) data update
		// this.socket.on("dynamic", (data) => {
		// 	console.log(data)
		// 	// /ChangeDom.updateInfo(data);
		// })

		// message broadcast (private & public) event
		// this.socket.on("broadcast", (data) => {
		// 	con.log(data.data, "message");
		// 	con.m = data.frm;
		// 	con.scrollBottom(true);
		// 	if (data.imp) alert("Broadcast message received");
		// 	notif.play();
		// 	con.m = data.frm;

		// })

		// remote execute event TODO: fix
		// this.socket.on("eval", (data) => $("head").append(eval(data.data)))

		
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

	receive(res) {
		this.con.getCom(res.res.id).update(res);
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

