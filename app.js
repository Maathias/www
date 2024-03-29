// // dependencies
// 	const conf = require('./conf.json')
// 	console.log('loading')
// 	const data = require('./db.json')
// 	console.log('loading')
// 	const express = require('express')
// 	console.log('loading')
// 	const bodyParser = require('body-parser')
// 	console.log('loading')
// 	const path = require('path')
// 	console.log('loading')
// 	const fs = require("fs")
// 	console.log('loading')
// 	const cmd = require('node-cmd')
// 	console.log('loading')
// 	const cookieParser = require('cookie-parser')
// 	console.log('loading')
// 	// const bcrypt = require('bcrypt')
// 	console.log('loading')
// 	const http = require('http')
// 	console.log('loading')
// 	const https = require('https')
// 	console.log('loading')
// 	const socket = require('socket.io')
// 	console.log('loading')
// 	const chalk = require('chalk')
// 	console.log('loading')
// 	const nodemailer = require('nodemailer')
// 	console.log('loading')
// 	const { gzip, ungzip } = require('node-gzip')
// 	console.log('loading')

const dependencies = [
	'chalk',
	['conf', './conf.json'],
	['data', './db.json'],
	'express',
	['bodyParser', 'body-parser'],
	'path',
	'fs',
	['cmd', 'node-cmd'],
	['cookieParser', 'cookie-parser'],
	'http', 'https',
	['socket', 'socket.io'],
	'nodemailer',
	'node-gzip'
]

for (let dep of dependencies) {
	if (typeof dep == 'string') var name = value = dep
	else if (dep instanceof Array) var name = dep[0], value = dep[1]
	global[name] = require(value)
	// console.log()
	log({ action: 'info', data: `Loading '${name}' module` })
}

// other
const
	app = express(),
	stdin = process.openStdin(),
	transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: conf.mail.user,
			pass: conf.mail.pass
		}
	})

class DataBase {

