// dependencies
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require("fs");
const cmd = require('node-cmd');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const http = require('http');
const https = require('https');
const socket = require('socket.io');
const chalk = require('chalk');
const nodemailer = require('nodemailer');
const {gzip, ungzip} = require('node-gzip');

// constant objects
const app = express();
const stdin = process.openStdin();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// ssl credentials
const credentials = {
	key: fs.readFileSync(process.env.CERT_KEY, 'utf8'),
	cert: fs.readFileSync(process.env.CERT_CRT, 'utf8'),
	ca: fs.readFileSync(process.env.CERT_CA, 'utf8')
};

class DataBase{

	constructor(json){
		this.data = JSON.parse(json)
		this.config = {
			szkola: true,
			lockdown: false,
			dlog: false, // sensor to server log
			llog: false, // info to file log
			hostname: 'smart-home', // pseudo-hostname
			redir: false, // https redirection
			verbose: 3, // max log lvl
			pt: false // prace techniczne
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
				guest:{
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

			_ev(f, params, time){
				return {
					f: f,
					params: params,
					time: time,
					stats: {
						done: false,
						exit: undefined
					},
					exit: function(b){
						if(b === true){
							this.stats.done = true
							this.stats.exit = 0;
						}else{
							this.stats.done = false;
							this.stats.exit = b;
						}
					},
					exec: function(){
						try{
							this.f(this.params)
							this.exit(true)
						}catch(error){
							Exe.log({action: "info", data: "Event Error"}, 1)
							this.exit(error)
						}
					}
				}

			},

			_check(){

				Exe.log({action: "info", data: "Checking Events"}, 3)

				var now = new Date()
				var next = new Date()

				for(let e of this._list){
					if(!e.stats.done){
						if(e.time.getTime() <= now.getTime()){
							Exe.log({action: "info", data: "Event Found"}, 2)
							e.exec()
						}else{
							if((e.time.getTime()<next.getTime()) || (next.getTime()==now.getTime())){
								next.setTime(e.time.getTime())
							}
						}
					}
				}

				// for(let e of this._regular){
				// 	if(!e.stats.done){
				// 		if(e.time[e.time.when[0]]() - now[e.time.when[0]]()){
				// 			Exe.log({action: "info", data: "Event Found"}, 2)
				// 			e.exec()
				// 		}else{
				// 			console.log((e.time[e.time.when[0]]() - now[e.time.when[0]]()) *e.time.when[1])
				// 			// if(e.time.getTime()<next.getTime()){
				// 			// 	next.setTime(e.time.getTime())
				// 			// }
				// 		}
				// 	}
				// }

				let n = next.getTime()-now.getTime()
				if( n!= 0 ){
					Exe.log({action: "info", data: `Next event check in: ${n} ms`}, 3)
					// clearTimeout(this.timeout)
					this.timeout = setTimeout(function(s){s._check()}, n, this)
					return
				}

			},

			add(f, params, time, when){
				if((!f) || (!params) || (!time) || (!when)) return
				time = new Date(time)
				time.when = when
				this._regular.push(this._ev(f, params, time))
				this._check()
			},

			push(f, params, time){
				if((!f) || (!params) || (!time)) return
				time = new Date(time)
				this._list.push(this._ev(f, params, time))
				this._check()
			}

		}

		this._done = true;
		if(this._ready) this._ready()

	}

	set onReady(f){
		this._ready = f;
		if(this._done) this._ready()
	}

	getDevices(){

		Exe.log({
			action: "info",
			data: "Updating device list"
		}, 2)

		var uptime = cmd.get("arp-scan --interface=eth0 --localnet", function(err, data, stderr){
			if(err){
				throw err
			}else if(stderr){
				throw stderr
			}else if(data){
				let r = /(\d*?\.\d*?\.\d*?\.\d*?)\s*?(\S{2}\:\S{2}\:\S{2}\:\S{2}\:\S{2}\:\S{2})\s*(.*?\n|.*\Z)/gm
				let m
				var len = 0

				Exe.log({
					action: "info",
					data: "arp-scan done"
				}, 3)

				// db.stats.network = {}

				var list = {}
				while((m = r.exec(data)) !== null) {

				    // This is necessary to avoid infinite loops with zero-width matches
				    if(m.index === r.lastIndex) r.lastIndex++;

					len++;

					let name = db._macNames[m[2]] ? db._macNames[m[2]] : m[2]

					/*
					 * m[0] - full match
					 * m[1] - device IP
					 * m[2] - device MAC
					 * m[3] - device description
					 * name - custom name OR null
					*/
					list[ name ] = {
						ip: m[1],
						mac: m[2],
						desc: m[3],
						name: name,
						connected: Gen.date()
					}
				}

				// for(let key in db.stats.network){ // delete in online if is not in current search
				// 	if(!list[key]){
				// 		delete db.stats.network[key]
				// 	}
				// }
				//

				for(let key in list){
					if(!db.stats.network[key]){ // goes online
						db.stats.network[key] = list[key]
						delete db.stats.offline[key]
					}else{ // still online

					}
				}

				for(let key in db.stats.network){
					if(!list[key]){ // goes offline

						db.stats.offline[key] = db.stats.network[key];
						db.stats.offline[key].disconnected = Gen.date()

						delete db.stats.network[key]

					}else{ // is still online

					}
					// if(db.stats.offline[key]){
					//
					// }
				}



				// for(let key in db.stats.network){
				// 	if(!db.stats.offline[key]){
				// 		db.stats.offline[key] = db.stats.network[key];
				// 		db.stats.offline[key].date = Gen.date()
				// 	}
				//
				// }

				// for(let key in db.stats.network){ // delete in offline if is in online
				// 	if(db.stats.offline[key]){
				// 		delete db.stats.offline[key]
				// 	}
				// }

				Exe.log({
					action: "info",
					data: `arp-scan -> ${len} devices online`
				}, 3)

			}
		})

	}

	addAccount(data){

		Exe.log({
			action: "info",
			data: "Creating user account"
		}, 2);

		var id = (function(len, users){
			var id = Gen.ID(len);
			while(users[id]){
				id = Gen.ID(len);
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

	saveData(){

		Exe.log({
			action: "info",
			data: "Saving database file"
		}, 1);

		fs.writeFile("db.json", db.data, function(err) {
		    if(err){
				console.log(err);
		        return err;
		    }else{
				Exe.log({
					action: "info",
					data: "Database saved"
				}, 2);
				return true;
			}
		});
	}

	verify(credentials){

		if(credentials){
			if(credentials.token){
				var token = credentials.token.split(":");
				if(token.length == 2){
					if(typeof this.data.tokens[token[0]] != "undefined"){
						if( this.data.tokens[token[0]] == token[1] ){
							return new Connection(credentials, this.data.users[token[0]]);
						}else{
							console.log("identity theft attempt")
						}
					}
				}
			}
			return new Connection(credentials);
		}

		throw Error("verify credentials undefined")

	}

	checkPermissions(request, udata){ // check permissions
		if(typeof this.commands[request.com] != "undefined"){
			return this.commands[request.com].permissions[udata.group]==1 ? true : false
		}else{
			return false
		}
	}

	addConnection(connection){

		this.connections.push(connection);

	}

	removeConnection(connection){

		for(var key in this.connections){
			if(this.connections[key].socketid === connection.socketid)
				this.connections.splice(key, 1);
		}

	}

	updateConnection(o, n){
		for(var key in this.connections){
			if(this.connections[key].socketid === o.socketid)
				this.connections[key] = n;
				return n;
		}
	}

	getConnectionByID(id){

		for(let key in this.connections){
			if(
				(this.connections[key].shortid===id) ||
				(this.connections[key].socketid===id)
			) return this.connections[key]
		}

		return undefined

	}

	getConnectionsWith(id){
		var a = [];
		for(let key in this.connections){
			if(
				(this.connections[key].login === id) ||
				(this.connections[key].group === id) ||
				(this.connections[key].ip === id)
			) a.push(this.connections[key])
		}

		return a;

	}

	connectionsList(){

		var out = {}
		for(let index of this.connections){
			if(!out[index.login]) out[index.login] = []
			out[index.login].push(index.shortid)
		}
		return out

	}

	emitToGroup(e, data, group, direction){

		var direction = Che.isDefined(direction, "only")

		Exe.log({
			action: "info",
			data: `Emit to group ${group} ${direction}`
		}, 3);

		var emit = function(socketid){
			io.to(socketid).emit(e, data)
		}

		for(let con of this.connections){
			switch(direction){
				default:
				case "only": if(con.group == group) emit(con.socketid); break;
				case "andup": if(con.group >= group) emit(con.socketid); break;
				case "anddown": if(con.group <= group) emit(con.socketid); break;
				case "up": if(con.group > group) emit(con.socketid); break;
				case "down": if(con.group < group) emit(con.socketid); break;
			}
		}

	}

}

class Connection{
	constructor(credentials, user){
		var user = Che.isDefined(user, {
			login: "guest",
			group: 9,
			ll: "n/a"
		})

		switch(user.group){
			case 0: this.badge = "txred"; break;
			case 1: this.badge = "txblu"; break;
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
			case 9: this.badge = "txcya"; break;
		}

		this.login = user.login;
		this.group = user.group;
		this.ll = user.ll;
		this.ip = credentials.ip.slice(7);
		this.socketid = credentials.socketid;
		this.shortid = Gen.ID(6);
	}

	get userInfo(){
		return {
			badge: this.badge,
			login: this.login,
			group: this.group,
			lastLogin: this.ll,
			shortid: this.shortid
		}
	}

}

class Response{
	constructor(obj, socket){
		this.socket = socket;
		this.ready = false;
		this.error = undefined;
		this.sent = false;
		this.lui = undefined;

		this.req = obj;
		// this.req.com = obj.com;
		// this.req.arg = obj.arg;
		// this.req.dir = obj.dir;
		// this.req.id = Che.isDefined(obj.id, null);
		// this.req.con = Che.isDefined(obj.con, 0);
		// this.req.udata = Che.isDefined(obj.udata, null);

		this.res = {};
		this.res.data = null;
		this.res.flag = 0;
		this.res.arg = null;
		this.res.frm = "root";
		this.res.dir = null;
		this.res.lui = null;
		this.res.udata = this.socket.udata.userInfo;
		this.res.con = this.req.con;
		this.res.id = this.req.id;
		this.res.time = [];

		this.start = process.hrtime();
		this.lastTime = this.start;
	}

	addTime(desc, hrt){

		let t = Che.isDefined(hrt, process.hrtime(this.lastTime));
		this.lastTime = process.hrtime();
		this.res.time.push(
			[
				Tra.hrtimeToMs(t),
				desc
			]
		);

		return this

	}

	insert(data){
		for(let key in data){
			if(key in this.res){
				this.res[key] = data[key];
			}else{
				this.error = 0x00; // invalid input data
			}
		}
		this.ready = true;
		this.lui = Che.isNotNull(this.res.lui, "command");
		this.addTime("Response.insert");

		return this

	}

	denied(){
		this.insert({
			data: this.req.com+": Permission denied",
			flag: 6,
			arg: "error"
		});
		this.lui = "denied";
		this.addTime("Response.denied");
		this.send();
	}

	unknown(){
		this.insert({
			data: this.req.com+": Command not found",
			flag: 6,
			arg: "error"
		});
		this.lui = "unknown";
		this.addTime("Response.unknown");
		this.send();
	}

	send(){
		this.addTime("Response.send");
		this.addTime("Total", process.hrtime(this.start));
		if(this.ready){
			if(!this.sent){
				if(!this.error){
					this.socket.emit("com", this.res);
					Exe.log({
						action: this.lui,
						udata: this.socket.udata,
						id: this.socket.id,
						data: {
							c: this.req.com,
							arg: this.req.arg
						}
					});
					this.sent = true;
					this.error = false;
					return true
				}else{
					this.error = 0x01 // error occured, stop
					Exe.log({
						data: "Command send error: "+this.error
					});
					return false
				}

			}else{
				this.error = 0x02 // res already sent
				Exe.log({
					data: "Command send error: "+this.error
				});
				return false
			}
		}else{
			this.error = 0x03 // data not ready
			Exe.log({
				data: "Command send error: "+this.error
			});
			return false
		}
	}
}

class Gen{ // Generate data

	static ID(n){ // generate random base 64 string
		var out = "";
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

		for (var i = 0; i < n; i++)
			out += chars.charAt(Math.floor(Math.random() * chars.length));

		return out;
	}

	static date(){ // DD/MM/YYYY HH:MM:SS
		var d = new Date;

		if(d.getMinutes()<10) var m = "0"+d.getMinutes();
		else var m = d.getMinutes();

		if(d.getSeconds()<10) var s = "0"+d.getSeconds();
		else var s = d.getSeconds();

		return String(d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()+" "+d.getHours()+":"+m+":"+s);
	}

	static logDate(){ // DD/MMM HH:MM:SS
		var p = new Date().toString().replace(/[A-Z]{3}\+/,'+').split(/ /);
	    return (p[2]+'/'+p[1]+' '+p[4]);
	}

}

class Tra{ // Transform data

	static escape(){
		return unsafe
	         .replace(/&/g, "&amp;")
	         .replace(/</g, "&lt;")
	         .replace(/>/g, "&gt;")
	         .replace(/"/g, "&quot;")
	         .replace(/'/g, "&#039;");
	}

	static multiLine(...arr){
		var out = "";
		for(let key of arr){
			out += key.join("\n");
		}
		return out;
	}

	static hrtimeToMs(hrtime){
		return hrtime[0]*1e3 + hrtime[1]/1e6
	}

}

class Che{ // Check data

	static email(email) {
	    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(String(email).toLowerCase());
	}

	static isDefined(...d){

		for(let key in d){
			if(typeof d[key] != "undefined")
				return d[key]
		}
		return undefined
	}

	static isNotNull(v, d){
		if(v == null)
			return d
		else
			return v
	}

}

class Exe{ // Execute

	static log(obj, lvl){ // log user information //user, session, action, data, ip

		var lvl = Che.isDefined(lvl, 1)

		if(lvl > db.config.verbose) return

		var d = chalk.underline(Gen.logDate())+` ${"#".repeat(lvl)} `;
		if(typeof obj.ip != "undefined"){
			if(obj.ip=="::1") return
			obj.ip = obj.ip.slice(7);
		}

		switch(obj.action){
			default:
				console.log(" --- ");
				break;
			case "disconnect":
				console.log(`${d}${chalk.gray(`${obj.udata.login} ${obj.udata.shortid} --> disconnected`)}`);
				break;

			case "connect":
				console.log(`${d}${chalk.gray(`[${obj.udata.ip}] --connected--`)}`);
				break;

			case "auth":
				console.log(`${d}${ chalk.gray(`[${obj.udata.ip}] --auth--> \'${obj.udata.login}\' \'${obj.udata.shortid}\'`) }`)
				break;

			case "command":
				console.log(`${d}\'${obj.udata.login}\' \'${obj.udata.shortid}\' --comm--> \"${obj.data.c} ${obj.data.arg}\"`);
				break;

			case "denied":
				console.log(d+chalk.magenta(obj.udata.login+" "+obj.udata.shortid+" !>! "+obj.data.c+" "+obj.data.arg));
				break;

			case "login":
				console.log(d+obj.udata.login+" "+obj.udata.shortid+" <-< ["+obj.data.arg[0]+"]");
				break;

			case "logout":
				console.log(d+obj.udata.login+" "+obj.udata.shortid+" >-> [guest]");
				break;

			case "data":
				if(db.config.dlog)
					console.log(d+"data -+- "+obj.data);
				break;

			case "err":
				console.log(d+"err -!- "+obj.data);
				break;

			case "info":
				console.log(d+chalk.red(obj.data));
				break;

			case "req":
				switch(parseInt(obj.response.toString()[0])){
					case 1: obj.response = chalk.cyan(obj.response);break;
					case 2: obj.response = chalk.green(obj.response);break;
					case 3: obj.response = chalk.yellow(obj.response);break;
					case 4: obj.response = chalk.magenta(obj.response);break;
					case 5: obj.response = chalk.red(obj.response);break;
				}
				console.log(d+obj.type+" "+obj.response+" "+obj.path+" "+obj.ip);
				break;

			case "unknown":
				console.log(d+chalk.yellow(obj.udata.login+" "+obj.udata.shortid+" ?>? "+obj.data.c+" "+obj.data.arg));
				break;

		}
		Exe.blink();
	}

	static blink(){ // blink the status led
		cmd.run('python /home/mathias/python/blink.py');
	}

	static runCommand(req, socket){ // execute sent command

		var response = new Response(req, socket);

		response.addTime("command-execute");
		if(db.commands[response.req.com]){
			response.addTime("permchek");
			if(db.checkPermissions(response.req, response.socket.udata)){

				db.commands[response.req.com].f(response, db)

			}else response.denied();

		}else response.unknown();




	}

	static getUptime(){

		var uptime = cmd.get("uptime -p", function(err, data, stderr){
			if(err){
				throw err
			}else if(stderr){
				throw stderr
			}else if(data){
				db.stats.uptime = data
			}
		})

	}

}

function getarg(arg){
	a = {};
	for(let key in arg){
		key = parseInt(key);

		if(typeof arg[key] === "string") if(arg[key].startsWith("-")){

			if((key+1)==arg.length){
				a[arg[key].slice(1)] = true;
			}else{
				if(typeof arg[key+1] === "string"){
					if(arg[key+1].startsWith("-"))
						a[arg[key].slice(1)] = true;
					else
						a[arg[key].slice(1)] = arg[key+1];
				}else{
					a[arg[key].slice(1)] = arg[key+1];
				}
			}
		}
	}
	return a;
}

function save(file, data){ // save data to file
	fs.writeFile(file, data, function(err) {
	    if(err){
			console.log(err);
	        return err;
	    }else{
			return true;
		}
	});
	return true;
}

function varlog(){ // log statistic information to file
	fs.readFile('logs/node.log', function (err, data){
		if(err){
			console.log(err);
		}
		try{
			dt = JSON.parse(data);
		}catch{
			dt = {
				"tempin": [],
				"tempout": [],
				"humin": [],
				"humout": [],
				"load": [],
				"memory": [],
				"time": []
			}
		}

		dt["tempin"].push(info.tempin);
	  	dt["tempout"].push(info.tempout);
	  	dt["humin"].push(info.humin);
	  	dt["humout"].push(info.humout);
	  	dt["load"].push(info.load1);
	  	dt["memory"].push(info.memory);
		var t = String(Gen.date());
		dt["time"].push(t);

		e = JSON.stringify(dt);

		save("logs/node.log", e);

		//console.log(dt.time.length);//09/11/2018/18:03:30

		var ldate = Gen.ID(5);

		if(dt.time.length >= 500){
			fs.rename("logs/node.log", "logs/node-"+ldate+".log", (err) => {
			    if (err) throw err;
			    if(db.config.llog)console.log('log copied');
			});
			fs.copyFile('logs/empty.log', 'logs/node.log', (err) => {
			    if (err) throw err;
			    if(db.config.llog)console.log('new log created');
			});
		}
	    if(db.config.llog)console.log("Saved LOG");
	});
	Exe.blink();
}

function dataparse(data){ // parse data coming from /data
	l = data.length;
	try{
		obj = JSON.parse(data);
		for(let key in obj){
			if(key!="type") db.stats[key] = obj[key]
		}

		Exe.log({
			action: "data",
			data: "Data recieved succesfully. "+"[Length: "+l+"]"
		});
	}catch{
		Exe.log({
			action: "err",
			data: "Invalid JSON string recieved. "+"[Length: "+l+"]"
		});
	}

	var to = 0
	switch(obj.type){
		default: to=0; break;
		case "stats":
		case "uptime": to=9; break;

		case "network": to=0; break;
	}

	// emto(obj, to)
	Exe.blink();
}


function gpath(dir, arg){ // get path

	var path = [];

	Che.isDefined(arg, "");	// if no user argument replace with empty

	if(arg.startsWith("\/")){ // if arg is absolute, dont merge
		path = arg.slice(1).split("\/");
	}else{ // if arg is relative, merge
		if(!dir.startsWith("/"))dir= "/"+dir;
		path = (dir+"/"+arg).slice(1).split("\/");
	}

	while(path.indexOf("..")!=-1){ // remove realtive paths (..)
		if(path.indexOf("..")==0){ // stop on empty
			path=[""];
			break;
		}
		z = path.indexOf(".."); // get index of (..)
		b = path.slice(0, z-1); // get first half of path, without one stepdown
		c = path.slice(z+1); // get second half, without (..)
		path = b.concat(c); // concat halves
	}

	if(path[path.length-1]=="") path.splice(-1,1); //remove empty dir at end
	if(path[0]!="") path.unshift("");  // if no root path, add at beginning
	if(path.length==0) path.push(""); // if empty, add root dir

	return path
}

function gdir(path){ // get directory
	if((path.length==0) || (path[0]=="")){
		obj = filess;
	}
	// else
	// if(typeof(filess[path[0]]!="undefined")){
	// 	obj = filess[path[0]];
	// }

	for(i=1; i<path.length; i++){
		if(obj == null) break;
		if( typeof obj[path[i]] != "undefined" ){
			if(typeof obj[path[i]] != "object"){
				obj = null
			}else obj = obj[path[i]]
		}else obj = null
	}
	return obj;
}

function sfile(path, socket, id){ // get file
	obj = gdir(path.slice(0, path.length-1));
	if(obj==null){
		coms({
			data: "err: invalid directory",
			arg: [],
			flag: 0,
			id: id
		}, socket);
		return null;
	}
	if(typeof obj[path[path.length-1]] == "undefined"){
		coms({
			data: "err: file doesn't exist",
			arg: [],
			flag: 0,
			id: id
		}, socket);
		return null;
	}
	if((typeof obj[path[path.length-1]].data == "undefined") && (typeof obj[path[path.length-1]].link != "undefined")){
		fs.readFile("files/"+obj[path[path.length-1]].link, "utf8", function(err, fdata){
			if(err){
				coms({
					data: err,
					arg: [],
					flag: 0,
					id: id
				}, socket);
			}else{
				coms({
					data: fdata,
					arg: [],
					flag: 0,
					id: id
				}, socket);
			}
		});
	}else{
		if(typeof obj[path[path.length-1]].static != "undefined")coms({
			data: "<a href='static/"+obj[path[path.length-1]].static+"'>"+obj[path[path.length-1]].static+"</a>",
			arg: [],
			flag: 0,
			id: id
		}, socket);
		else coms({
			data: obj[path[path.length-1]].data,
			arg: [],
			flag: 0,
			id: id
		}, socket);
	}
}

function fsearch(dir, name){
	var is = false;
	for(let key in dir){
		if((typeof dir[key].data != 'undefined') || (typeof dir[key].link != 'undefined')){
			if(name === key) is = true;
		}else{
			is = fsearch(dir[key], name);
		}
		if(is) break;
	}
	return is
}

// express setup
app
	.set('view engine', 'ejs')
	.set('views', path.join(__dirname, 'views'))
	.use(bodyParser.json())
	.use(cookieParser())

	.use(express.static('static'))
	.use(express.static(path.join(__dirname, 'views')))
	.use(function(req, res, next){
		res.on("finish", function() {
			Exe.log({
				action: "req",
				type: req.method,
				response: res.statusCode,
				path: req.path,
				ip: req.ip
			});
		});
		next()
	});

// server setup
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

// socketio setup
const io = new socket()
	.attach(httpServer)
	.attach(httpsServer)

stdin.addListener("data", function(d) {
	c = d.toString().trim();
	try{
		console.log( eval(c) );
	}catch(error){
		console.error( error );
	}
});

// process.chdir("/home/mathias/node")

// load user database from db.json and start listening
fs.readFile('db.json', function (err, data){
	if(err){
		console.log(err);
	}else{

		global.db = new DataBase(data);

		db.onReady = function(){

			Exe.log({
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
		httpServer.listen(process.env.PORT_MAIN, function (){
			Exe.log({
				action: "info",
				data: `Server listening on port ${process.env.PORT_MAIN}`
			}, 1);
		});

		// https secure server
		httpsServer.listen(process.env.PORT_SSL, function (){
			Exe.log({
  			  action: "info",
  			  data: `Server listening on port ${process.env.PORT_SSL}`
		  }, 1);
		});

	}
});

// data logging
// setInterval(function(){ if(!config.lockdown)varlog(); }, 60000);

// socketio events
io.on('connection', function(socket){ // connection established event

	// verify user information
	socket.udata = db.verify({
		// token: socket.request._query.token,
		ip: socket.handshake.address,
		socketid: socket.id
	});

	db.addConnection(socket.udata) // add current connection data to online users list

	Exe.log({
		action: "connect",
		udata: socket.udata
	});

	socket.on('disconnect', function(){ // connection disconnect event
		Exe.log({
			action: "disconnect",
			udata: socket.udata
		});

		db.removeConnection(socket.udata);	// remove current connection data from online users list

  });

	socket.on('auth', function(data){ // user command request
		socket.udata = db.updateConnection(socket.udata, db.verify({
			token: data ? data.token : undefined,
			ip: socket.handshake.address,
			socketid: socket.id
		}))

		Exe.log({
			action: "auth",
			udata: socket.udata
		});

		socket.emit("auth", socket.udata.userInfo)

	});

	socket.on('com', function(data){ // user command request
		if(data.dir == "~")data.dir = "\/home\/"+socket.udata.login; // home path translation

		Exe.runCommand(data, socket); // command execution

	});

});

app.get('/', function(req, res){
	// check if cleint is on local network
	if(req.ip.startsWith("::ffff:192.168")) var local = true;
	else var local = false;

	// https redirection
	if(req.protocol != 'https' && !local && !db.config.redir){
		res.redirect('https://'+req.hostname+req.originalUrl);
	}else{
		if(db.config.pt && !local){ // temporary lockout
			res.send("Trwają prace techniczne, zapraszam później");
		}else{
			res.render('pages/index', {
				vars: {
					hostname: db.config.hostname
				}
			});
		}
	}
});

app.get('/data', function(req, res){
	res.send("Data recieved")
	// dataparse(req.query.data)
});

app.get('/ga', function(req, res){
	console.log(req.body.command);
	res.send("ok");
});
