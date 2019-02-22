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
		this.commands = {

			help: {
				f: response => {
					if(response.req.arg[0]){ // command manual
						var c = response.req.arg[0];
						var cc = this.commands[response.req.arg[0]]
						if(cc){
							response.insert({data: cc.man}).send()
						}else{
							response.insert({data: `User manual for ${c} not found`, flag: 6, arg: "error"}).send()
						}
					}else{ // commands list
						response.insert({data:
							(function(commands, response){
								var out = []
								for(let com in commands){
									out.push([`<txred>${com}</txred> ${(function(args){
										let out = ""
										for(let arg of args){
											if(arg.startsWith("[") && arg.endsWith("]")){ // necessary
												out += `<txgrn>${arg}</txgrn> `
												continue
											}
											if(arg.startsWith("|") && arg.endsWith("|")){ // optional
												out += `<txcya>${arg}</txcya> `
												continue
											}
											out += arg+" "
										}
										return out
									})(commands[com].args)}`, commands[com].desc, `[permission: ${
										commands[com].permissions[response.socket.udata.group] == 1 ? "<txgrn>Yes</txgrn>" : "<txred>No</txred>"
									}]`])
								}
								return out
							})(this.commands, response)/*
						)*/, flag: 10}).send()
					}

				},
				desc: "Displays all current commands, with permissions and acceptable parameters",
				args: ["|command|"],
				man: "user manual",

				permissions: new Array(10).fill(1)
			},

			evals: {
				f: response => {
					try{
						var e = eval(response.req.arg.join(" "));
						response.insert({
							data: e,
							flag: 9
						});
					}catch(error){
						console.log(error);
						response.insert({
							data: error.message,
							flag: 6,
							arg: "error"
						});
					}

					response.send();
				},
				desc: "Eval-server. Executes js code on server",
				args: ["[javascript]"],
				man: "user manual",

				permissions: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			},

			about: {
				f: response => {
					response.insert({
						data: [
							["<txblu>Facebook</txblu>", "<a target='_blank' href='http://facebook.com/pstrucha.mateusz'>/pstrucha.mateusz</a>"],
							["<txorn>Reddit</txorn>", "<a target='_blank' href='http://reddit.com/u/mathias_-'>/u/mathias_-</a>"],
							["<txdbl>GitHub</txdbl>", "<a target='_blank' href='https://github.com/Maathias'>/Maathias</a>"],
							["<txblu>Discord</txblu>", "<a target='_blank' href='https://discord.gg/z8kW2eY'>WKR</a>"],
							["<txorn>StackOverflow</txorn>", "<a target='_blank' href='https://stackoverflow.com/users/7358565/mathias'>mathias</a>"]
						],
						flag: 10
					}); response.send();
				},
				desc: "Displays contact info",
				args: [],
				man: "user manual",

				permissions: new Array(10).fill(1)
			},

			do: {
				f: response => {
					response.addTime("do.begin");
					var out = cmd.get(response.req.arg.join(" "), function(err, data, stderr){
						response.addTime("do.end");
						if(stderr){
							response.insert({
								data: stderr,
								flag: 6,
								arg: "error"
							});
						}else if(err){
							response.insert({
								data: err,
								flag: 6,
								arg: "error"
							});
						}else{
							response.insert({
								data: data,
								flag: response.req.arg[0]=="cat"?11:0
							});
						}

						response.send();
					});
					setTimeout(function(out){
						response.addTime("do.kill");
						cmd.run(`kill ${out.pid}`)
					}, 15000, out)
				},
				desc: "Executes linus commands (on root)",
				args: ["[linux syntax]"],
				man: "user manual",

				permissions: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			},

			ping: {
				f: response => {
					response.insert({
						data: "pong",
						flag: 12
					}).send();
				},
				desc: "tests internet connection",
				args: [],
				man: "user manual",

				permissions: new Array(10).fill(1)
			},

			uptime: {
				f: response => {
					response.insert({
						data: [
							[`<txred>Uptime:</txred>`, `<span class="info0">${db.stats['uptime']}</span>`],
							[`<txred>Load average:</txred>`, `<span class="info1">${db.stats['load1']}</span>% <span class="info2">${db.stats['load2']}</span>% <span class="info3">${db.stats['load3']}</span>%`],
							[`<txred>Memory:</txred>`, `<span class="info4">${db.stats['memory']}</span>%`],
							[`<txred>In terminal:</txred>`, `<span class="info5">${db.stats['users']}</span>`]
						],
						flag: 10 // toTable
					});	response.send();
				},
				desc: "Displays current OS stats",
				args: [],
				man: "user manual",

				permissions: new Array(10).fill(1)
			},

			stats: {
				f: response => {
					response.insert({
						//'[TIME] <txblu>'+new Date()+'</txblu>'+
						data: [
							["[TEMP]", `<txyel>OUTSIDE: </txyel><span class="info6">${db.stats['tempout']}</span>C`, `<txcya>INSIDE: </txcya><span class="info7">${db.stats['tempin']}</span>C`],
							["[HUM]", `<txyel>OUTSIDE: </txyel><span class="info8">${db.stats['humout']}</span>%`, `<txcya>INSIDE: </txcya><span class="info9">${db.stats['humin']}</span>%`]
						],
						flag: 10 // toTable
						// data: <br></span>         <br></span>          <br></span>[BED]  '+(info['bed']?"occupied":"empty")
					});
					response.send();
				},
				desc: "Displys current physical stats",
				args: [],
				man: "user manual",

				permissions: new Array(10).fill(1)
			},

			devices: {
				f: response => {
					response.insert({
						data: {Network: db.stats.network, Offline: db.stats.offline},
						flag: 9 // toTree
					});	response.send();
				},
				desc: "Display network devices connection history",
				args: [],
				man: "user manual",

				permissions: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0]
			},

			connection: {
				f: response => {
					response.insert({
						data: [
							["<txcya>socket</txcya>.<txred>shortid</txred>", response.socket.udata.shortid],
							["<txcya>socket</txcya>.<txred>ip</txred>", response.socket.udata.ip],
							["<txcya>socket</txcya>.<txred>hostname</txred>", response.socket.handshake.headers.host],
							["<txcya>socket</txcya>.<txred>ssl</txred>", response.socket.handshake.secure],
							["<txcya>Last Login</txcya>", response.socket.udata.ll],
							["<txcya>Permission Group</txcya>", response.socket.udata.group]
						],
						flag: 10 // toTable
					});	response.send();
				},
				desc: "Displays current socket connection data",
				args: [],
				man: "user manual",

				permissions: new Array(10).fill(1)
			},

			login: {
				f: response => {

					if( // data validation
						(typeof response.req.arg != "object")||
						(typeof response.req.arg.remember != 'boolean')||
						(typeof response.req.arg.login != 'string')||
						(typeof response.req.arg.pass != 'string')
					){
						response.insert({
							data: "login: input error",
							flag: 6,
							arg: "error"
						}); response.send();
						return
					}

					// no user in db
					if(typeof db.data.users[response.req.arg.login] == "undefined"){
						response.insert({
							data: `login: user ${response.req.arg.login} doesn't exist`,
							flag: 6,
							arg: "error"
						}); response.send();
						return
					}

					response.addTime("login.begin"); // timemark

					// password compare
					bcrypt.compare(response.req.arg.pass, db.users[response.req.arg.login].password, function(err, r){
						if(r){ // succes
							response.addTime("login.pass-ok");
							var exp = response.req.arg.pass.remember ? "; expires=Fri, 1 Jan 2038 00:00:00 UTC" : "; expires=0"

							var user = db.users[response.req.arg.login]

							user.ll = Gen.date();

							// var session = db.tokens[]

							lui({
								action: "login",
								udata: socket.udata,
								id: socket.id,
								data: {
									c: response.req.com,
									arg: response.req.arg
								}
							});

							connections.remove(socket.udata);
							socket.udata = db.verify(response.req.arg.login, session, socket.handshake.address.slice(7), socket.id);
							connections.add(socket.udata);

							response.insert({
								data: {
									"user": response.req.arg.login,
									"session": session,
									"expiry": exp
								},
								udata: socket.udata,
								flag: 1
							}); response.send();
						}else{// password incorrect
							response.addTime("login.pass-incorrect");
							response.insert({
								data: "login: incorrect password",
								flag: 6,
								arg: "error"
							}); response.send();
						}
					});
				},

				desc: "",
				args: ["[object Object]"],
				man: "user manual",

				permissions: new Array(10).fill(1)
			},

			// : {
			// 	f: response => {
			//
			// 	},
			// 	desc: "",
			// 	args: [],
			// 	man: "user manual",
			//
			// 	permissions: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			// },

			// 		"<txred>online</txred> 'displays list of currently online users'",
			// 		"<txred>tree</txred> <txcya>|dir|</txcya> 'displays directory content'",
			// 		"<txred>me</txred> 'displays your id'",
			// 		"<txred>cd</txred> <txgrn>[dir]</txgrn>",
			// 		"<txred>pwd</txred> 'get full current path'",
			// 		"<txred>m</txred> <txcya>|-user|</txcya> message 'send message to user'",
			// 		"<txred>chart 'displays sensor data chart'</txred>",
			// 		"<txred>arduino</txred>",
			// 		"<txred>hash</txred> <txgrn>[-gen|-check]</txgrn> <txgrn>[\"string\"]</txgrn> <txcya>|hash|</txcya>",
			// 		"<txred>data</txred>",
			// 		"<txred>uptime</txred> 'server stats'",
			// 		"<txred>stats</txred> 'sensor stats'",
			// 		"<txred>devices</txred> 'network devices list'",
			// 		"<txred>welcome</txred> <txcya>|-p|</txcya> 'basic connection data'",
			// 		"<txred>cat</txred> <txgrn>[file]</txgrn> 'displays file content'",
			// 		"<txred>szkola</txred> 'deprecated, use tree /szkola'",
			// 		"<txred>login</txred> <txgrn>[username]</txgrn> <txgrn>[password]</txgrn>",
			// 		"<txred>logout</txred>",
			// 		"<txred>silent</txred>",
			// 		"<txred>broadcast</txred> <txgrn>[message]</txgrn>"

			/*
			switch(response.req.com){
	default:
		response.unknown();
		break;
	case "me":
		response.insert({
			data: "tak"
		});
		response.send();
	break;

	/*
	case "styleexists":
		if(fsearch(gdir(gpath(dir, arg[0])), arg[1])){
			var r = arg[1];
		}else{
			var r = "";
		}

		coms({
			data: r,
			arg: [],
			flag: 7,
			id: id
		}, socket);
	break;
	//############################################################################################################################

	case "remexec":
		arg[1] = arg.slice(1).join(" ");
		if((typeof(db.users[arg[0]])!="undefined")||(arg[0]=="guest")){ // check if 'user' exists
			loginids = gli(arg[0]); // get all connections logedin as 'user'

			if(loginids!=null){ // check if user is online

				emtoarr(loginids, "exec", {
					data: arg[1]
				}, socket)

				response.insert({
					data: "script sent",
					flag: 6,
					arg: "ok"
				}); response.send();
			}else{	// 'user' is offline
				response.insert({
					data: "user is offline",
					flag: 6,
					arg: "error"
				}); response.send();
			}
		}else{	// 'user' does not exist
			usid = getconn(arg[0]);

			if(usid!=null){ // check if 'user' exists as shortid
				io.to(usid.socketid).emit('exec', {
					data: arg[1]
				});
				response.insert({
					data: "script sent",
					flag: 6,
					arg: "ok"
				}); response.send();
			}else response.insert({
				data: "id doesn't exist",
				flag: 6,
				arg: "error"
			}); response.send();
		}

	break;
	//############################################################################################################################

	case "showdb":
		response.insert({
			data: db,
			flag: 9
		});	response.send();

	break;
	//############################################################################################################################
	case "do":
		response.addTime("do.begin");
		out = cmd.get(response.req.arg.join(" "), function(err, data, stderr){
			response.addTime("do.end");
			if(stderr){
				response.insert({
					data: stderr,
					flag: 6,
					arg: "error"
				});
			}else if(err){
				response.insert({
					data: err,
					flag: 6,
					arg: "error"
				});
			}else{
				response.insert({
					data: data,
					flag: response.req.arg[0]=="cat"?11:0
				});
			}

			response.send();
		});
		setTimeout(function(out){
			response.addTime("do.kill");
			cmd.run(`kill ${out.pid}`)
		}, 15000, out)
	break;

	//############################################################################################################################
	case "evals":

		try{
			var e = eval(response.req.arg.join(" "));
			response.insert({
				data: e,
				flag: 9
			});
		}catch(error){
			console.log(error);
			response.insert({
				data: error.message,
				flag: 6,
				arg: "error"
			});
		}

		response.send();

	break;
	//############################################################################################################################

	case "online":
		coms({
			data: getonline(),
			arg: [],
			flag: 0,
			id: id
		}, socket);

	break;
	//############################################################################################################################

	case "tree":
		// console.log(JSON.stringify(tree(filess)));
		let path = gpath(dir, arg[0]);
		coms({
			data: tree(gdir(path), path[path.length-1]),
			arg: [],
			flag: 0,
			id: id
		}, socket);

	break;
	//############################################################################################################################

	case "me":
		if(arg[0]=="verify"){
			coms({
				data: socket.udata,
				arg: [],
				flag: 8,
				id: id
			}, socket);
		}else//{

		response.insert({
			data: socket.id,
			flag: 0
		})
		response.send();

		// }
		// coms({
		// 	data: socket.id.slice(0, 6),
		// 	arg: [],
		// 	flag: 0,
		// 	id: id
		// }, socket);

	break;
	//############################################################################################################################

	case "cd":
	if(typeof arg[0]=="undefined")arg[0]="/"
		obj = gdir(gpath(dir, arg[0]));
		if(path.length==1)path=["/"];

		if(obj!=null){
			coms({
				data: path.join("\/"),
				arg: [],
				flag: 5,
				id: id
			}, socket);
		}else{
			coms({
				data: "directory: "+path.join("\/")+" doesn't exist",
				arg: [],
				flag: 0,
				id: id
			}, socket);
		}

	break;
	//############################################################################################################################

	case "cat":
		sfile(gpath(dir, arg[0]), socket, id);

	break;
	//############################################################################################################################

	case "pwd":
		response.insert({
			data: response.req.dir
		});	response.send();

	break;
	//############################################################################################################################

	case "savedb":
		var sdbr = save("db.json", JSON.stringify(db));
		coms({
			data: sdbr,
			arg: [],
			flag: 0,
			id: id
		}, socket);

	break;
	//############################################################################################################################

	case "m":
		if(socket.udata.login!="guest")from = socket.udata.login;
		else from = socket.id.slice(0, 6);

		m = Tra.escape(arg[1])

		if((typeof(db.users[arg[0]])!="undefined")||(arg[0]=="guest")){ // check if 'user' exists
			loginids = gli(arg[0]); // get all connections logedin as 'user'

			if(loginids!=null){ // check if user is online

				emtoarr(loginids, "broadcast", {
					data: " <- "+"<txcya>"+from+": </txcya>"+m,
					imp: (arg.includes("important") ? true:false),
					frm: from
				}, socket)

				coms({
					// data: " -> "+arg[0]+": "+m,
					data: "",
					arg: "message",
					flag: 6,
					id: id
				}, socket);
			}else{	// 'user' is offline
				coms({
					data: "Message could not be sent, user "+arg[0]+" is offline",
					arg: "error",
					flag: 6,
					id: id
				}, socket);
			}
		}else{	// 'user' does not exist
			usid = getconn(arg[0]);

			if(usid!=null){ // check if 'user' exists as shortid
				io.to(usid.socketid).emit('broadcast', {
					data: " <- "+"<txcya>"+from+": </txcya>"+m,
					imp: (arg.includes("important") ? true:false),
					frm: from
				});
				coms({
					data: " -> "+arg[0]+": "+m,
					arg: "message",
					flag: 6,
					id: id
				}, socket);
			}else coms({ // 'user' is not shortid
				data: "Message could not be sent, user "+arg[0]+" doesn't exist",
				arg: "error",
				flag: 6,
				id: id
			}, socket);
		}

	break;
	//############################################################################################################################

	case "logs":
		cmd.get('ls logs',
			function(err, data, stderr){
				coms({
					data: data,
					arg: [],
					flag: 0,
					id: id
				}, socket);
			}
		);

	break;
	//############################################################################################################################
	// FIXME: chart
	case "chart":
		args = getarg(arg);

		if(!args.w) args.w = 400;

		// argf = arg.findIndex(function(element) {
		//   return element == "-f";
		// });
		// if(argf != -1){
		// 	var loc = "./logs/"+arg[argf+1];
		// }else var loc = './logs/node.log';

		argr = arg.findIndex(function(element) {
		  return element == "-r";
		});
		if(argr != -1){
			var slicea = arg[argr+1];
			var sliceb = arg[argr+2];
		}else{
			var slicea = -50;
			var sliceb = -1;
		}

		fs.readFile(loc, function (err, data){
			if (err) {
				coms({
					data: "File "+loc+" doesn't exist",
					arg: [],
					flag: 0
				}, socket);
			}else{
				sensordata = JSON.parse(data);

				senddata = {
					type: 'line',
					data : [],
					options: {
						extra: {
							width: wid
						},
						responsive: false,
						scales: {
							yAxes: [{
								ticks: {
									beginAtZero: true
								}
							}],
							xAxes: [{
								ticks: {
									display: false
				}}]}}}

				senddata.data = {
					labels: sensordata.time.slice(slicea, sliceb),
					datasets: [
						{
							label: 'Temp Out',
							data: sensordata.tempout.slice(slicea, sliceb),
							borderColor: 'rgba(100,130,255,0.8)',
							borderWidth: 1
						},
						{
							label: 'Hum Out',
							data: sensordata.humout.slice(slicea, sliceb),
							borderColor: 'rgba(170,170,255,0.8)',
							borderWidth: 1
						},
						{
							label: 'Temp In',
							data: sensordata.tempin.slice(slicea, sliceb),
							borderColor: 'rgba(20,140,0,0.8)',
							borderWidth: 1
						},
						{
							label: 'Hum In',
							data: sensordata.humin.slice(slicea, sliceb),
							borderColor: 'rgba(100,200,80,0.8)',
							borderWidth: 1
						},
						{
							label: 'CPU Load',
							data: sensordata.load.slice(slicea, sliceb),
							borderColor: 'rgba(180,50,0,0.8)',
							borderWidth: 1
						},
						{
							label: 'Memory Usage',
							data: sensordata.memory.slice(slicea, sliceb),
							borderColor: 'rgba(150,10,220,0.8)',
							borderWidth: 1
						}
					]
				},

				coms({
					data: senddata,
					arg: [],
					flag: 2
				}, socket);
			}
		});

	break;
	//############################################################################################################################
	// FIXME: lesser garbage
	case "help":
		if(typeof response.req.arg[0] != "undefined"){
			switch(response.req.arg[0]){
				default: l = ["Instructions for command "+arg[0]+" not found"];
				break;

				case "m":
					l = [
						"m: m |-user| message",
						"    Send private message to a user",
						"    Options:",
						"     -user        recipient username, or shortid",
						"",
						"    if user is not provided, local value of the last recipient is used.",
						"    user value must start with '-' to be recognized properly",
						"    for example: 'm -mathias hi'",
						"    or: 'm hi'",
						"    Without the '-' at the beginning, message is sent to the last recipient",
						"    Exit status:",
						"    Returns the message if it's sent correctly",
						"    Returns error promt is error occurs",
					];
				break
			}
		}else l = [
			"<txcya>|optional arg|</txcya>, <txgrn>[necessary arg]</txgrn>, 'description'",
			"Currently avaible commands:",
			"",
			"<txred>online</txred> 'displays list of currently online users'",
			"<txred>tree</txred> <txcya>|dir|</txcya> 'displays directory content'",
			"<txred>me</txred> 'displays your id'",
			"<txred>cd</txred> <txgrn>[dir]</txgrn>",
			"<txred>pwd</txred> 'get full current path'",
			"<txred>m</txred> <txcya>|-user|</txcya> message 'send message to user'",
			"<txred>chart 'displays sensor data chart'</txred>",
			"<txred>arduino</txred>",
			"<txred>hash</txred> <txgrn>[-gen|-check]</txgrn> <txgrn>[\"string\"]</txgrn> <txcya>|hash|</txcya>",
			"<txred>data</txred>",
			"<txred>uptime</txred> 'server stats'",
			"<txred>stats</txred> 'sensor stats'",
			"<txred>devices</txred> 'network devices list'",
			"<txred>welcome</txred> <txcya>|-p|</txcya> 'basic connection data'",
			"<txred>cat</txred> <txgrn>[file]</txgrn> 'displays file content'",
			"<txred>szkola</txred> 'deprecated, use tree /szkola'",
			"<txred>login</txred> <txgrn>[username]</txgrn> <txgrn>[password]</txgrn>",
			"<txred>logout</txred>",
			"<txred>silent</txred>",
			"<txred>broadcast</txred> <txgrn>[message]</txgrn>"
		];

		response.insert({
			data: multiLine(l)
		});	response.send();
	break;
	//############################################################################################################################
	// FIXME: lesser garbage
	case "arduino":
		coms({
			data: "arduino: command in development",
			arg: [],
			flag: 0,
			id: id
		}, socket);
	break;
	//############################################################################################################################

	case "hash":
		if(arg[0]=="-gen"){
			bcrypt.genSalt(10, function(err, salt) {
				bcrypt.hash(arg[1], salt, function(err, hash) {
					coms({
						data: hash,
						arg: [],
						flag: 0,
						id: id
					}, socket);
				});
			});
		}else if(arg[0]=="-check"){
			bcrypt.compare(arg[1], arg[2], function(err, r) {
				coms({
					data: r,
					arg: [],
					flag: 0,
					id: id
				}, socket);
			});
		}else coms({
			data: "hash: too few arguments",
			arg: [],
			flag: 0,
			id: id
		}, socket);

	break;
	//############################################################################################################################
	// TEMP: useless
	case "data":
		coms({
			data: "data: command in development",
			arg: [],
			flag: 0,
			id: id
		}, socket);
	break;
	//############################################################################################################################

	case "uptime":
		response.insert({
			data: [
				['<txred>Uptime:</txred>', '<span class="info0">'+info['uptime']+'</span>'],
				['<txred>Load average:</txred>', '<span class="info1">'+info['load1']+'</span>% <span class="info2">'+info['load2']+'</span>% <span class="info3">'+info['load3']+'</span>%'],
				['<txred>Memory:</txred>', '<span class="info4">'+info['memory']+'</span>%'],
				['<txred>In terminal:</txred>', '<span class="info5">'+info['users']+'</span>']
			],
			flag: 10 // toTable
		});	response.send();
	break;
	//############################################################################################################################

	case "stats":
		response.insert({
			//'[TIME] <txblu>'+new Date()+'</txblu>'+
			data: [
				["[TEMP]", '<txyel>OUTSIDE: </txyel><span class="info6">'+info['tempout']+'</span>C', '<txcya>INSIDE: </txcya><span class="info7">'+info['tempin']+'</span>C'],
				['[HUM]', '<txyel>OUTSIDE: </txyel><span class="info8">'+info['humout']+'</span>%', '<txcya>INSIDE: </txcya><span class="info9">'+info['humin']+'</span>%']
			],
			flag: 10 // toTable
			// data: <br></span>         <br></span>          <br></span>[BED]  '+(info['bed']?"occupied":"empty")
		});
		response.send();

	break;
	//############################################################################################################################

	case "devices":
		var l = "";
		for(var i = 0; i< info.network.length; i++){
			l +='<li><txcya>'+info.network[i]+'</txcya></li>'
		}
		l = '<ul class="ascii"><li><txred>Network</txred><ul class="info10">'+l+'<li><txblu>Raspberry</txblu><ul><li><txred>I2C</txred><ul></ul></li><li><txred>Serial</txred><ul></ul></li></ul></li></ul></li></ul>';
		response.insert({
			data: {Network: info.network},
			flag: 9 // toTree
		});	response.send();

	break;
	//############################################################################################################################
	// TODO: clean up this garbage
	case "connection":

		response.insert({
			data: [
				["<txcya>soc</txcya>.<txred>shortid</txred>", socket.udata.shortid],
				["<txcya>soc</txcya>.<txred>ip</txred>", socket.handshake.address.slice(7)],
				["<txcya>soc</txcya>.<txred>hostname</txred>", socket.handshake.headers.host],
				["<txcya>soc</txcya>.<txred>ssl</txred>", socket.handshake.secure],
				["<txcya>Last Login</txcya>", socket.udata.ll],
				["<txcya>Permission Group</txcya>", socket.udata.group]
			],

			// soc.shortid:      EAndxO
			// soc.ip:           192.168.1.10
			// soc.hostname:     rpi
			// soc.ssl:          false
			// Last login:       12/12/2018 17:54:23
			// Permission group: 0

			flag: 10 // toTable
			// 'Welcome <'+socket.udata.badge+'>'+socket.udata.login+'</'+socket.udata.badge+'>@<txgrn>'+config.hostname+'</txgrn>!<br><txred>soc</txred><txcya>.shortid:</txcya>      '+socket.id.slice(0, 6)+'<br><txred>soc</txred><txcya>.ip:</txcya>           '+socket.handshake.address.slice(7)+'<br><txred>soc</txred><txcya>.hostname:</txcya>     '+socket.handshake.headers.host+'<br><txred>soc</txred><txcya>.ssl:</txcya>          '+socket.handshake.secure+'<br><txcya>Last login:</txcya>       '+socket.udata.ll+'<br><txcya>Permission group:</txcya> '+socket.udata.group
		});	response.send();

	break;
	//############################################################################################################################

	case "szkola":
		coms({
			data: "Deprecated. Use 'tree /szkola'",
			arg: [],
			flag: 0,
			id: id
		}, socket);
	break;
	//############################################################################################################################

	case "register":

		if((arg.login == "") || (arg.pass == "")){
			coms({
				data: "register: too few arguments, (Fields login and password are required)",
				arg: "error",
				flag: 6,
				id: id
			}, socket);
			break;
		}

		if(!mailval(arg.mail)){
			coms({
				data: "register: e-mail address is invalid",
				arg: "error",
				flag: 6,
				id: id
			}, socket);
			break;
		}

		if(arg.pass.length < 8){
			coms({
				data: "register: password is too short (min 8 characters)",
				arg: "error",
				flag: 6,
				id: id
			}, socket);
			break;
		}

		if(arg.pass.length > 25){
			coms({
				data: "register: password is too long (max 25 characters)",
				arg: "error",
				flag: 6,
				id: id
			}, socket);
			break;
		}

		if(arg.login.length < 3){
			coms({
				data: "register: login is too short (min 3 characters)",
				arg: "error",
				flag: 6,
				id: id
			}, socket);
			break;
		}

		if(arg.login.length > 25){
			coms({
				data: "register: login is too long (max 25 characters)",
				arg: "error",
				flag: 6,
				id: id
			}, socket);
			break;
		}

		if(arg.login.name > 25){
			coms({
				data: "register: name is too long (max 25 characters)",
				arg: "error",
				flag: 6,
				id: id
			}, socket);
			break;
		}

		if(typeof db[arg.login] != "undefined"){
			coms({
				data: "register: username already exists",
				arg: "error",
				flag: 6,
				id: id
			}, socket);
			break;
		}

		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(arg.pass, salt, function(err, hash){
				user = new User(hash, arg.mail, arg.name);
				db.users[arg.login] = user;

				transporter.sendMail({
				  from: 'mathias.ddns.net',
				  to: arg.mail,
				  subject: 'E-mail address confirmation',
				  html: '<h1>Yes</h1>'
				}, function(error, info){
					if(error){
						console.log(error);
					}else{
						lui({
							action: "info",
							data: 'Email sent: ' + info.response
						});
					}
				});

				coms({
					data: "Registered succesfully. You can now login",
					arg: "ok",
					flag: 6,
					id: id
				}, socket);
			});
		});

	break;
	//############################################################################################################################

	case "login":



	break;
	//############################################################################################################################

	case "logout":

		if(socket.udata.login == "guest"){
			response.insert({
				data: "logout: you aren't logged in"
			}); response.send();
			break;
		}

		var l = {
			"user": "",
			"session": "",
			"expiry": ""
		}

		if(response.req.arg[0]=="-a"){
			db.users[response.req.arg[0]].hash = [];
		}

		lui({
			action: "logout",
			udata: socket.udata,
			id: socket.id,
			data: {
				c: response.req.com,
				arg: response.req.arg
			}
		});

		connections.remove(socket.udata);
		socket.udata = db.verify("", "", socket.handshake.address.slice(7), socket.id);
		connections.add(socket.udata);

		response.insert({
			data: l,
			flag: 1,
			udata: socket.udata,
		}); response.send();

	break;
	//############################################################################################################################

	case "broadcast":
		coms({
			data: "Broadcast message \'"+arg[0]+"\' sent",
			arg: [],
			flag: 0,
			id: id
		}, socket);

		socket.broadcast.emit('broadcast', {
			data: "<txpnk>### Broadcast: </txpnk>"+"<txcya>"+socket.udata.login+": </txcya>"+arg[0],
			imp: (arg.includes("important") ? true:false),
			frm: socket.udata.login
		});
	break;
	//############################################################################################################################

	//############################################################################################################################

}

			*/

		}
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

				db.commands[response.req.com].f(response)

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
		httpServer.listen(provess.env.PORT_MAIN, function (){
			Exe.log({
				action: "info",
				data: `Server listening on port ${provess.env.PORT_MAIN}`
			}, 1);
		});

		// https secure server
		httpsServer.listen(provess.env.PORT_SSL, function (){
			Exe.log({
  			  action: "info",
  			  data: `Server listening on port ${provess.env.PORT_SSL}`
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