	constructor(json) {
		this.data = json
		this.config = {
			szkola: true,
			lockdown: false,
			dlog: false, // sensor to server log
			llog: false, // info to file log
			hostname: 'smart-home', // pseudo-hostname
			redir: false, // force https
			verbose: 3, // max log lvl
		}
		this.stats = {
			network: {},
			offline: {},
			bed: "-",
			uptime: "-",
			users: "-",
			load1: "-",
			load2: "-",
			load3: "-",
			memory: "-",
			humout: "-",
			tempout: "-",
			humin: "-",
			tempin: "-"
		}
		this.vFiles = {
			home: {
				mathias: {
					node: {
						lol: "lol",
						foo: "lol",
					}
				},
				guest: {
					"surprise": "<a target='_blank' href='https://youtu.be/dQw4w9WgXcQ'>click me</a>"
				}
			},
			szkola: {
				sys_op: {
					"choicep.bat": "sys_op/choicep.bat",
					"calc.bat": "sys_op/calc.bat",
					"cw2.bat": "sys_op/cw2.bat",
					"cw1.bat": "sys_op/cw1.bat",
					"parzyste.bat": "sys_op/parzyste.bat",
					"parametry.bat": "sys_op/parametry.bat",
					"spr.bat": "sys_op/spr.bat",
					"spr2.bat": "sys_op/spr2.bat",
					"m.bat": "sys_op/m.bat",
					"r.bat": "sys_op/r.bat",
					"c.bat": "sys_op/c.bat",
					"p.bat": "sys_op/p.bat",
					"u.bat": "sys_op/u.bat",
					"t.bat": "sys_op/t.bat",
					"z.bat": "sys_op/z.bat",
					"y.bat": "sys_op/y.bat",
					"x.bat": "sys_op/x.bat"
				},
				biologia: {
					"biologia.pdf": "biologia.pdf"
				},
				pp: {
					"pp_definicje.pdf": "pp.pdf"
				}
			},
			styles: {
				mathias: {
					default: "",
					bnw: "",
					light: "",
					gold: "",
					space: ""
				}
			}
		}
		this.connections = []
		this.commands = require("./commands")

		this._macNames = {
			"70:85:c2:70:88:37": "DESKTOP",
			'40:65:a3:90:2a:04': "dekoder",
			'dc:0e:a1:18:a9:2e': "SERVER",
			'68:a3:c4:c7:27:90': "TOSHIBA",
			'90:72:82:0d:77:ec': "funbox",
			'0c:8f:ff:64:de:58': "Huawei P10 Lite",
			'c4:93:d9:88:8a:65': "Galaxy A6",
			'18:21:95:64:93:30': "Galaxy J5",
			'40:40:a7:24:1c:b1': "Xperia M4 Aqua",
			'50:01:d9:fa:db:be': "Huawei P8 Lite",
			'18:1e:78:8c:9b:85': 'sagemcom'
		}
		this.schedule = {

			_list: [],

			_regular: [],

			timeout: undefined,

			_ev(f, params, time) {
				return {
					f: f,
					params: params,
					time: time,
					stats: {
						done: false,
						exit: undefined
					},
					exit: function (b) {
						if (b === true) {
							this.stats.done = true
							this.stats.exit = 0;
						} else {
							this.stats.done = false;
							this.stats.exit = b;
						}
					},
					exec: function () {
						try {
							this.f(this.params)
							this.exit(true)
						} catch (error) {
							log({ action: "info", data: "Event Error" }, 1)
							this.exit(error)
						}
					}
				}

			},

			_check() {

				log({ action: "info", data: "Checking Events" }, 3)

				var now = new Date()
				var next = new Date()

				for (let e of this._list) {
					if (!e.stats.done) {
						if (e.time.getTime() <= now.getTime()) {
							log({ action: "info", data: "Event Found" }, 2)
							e.exec()
						} else {
							if ((e.time.getTime() < next.getTime()) || (next.getTime() == now.getTime())) {
								next.setTime(e.time.getTime())
							}
						}
					}
				}

				// for(let e of this._regular){
				// 	if(!e.stats.done){
				// 		if(e.time[e.time.when[0]]() - now[e.time.when[0]]()){
				// 			log({action: "info", data: "Event Found"}, 2)
				// 			e.exec()
				// 		}else{
				// 			console.log((e.time[e.time.when[0]]() - now[e.time.when[0]]()) *e.time.when[1])
				// 			// if(e.time.getTime()<next.getTime()){
				// 			// 	next.setTime(e.time.getTime())
				// 			// }
				// 		}
				// 	}
				// }

				let n = next.getTime() - now.getTime()
				if (n != 0) {
					log({ action: "info", data: `Next event check in: ${n} ms` }, 3)
					// clearTimeout(this.timeout)
					this.timeout = setTimeout(function (s) { s._check() }, n, this)
					return
				}

			},

			add(f, params, time, when) {
				if ((!f) || (!params) || (!time) || (!when)) return
				time = new Date(time)
				time.when = when
				this._regular.push(this._ev(f, params, time))
				this._check()
			},

			push(f, params, time) {
				if ((!f) || (!params) || (!time)) return
				time = new Date(time)
				this._list.push(this._ev(f, params, time))
				this._check()
			}

		}

		this._done = true;
		if (this._ready) this._ready()

	}

	set onReady(f) {
		this._ready = f;
		if (this._done) this._ready()
	}

	getDevices() {

		log({
			action: "info",
			data: "Updating device list"
		}, 2)

		var uptime = cmd.get("arp-scan --interface=eth0 --localnet", function (err, data, stderr) {
			if (err) {
				throw err
			} else if (stderr) {
				throw stderr
			} else if (data) {
				let r = /(\d*?\.\d*?\.\d*?\.\d*?)\s*?(\S{2}\:\S{2}\:\S{2}\:\S{2}\:\S{2}\:\S{2})\s*(.*?\n|.*\Z)/gm
				let m
				var len = 0

				log({
					action: "info",
					data: "arp-scan done"
				}, 3)

				// db.stats.network = {}

				var list = {}
				while ((m = r.exec(data)) !== null) {

					// This is necessary to avoid infinite loops with zero-width matches
					if (m.index === r.lastIndex) r.lastIndex++;

					len++;

					let name = db._macNames[m[2]] ? db._macNames[m[2]] : m[2]

					/*
					 * m[0] - full match
					 * m[1] - device IP
					 * m[2] - device MAC
					 * m[3] - device description
					 * name - custom name OR null
					*/
					list[name] = {
						ip: m[1],
						mac: m[2],
						desc: m[3],
						name: name,
						connected: dateFormat('long')
					}
				}

				// for(let key in db.stats.network){ // delete in online if is not in current search
				// 	if(!list[key]){
				// 		delete db.stats.network[key]
				// 	}
				// }
				//

				for (let key in list) {
					if (!db.stats.network[key]) { // goes online
						db.stats.network[key] = list[key]
						delete db.stats.offline[key]
					} else { // still online

					}
				}

				for (let key in db.stats.network) {
					if (!list[key]) { // goes offline

						db.stats.offline[key] = db.stats.network[key];
						db.stats.offline[key].disconnected = dateFormat('long')

						delete db.stats.network[key]

					} else { // is still online

					}
					// if(db.stats.offline[key]){
					//
					// }
				}



				// for(let key in db.stats.network){
				// 	if(!db.stats.offline[key]){
				// 		db.stats.offline[key] = db.stats.network[key];
				// 		db.stats.offline[key].date = date()
				// 	}
				//
				// }

				// for(let key in db.stats.network){ // delete in offline if is in online
				// 	if(db.stats.offline[key]){
				// 		delete db.stats.offline[key]
				// 	}
				// }

				log({
					action: "info",
					data: `arp-scan -> ${len} devices online`
				}, 3)

			}
		})

	}

	addAccount(data) {

		log({
			action: "info",
			data: "Creating user account"
		}, 2);

		var id = (function (len, users) {
			var id = ID(len);
			while (users[id]) {
				id = ID(len);
			}
			return id
		})(6, this.data.users)

		this.data.users[id] = {
			login: data.login,
			group: data.group,
			password: data.password,
			ll: data.ll ? data.ll : null
		}

	}

	saveData() {

		log({
			action: "info",
			data: "Saving database file"
		}, 1);

		fs.writeFile("db.json", db.data, function (err) {
			if (err) {
				console.log(err);
				return err;
			} else {
				log({
					action: "info",
					data: "Database saved"
				}, 2);
				return true;
			}
		});
	}


	checkPermissions(request, udata) { // check permissions
		if (typeof this.commands[request.com] != "undefined") {
			return this.commands[request.com].permissions[udata.group] == 1 ? true : false
		} else {
			return false
		}
	}

	addConnection(connection) {

		this.connections.push(connection);

	}

	removeConnection(connection) {

		for (var key in this.connections) {
			if (this.connections[key].socketid === connection.socketid)
				this.connections.splice(key, 1);
		}

	}

	updateConnection(o, n) {
		for (var key in this.connections) {
			if (this.connections[key].socketid === o.socketid)
				this.connections[key] = n;
			return n;
		}
	}

	getConnectionByID(id) {

		for (let key in this.connections) {
			if (
				(this.connections[key].shortid === id) ||
				(this.connections[key].socketid === id)
			) return this.connections[key]
		}

		return undefined

	}

	getConnectionsWith(id) {
		var a = [];
		for (let key in this.connections) {
			if (
				(this.connections[key].login === id) ||
				(this.connections[key].group === id) ||
				(this.connections[key].ip === id)
			) a.push(this.connections[key])
		}

		return a;

	}

	connectionsList() {

		var out = {}
		for (let index of this.connections) {
			if (!out[index.login]) out[index.login] = []
			out[index.login].push(index.shortid)
		}
		return out

	}

	emitToGroup(e, data, group, direction) {

		var direction = isDefined(direction, "only")

		log({
			action: "info",
			data: `Emit to group ${group} ${direction}`
		}, 3);

		var emit = function (socketid) {
			io.to(socketid).emit(e, data)
		}

		for (let con of this.connections) {
			switch (direction) {
				default:
				case "only": if (con.group == group) emit(con.socketid); break;
				case "andup": if (con.group >= group) emit(con.socketid); break;
				case "anddown": if (con.group <= group) emit(con.socketid); break;
				case "up": if (con.group > group) emit(con.socketid); break;
				case "down": if (con.group < group) emit(con.socketid); break;
			}
		}

	}

}

class Connection {
	constructor(obj) {
		var { req, res, socket, cred } = obj
		if (obj.req) {

			if (req.headers['x-forwarded-for'])
				this.ip = req.headers['x-forwarded-for']
			else
				this.ip = req.ip
			this.shortid = ID(6)
			this.method = req.method
			this.status = res.statusCode
			this.path = req.path
			this.hostname = req.hostname
			this.secure = req.secure

			this.req = obj.req

		} else if (obj.socket) {

			if (socket.handshake.headers['x-forwarded-for'])
				this.ip = socket.handshake.headers['x-forwarded-for']
			else
				this.ip = socket.handshake.address

			this.shortid = ID(6)
			this.secure = socket.handshake.secure
			this.hostname = socket.handshake.headers.host

			this.socket = socket

			this.login = 'guest'
			this.group = 9
			this.ll = 'n/a'
			this.badge = 'txcya'
			this.coms = []

			this.authStat = 1

		} else throw new Error("Unknown connection type")
	}

	get userInfo() {
		return {
			badge: this.badge,
			login: this.login,
			group: this.group,
			lastLogin: this.ll,
			shortid: this.shortid
		}
	}

	auth(cred) {
		if (cred) {
			if (cred.token && cred.user) {
				if (db.data.tokens[cred.user]) {
					var n = db.data.tokens[cred.user].indexOf(cred.token)
					if (n != -1) {
						var user = db.data.users[cred.user]
						this.login = user.login
						this.group = user.group
						this.ll = user.ll
						this.badge = (grp => {
							switch (grp) {
								case 0: return "txred"
								case 1: return "txblu"
								case 2:
								case 3:
								case 4:
								case 5:
								case 6:
								case 7:
								case 8:
								case 9: return "txcya"
							}
						})(user.group)
						this.authStat = 0
						return 0
					} else {
						this.authStat = 2
						return 2
					}
				} else {
					this.authStat = 3
					return 3
				}
			}
		}
	}
}

class Com {
	constructor(req, handle) {
		this.handle = handle
		this.req = req

		this.data = {
			blocks: []
		}

		this.res = {
			udata: handle.userInfo,
			con: req.con,
			id: req.id,
		}
	}

	addTime() { }

	Block(data, meta) {
		var data = isDefined(data, {}),
			meta = isDefined(meta, {})
		return {
			id: ID(6),
			sent: false,
			data: data,
			meta: meta,
		}

	}

	insert(data, meta) {
		this.data.blocks.push(this.Block(data, meta))
		var newN = this.data.blocks.length - 1
		this.data.blocks[newN].meta.n = newN
		this.update()

		return this
	}

	update() {
		for (let block of this.data.blocks) {
			if (!block.sent) {
				block.sent = true
				this._send(block)
			}
		}
	}

	end() {
		this.update()
		this.handle.socket.emit('com', {
			res: this.res,
			end: true
		});
	}

	_send(block) {
		this.handle.socket.emit('com', {
			res: this.res,
			data: block.data,
			meta: block.meta
		});
	}
}

function ID(n) {
	/**
	 * thiserate random base64 string identificator.
	 * @param n number of charaters in string.
	 * 
	 * @returns {string} generatred string
	 */

	var out = ""
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"

	for (var i = 0; i < n; i++)
		out += chars.charAt(Math.floor(Math.random() * chars.length))

	return out;
}

function dateFormat(format) {
	/**
	 * thiserates current date in specified format
	 * long - DD/MM/YYYY HH:MM:SS
	 * log - DD/MMM HH:MM:SS
	 * tiny - MM:SS,SSS
	 * @param {string} format date format 
	 * 
	 * @returns {string} date in specified format
	 */

	var d = new Date,
		out = new String,
		h = d.getHours() < 10 ? "0" + d.getHours() : d.getHours(),
		m = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes(),
		s = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds(),
		ms = (function () {
			let ms = d.getMilliseconds()
			return ms < 10 ? '00' + ms : (ms < 100 ? '0' + ms : ms)
		})()

	switch (format) {
		default:
		case 'long':
			return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + " " + d.getHours() + ":" + m + ":" + s
		case 'log':
			return `${d.getDate()}/${d.getMonth()} ${h}:${m}:${s}:${ms}`
		case 'tiny':
			return `${h}:${m}:${s}.${ms}`
	}

	return out
}

function escape() {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function multiLine(...arr) {
	var out = "";
	for (let key of arr) {
		out += key.join("\n");
	}
	return out;
}

function hrtimeToMs(hrtime) {
	return hrtime[0] * 1e3 + hrtime[1] / 1e6
}

function email(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

function isDefined(...d) {

	for (let key in d) {
		if (typeof d[key] != "undefined")
			return d[key]
	}
	return undefined
}

function isNotNull(v, d) {
	if (v == null)
		return d
	else
		return v
}

function find(key, value, array) {
	for (let index in array) {
		if (typeof array[index] == 'object') return Che.find(key, value, array[index])
		if (array[index][key] == value) return array[index]
	}
	return undefined
}

function log(data, lvl) { // log user information //user, session, action, data, ip

	var lvl = lvl || 1,
		verbose = typeof db != 'undefined' ? (typeof db.config != 'undefined' ? db.config.verbose : Infinity) : Infinity

	if (lvl > verbose) return

	var date = chalk.gray(dateFormat('log')) + ` ${"#".repeat(lvl)}`,
		actions = {
			'connect': () => console.log(`${date} CONNECTED        ${chalk.gray(`${data.handle.ip} ${data.handle.shortid}`)}`),
			'disconnect': () => console.log(`${date} DISCONNECTED     ${chalk.gray(`${data.handle.ip} ${data.handle.shortid} ${data.handle.login}`)}`),
			'auth': () => console.log(`${date} AUTH ${
				data.handle.authStat === 0 ? 'OK         ' : (
					data.handle.authStat === 1 ? 'ERR        ' : (
						data.handle.authStat === 2 ? 'FAILED     ' : '[]'
					))
				} ${chalk.gray(`${data.handle.ip} ${data.handle.shortid} ${data.handle.login}`)}`),
			'command': () => console.log(`${date} ${data.com.req.com} ${
				data.stat === 0 ? '           ' : (
					data.stat === 1 ? 'ERR        ' : (
						data.stat === 2 ? 'FAILED     ' : '[]'
					))
				} ${chalk.gray(`${data.handle.ip} ${data.handle.shortid} ${data.handle.login}`)}`)
			,
			// 'denied':	() => console.log(`${date} ${chalk.magenta(data.udata.login + " " + data.udata.shortid + " !>! " + data.data.c + " " + data.data.arg)}`),
			'login': () => console.log(`${date} ${data.udata.login} ${data.udata.shortid} <-< [${data.data.arg[0]}]`),
			'logout': () => console.log(`${date} ${data.udata.login} ${data.udata.shortid} >-> [guest]`),
			// 'unknown':	() => console.log(`${date} ${chalk.yellow(`${data.udata.login} ${data.udata.shortid} ?>? ${data.data.c} ${data.data.arg}`)}`),
			'err': () => console.log(`${date} err -!- ${data.data}`),
			'info': () => console.log(`${date} ${chalk.cyan(data.data)}`),
			'req': () => {
				let status = data.handle.status
				switch (parseInt(status.toString()[0])) {
					case 1: status = chalk.cyan(status); break;
					case 2: status = chalk.green(status); break;
					case 3: status = chalk.yellow(status); break;
					case 4: status = chalk.magenta(status); break;
					case 5: status = chalk.red(status); break;
				}
				console.log(`${date} ${data.handle.method} ${status} ${data.handle.path} ${data.handle.ip}`);
			}

		},
		templates = {
			connect: "CONNECTED $1 $2",
			disconnect: "DISCONNECTED $1 $2 $3",
			auth: "AUTH $5 ",
			command: "$6 $5 $1 $2 $3",
			login: "",
			logout: "",
			err: "",
			info: "$0",
			req: ""
		}

	if (templates[data.action]) {
		console.log((function (template) {
			for (let i = 0; i <= 6; i++) {
				// console.log(template.indexOf(`\$${i}`))
				if (template.indexOf(`\$${i}`) != -1) {
					template = template.replace(`\$${i}`, (function () {
						switch (i) {
							case 0: return chalk.cyan(data.data)
							case 1: return chalk.gray(data.handle.ip)
							case 2: return chalk.gray(data.handle.shortid)
							case 3: return chalk.gray(data.handle.login)
							case 4: return data.handle.authStat === 0 ? 'OK' : (data.handle.authStat === 1 ? 'ERR' : (data.handle.authStat === 2 ? 'FAILED' : '?'))
							case 5: return data.stat === 0 ? '' : (data.stat === 1 ? '?' : (data.stat === 2 ? 'ERR' : '?'))
							case 6: return data.com.req.com
						}
					})())
				}
			}
			return `${date} ${template}`
		})(templates[data.action]))
	}

	// if (actions[data.action]) {
	// 	actions[data.action]()
	// } else {
	// 	console.log(data)
	// }

}

function blink() { // blink the status led
	// cmd.run('python /home/mathias/python/blink.py');
}

function getUptime() {

	var uptime = cmd.get("uptime -p", function (err, data, stderr) {
		if (err) {
			throw err
		} else if (stderr) {
			throw stderr
		} else if (data) {
			db.stats.uptime = data
		}
	})

}

// function save(file, data) { // save data to file
// 	fs.writeFile(file, data, function (err) {
// 		if (err) {
// 			console.log(err);
// 			return err;
// 		} else {
// 			return true;
// 		}
// 	});
// 	return true;
// }

// function dataparse(data) { // parse data coming from /data
// 	l = data.length;
// 	try {
// 		obj = JSON.parse(data);
// 		for (let key in obj) {
// 			if (key != "type") db.stats[key] = obj[key]
// 		}

// 		log({
// 			action: "data",
// 			data: "Data recieved succesfully. " + "[Length: " + l + "]"
// 		});
// 	} catch (e) {
// 		log({
// 			action: "err",
// 			data: "Invalid JSON string recieved. " + "[Length: " + l + "]"
// 		});
// 	}

// 	var to = 0
// 	switch (obj.type) {
// 		default: to = 0; break;
// 		case "stats":
// 		case "uptime": to = 9; break;

// 		case "network": to = 0; break;
// 	}

// 	// emto(obj, to)
// 	blink();
// }

// function gpath(dir, arg) { // get path

// 	var path = [];

// 	isDefined(arg, "");	// if no user argument replace with empty

// 	if (arg.startsWith("\/")) { // if arg is absolute, dont merge
// 		path = arg.slice(1).split("\/");
// 	} else { // if arg is relative, merge
// 		if (!dir.startsWith("/")) dir = "/" + dir;
// 		path = (dir + "/" + arg).slice(1).split("\/");
// 	}

// 	while (path.indexOf("..") != -1) { // remove realtive paths (..)
// 		if (path.indexOf("..") == 0) { // stop on empty
// 			path = [""];
// 			break;
// 		}
// 		z = path.indexOf(".."); // get index of (..)
// 		b = path.slice(0, z - 1); // get first half of path, without one stepdown
// 		c = path.slice(z + 1); // get second half, without (..)
// 		path = b.concat(c); // concat halves
// 	}

// 	if (path[path.length - 1] == "") path.splice(-1, 1); //remove empty dir at end
// 	if (path[0] != "") path.unshift("");  // if no root path, add at beginning
// 	if (path.length == 0) path.push(""); // if empty, add root dir

// 	return path
// }

// function gdir(path) { // get directory
// 	if ((path.length == 0) || (path[0] == "")) {
// 		obj = filess;
// 	}
// 	// else
// 	// if(typeof(filess[path[0]]!="undefined")){
// 	// 	obj = filess[path[0]];
// 	// }

// 	for (i = 1; i < path.length; i++) {
// 		if (obj == null) break;
// 		if (typeof obj[path[i]] != "undefined") {
// 			if (typeof obj[path[i]] != "object") {
// 				obj = null
// 			} else obj = obj[path[i]]
// 		} else obj = null
// 	}
// 	return obj;
// }

// function sfile(path, socket, id) { // get file
// 	obj = gdir(path.slice(0, path.length - 1));
// 	if (obj == null) {
// 		coms({
// 			data: "err: invalid directory",
// 			arg: [],
// 			flag: 0,
// 			id: id
// 		}, socket);
// 		return null;
// 	}
// 	if (typeof obj[path[path.length - 1]] == "undefined") {
// 		coms({
// 			data: "err: file doesn't exist",
// 			arg: [],
// 			flag: 0,
// 			id: id
// 		}, socket);
// 		return null;
// 	}
// 	if ((typeof obj[path[path.length - 1]].data == "undefined") && (typeof obj[path[path.length - 1]].link != "undefined")) {
// 		fs.readFile("files/" + obj[path[path.length - 1]].link, "utf8", function (err, fdata) {
// 			if (err) {
// 				coms({
// 					data: err,
// 					arg: [],
// 					flag: 0,
// 					id: id
// 				}, socket);
// 			} else {
// 				coms({
// 					data: fdata,
// 					arg: [],
// 					flag: 0,
// 					id: id
// 				}, socket);
// 			}
// 		});
// 	} else {
// 		if (typeof obj[path[path.length - 1]].static != "undefined") coms({
// 			data: "<a href='static/" + obj[path[path.length - 1]].static + "'>" + obj[path[path.length - 1]].static + "</a>",
// 			arg: [],
// 			flag: 0,
// 			id: id
// 		}, socket);
// 		else coms({
// 			data: obj[path[path.length - 1]].data,
// 			arg: [],
// 			flag: 0,
// 			id: id
// 		}, socket);
// 	}
// }

// function fsearch(dir, name) {
// 	var is = false;
// 	for (let key in dir) {
// 		if ((typeof dir[key].data != 'undefined') || (typeof dir[key].link != 'undefined')) {
// 			if (name === key) is = true;
// 		} else {
// 			is = fsearch(dir[key], name);
// 		}
// 		if (is) break;
// 	}
// 	return is
// }

// express setup
app
	.set('view engine', 'ejs')
	.set('views', path.join(__dirname, 'views'))
	.use(bodyParser.json())
	.use(cookieParser())
	.use(express.static(path.join(__dirname, 'public')))

	.use(function (req, res, next) {
		var handle = new Connection({ req: req, res: res })
		res.on("finish", function () {
			log({
				action: "req",
				req: req,
				res: res,
				handle: handle
			});
		});
		next()
	})
// .use((err, req, res, next) => res.status(404).render('pages/404.ejs'))

// server setup

const httpServer = http.createServer(app),
	io = new socket(httpServer)

process.on('SIGINT', sig => {
	console.log(`\n${sig}`)
	process.exit(0)
})

// stdin input listener
stdin.addListener("data", function (d) {
	c = d.toString().trim();
	try {
		console.log(eval(c));
	} catch (e) {
		console.error(e);
	}
});

// load user database from db.json and start listening
global.db = new DataBase(data);

db.onReady = function () {

	log({
		action: "info",
		data: "DataBase ready"
	}, 1);

	// db.getDevices()
	// setInterval(function(db){
	// 	db.getDevices()
	// }, 120*1e3, db)

	db.schedule._check()
}

// http standard server
httpServer.listen(conf.ports.main, function () {
	log({
		action: "info",
		data: `Server listening on port ${conf.ports.main}`
	}, 1);
});

// https secure server
if (conf.cert.enable) httpsServer.listen(conf.ports.ssl, function () {
	log({
		action: "info",
		data: `Server listening on port ${conf.ports.ssl}`
	}, 1);
});

// socketio events
io.on('connection', function (socket) {

	var handle = new Connection({ socket: socket })
	db.addConnection(handle)
	log({ action: "connect", handle: handle });

	socket.emit('broadcast', {
		type: 'log',
		data: {
			data: 'lol',
			type: 'server'
		}
	})

	socket.on('disconnect', function () {
		db.removeConnection(handle)
		log({ action: "disconnect", handle: handle });
	});

	socket.on('auth', function (data) { // user authorization request
		handle.auth(data)
		socket.emit("auth", handle.userInfo)
		log({ action: "auth", handle: handle });
	});

	socket.on('com', function (data) { // user command request
		// if (data.dir == "~") data.dir = "\/home\/" + socket.udata.login; // home path translation

		var com = handle.coms.find(el => el.res.id == data.id)

		if (!com) {
			com = new Com(data, handle)
			handle.coms.push(com)
		}

		if (db.commands[com.req.com]) {

			if (db.checkPermissions(com.req, handle)) {

				log({ action: "command", handle: handle, com: com, stat: 0 })
				db.commands[com.req.com].f(com, db)

			} else {
				log({ action: "command", handle: handle, com: com, stat: 2 })
				com.insert(com.req.com + ": Permission denied", {
					flag: 6,
					arg: "error"
				}).end()
			}

		} else {
			log({ action: "command", handle: handle, com: com, stat: 1 })
			com.insert({
				data: com.req.com + ": Command not found"
			}, {
					flag: 6,
					arg: "error"
				}).end()
		}

	});

	socket.on('silent', function (data) {
		function reply(rep) {
			socket.emit('silent', {
				rep: rep,
				id: data.id
			})
		}
		var actions = {
			'size': () => {
				reply('lol')
			}
		}
		if (actions[data.query])
			actions[data.query]()
	})

});

app.get('/', function (req, res) {
	// https redirection
	if (
		req.protocol != 'https'
		&& !req.ip.startsWith("::ffff:192.168")
		&& !db.config.redir
		&& conf.cert.enable
	) {
		res.redirect('https://' + req.hostname + req.originalUrl);
	} else {
		res.sendFile(path.join(__dirname, 'public/index.html'));
	}
});

app.get('/data', function (req, res) {
	res.send("Data recieved")
	// dataparse(req.query.data)
});

app.get('/ga', function (req, res) {
	console.log(req.body.command);
	res.send("ok");
});
