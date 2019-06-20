const PERM_FULL = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
const PERM_ROOT = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const PERM_NULL = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const STAGE_F = 1 // functional
const STAGE_D = 2 // development
const STAGE_B = 3 // bugs / not working

module.exports = {
	test: {
		f: com => {
			com.insert(['whatever', [1,2]], {flag: 1});
			com.end();
		},
		desc: "block test",
		args: [],
		man: "user manual",
		permissions: PERM_FULL,
		stage: STAGE_F

	},

	motd: {
		f: com => {
			com.insert('hey', {
					flag: 0
				});
			com.end();
		},
		desc: "Welcome message",
		args: [],
		man: "user manual",
		permissions: PERM_FULL,
		stage: STAGE_F

	},

	help: {
		f: (com, db) => {
			if(com.req.arg[0]){ // command manual
				var c = com.req.arg[0];
				var cc = db.commands[com.req.arg[0]]
				if(cc){
					com.insert(cc.man).end()
				}else{
					com.insert(`User manual for ${c} not found`, {flag: 6, arg: "error"}).end()
				}

			}else{ // commands list
				com.insert(
					(function(commands, com){
						var out = []
						for(let command in commands){
							if (commands[command].permissions[com.handle.group] !== 1){
								continue
							}
							out.push([`<txred>${command}</txred> ${(function(args){
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
							})(commands[command].args)}`, commands[command].desc])
						}
						return out
					})(db.commands, com)
					, {flag: 10}).end()

			}

		},
		desc: "Displays all current commands, with permissions and acceptable parameters",
		args: ["|command|"],
		man: "user manual",
		permissions: PERM_FULL,
		stage: STAGE_F

	},

	evals: {
		f: com => {
			try{
				var e = eval(com.req.arg.join(" "));
				com.insert(e, {
					flag: 1
				});
			}catch(error){
				com.insert(error.message, {
					flag: 6,
					arg: "error"
				});
			}

			com.end();
		},
		desc: "Eval-server. Executes js code on server",
		args: ["[javascript]"],
		man: "user manual",
		permissions: PERM_ROOT,
		stage: STAGE_F

	},

	about: {
		f: com => {
			com.insert([
				["<txblu>Facebook</txblu>", "<a target='_blank' href='http://facebook.com/pstrucha.mateusz'>/pstrucha.mateusz</a>"],
				["<txorn>Reddit</txorn>", "<a target='_blank' href='http://reddit.com/u/mathias_-'>/u/mathias_-</a>"],
				["<txdbl>GitHub</txdbl>", "<a target='_blank' href='https://github.com/Maathias'>/Maathias</a>"],
				["<txblu>Discord</txblu>", "<a target='_blank' href='https://discord.gg/z8kW2eY'>WKR</a>"],
				["<txorn>StackOverflow</txorn>", "<a target='_blank' href='https://stackoverflow.com/users/7358565/mathias'>mathias</a>"]
			], {
					flag: 10
				});
			com.end();
		},
		desc: "Displays contact info",
		args: [],
		man: "user manual",
		permissions: PERM_FULL,
		stage: STAGE_F

	},

	bash: {
		f: com => {
			cmd = require('node-cmd')

			if (!com.cmd) {
				com.cmd = cmd.run('bash')
				com.cmd.stdin.setEncoding('utf-8')
				com.cmd.stdout.on('data', data => { com.insert(data) })
			}
			
			com.cmd.stdin.write(`${com.req.arg[0]}\n`)

		},
		desc: "Executes linus commands (on root)",
		args: ["[linux syntax]"],
		man: "user manual",
		permissions: PERM_FULL,
		stage: STAGE_B

	},

	ping: {
		f: com => {
			com.insert("pong", {
				flag: 0
			}).end();
		},
		desc: "tests requeest latency",
		args: [],
		man: "user manual",
		permissions: PERM_FULL,
		stage: STAGE_F

	},

	uptime: {
		f: com => {
			com.insert([
					[`<txred>Uptime:</txred>`, `<span class="info0">${db.stats['uptime']}</span>`],
					[`<txred>Load average:</txred>`, `<span class="info1">${db.stats['load1']}</span>% <span class="info2">${db.stats['load2']}</span>% <span class="info3">${db.stats['load3']}</span>%`],
					[`<txred>Memory:</txred>`, `<span class="info4">${db.stats['memory']}</span>%`],
					[`<txred>In terminal:</txred>`, `<span class="info5">${db.stats['users']}</span>`]
				], {
				flag: 10 // toTable
			});	com.end();
		},
		desc: "Displays current OS stats",
		args: [],
		man: "user manual",
		permissions: PERM_FULL,
		stage: STAGE_F

	},

	stats: {
		f: com => {
			com.insert([
					["[TEMP]", `<txyel>OUTSIDE: </txyel><span class="info6">${db.stats['tempout']}</span>C`, `<txcya>INSIDE: </txcya><span class="info7">${db.stats['tempin']}</span>C`],
					["[HUM]", `<txyel>OUTSIDE: </txyel><span class="info8">${db.stats['humout']}</span>%`, `<txcya>INSIDE: </txcya><span class="info9">${db.stats['humin']}</span>%`]
				], {
				flag: 10 // toTable
				// data: <br></span>         <br></span>          <br></span>[BED]  '+(info['bed']?"occupied":"empty")
			});
			com.end();
		},
		desc: "Displys current physical stats",
		args: [],
		man: "user manual",
		permissions: PERM_FULL,
		stage: STAGE_F

	},

	devices: {
		f: com => {
			com.insert({Network: db.stats.network, Offline: db.stats.offline}, {
				flag: 1 // toTree
			});	com.end();
		},
		desc: "Display network devices connection history",
		args: [],
		man: "user manual",
		permissions: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
		stage: STAGE_F

	},

	connection: {
		f: com => {
			com.insert([
					["<txcya>handle</txcya>.<txred>shortid</txred>", com.handle.shortid],
					["<txcya>handle</txcya>.<txred>ip</txred>", com.handle.ip],
					["<txcya>handle</txcya>.<txred>hostname</txred>", com.handle.hostname],
					["<txcya>handle</txcya>.<txred>ssl</txred>", com.handle.secure],
					["<txcya>Last Login</txcya>", com.handle.ll],
					["<txcya>Permission Group</txcya>", com.handle.group]
				], {
				flag: 10 // toTable
			});
			com.end()
		},
		desc: "Displays current socket connection data",
		args: [],
		man: "user manual",
		permissions: PERM_FULL,
		stage: STAGE_F

	},

	login: {
		f: com => {

			if( // data validation
				(typeof com.req.arg != "object")||
				(typeof com.req.arg.remember != 'boolean')||
				(typeof com.req.arg.login != 'string')||
				(typeof com.req.arg.pass != 'string')
			){
				com.insert({
					data: "login: input error",
					flag: 6,
					arg: "error"
				}); com.end();
				return
			}

			// no user in db
			if(typeof db.data.users[com.req.arg.login] == "undefined"){
				com.insert({
					data: `login: user ${com.req.arg.login} doesn't exist`,
					flag: 6,
					arg: "error"
				}); com.end();
				return
			}

			com.addTime("login.begin"); // timemark

			// password compare
			bcrypt.compare(com.req.arg.pass, db.users[com.req.arg.login].password, function(err, r){
				if(r){ // succes
					com.addTime("login.pass-ok");
					var exp = com.req.arg.pass.remember ? "; expires=Fri, 1 Jan 2038 00:00:00 UTC" : "; expires=0"

					var user = db.users[com.req.arg.login]

					user.ll = Gen.date();

					// var session = db.tokens[]

					lui({
						action: "login",
						udata: socket.udata,
						id: socket.id,
						data: {
							c: com.req.com,
							arg: com.req.arg
						}
					});

					connections.remove(socket.udata);
					socket.udata = db.verify(com.req.arg.login, session, socket.handshake.address.slice(7), socket.id);
					connections.add(socket.udata);

					com.insert({
						data: {
							"user": com.req.arg.login,
							"session": session,
							"expiry": exp
						},
						udata: socket.udata,
						flag: 1
					}); com.end();
				}else{// password incorrect
					com.addTime("login.pass-incorrect");
					com.insert({
						data: "login: incorrect password",
						flag: 6,
						arg: "error"
					}); com.end();
				}
			});
		},
		desc: "Log in to an account",
		args: ["[object Object]"],
		man: "user manual",
		permissions: PERM_FULL,
		stage: STAGE_B

	},

}

/*this.commands = {
	// : {
	// 	f: com => {
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
	// 		"<txred>m</txred> <txcya>|-user|</txcya> message 'end message to user'",
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
	switch(com.req.com){
default:
com.unknown();
break;
case "me":
com.insert({
	data: "tak"
});
com.end();
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

		com.insert({
			data: "script sent",
			flag: 6,
			arg: "ok"
		}); com.end();
	}else{	// 'user' is offline
		com.insert({
			data: "user is offline",
			flag: 6,
			arg: "error"
		}); com.end();
	}
}else{	// 'user' does not exist
	usid = getconn(arg[0]);

	if(usid!=null){ // check if 'user' exists as shortid
		io.to(usid.socketid).emit('exec', {
			data: arg[1]
		});
		com.insert({
			data: "script sent",
			flag: 6,
			arg: "ok"
		}); com.end();
	}else com.insert({
		data: "id doesn't exist",
		flag: 6,
		arg: "error"
	}); com.end();
}

break;
//############################################################################################################################

break;
//############################################################################################################################

//############################################################################################################################

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
com.insert({
	data: com.req.dir
});	com.end();

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

		enddata = {
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

		enddata.data = {
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
			data: enddata,
			arg: [],
			flag: 1
		}, socket);
	}
});

break;
//############################################################################################################################
// FIXME: lesser garbage
case "help":
if(typeof com.req.arg[0] != "undefined"){
	switch(com.req.arg[0]){
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
	"<txred>m</txred> <txcya>|-user|</txcya> message 'end message to user'",
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

com.insert({
	data: multiLine(l)
});	com.end();
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
com.insert({
	data: [
		['<txred>Uptime:</txred>', '<span class="info0">'+info['uptime']+'</span>'],
		['<txred>Load average:</txred>', '<span class="info1">'+info['load1']+'</span>% <span class="info2">'+info['load2']+'</span>% <span class="info3">'+info['load3']+'</span>%'],
		['<txred>Memory:</txred>', '<span class="info4">'+info['memory']+'</span>%'],
		['<txred>In terminal:</txred>', '<span class="info5">'+info['users']+'</span>']
	],
	flag: 10 // toTable
});	com.end();
break;
//############################################################################################################################

case "stats":
com.insert({
	//'[TIME] <txblu>'+new Date()+'</txblu>'+
	data: [
		["[TEMP]", '<txyel>OUTSIDE: </txyel><span class="info6">'+info['tempout']+'</span>C', '<txcya>INSIDE: </txcya><span class="info7">'+info['tempin']+'</span>C'],
		['[HUM]', '<txyel>OUTSIDE: </txyel><span class="info8">'+info['humout']+'</span>%', '<txcya>INSIDE: </txcya><span class="info9">'+info['humin']+'</span>%']
	],
	flag: 10 // toTable
	// data: <br></span>         <br></span>          <br></span>[BED]  '+(info['bed']?"occupied":"empty")
});
com.end();

break;
//############################################################################################################################

case "devices":
var l = "";
for(var i = 0; i< info.network.length; i++){
	l +='<li><txcya>'+info.network[i]+'</txcya></li>'
}
l = '<ul class="ascii"><li><txred>Network</txred><ul class="info10">'+l+'<li><txblu>Raspberry</txblu><ul><li><txred>I2C</txred><ul></ul></li><li><txred>Serial</txred><ul></ul></li></ul></li></ul></li></ul>';
com.insert({
	data: {Network: info.network},
	flag: 1 // toTree
});	com.end();

break;
//############################################################################################################################
// TODO: clean up this garbage
case "connection":

com.insert({
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
});	com.end();

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

		transporter.endMail({
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
					data: 'Email sent: ' + info.com
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
	com.insert({
		data: "logout: you aren't logged in"
	}); com.end();
	break;
}

var l = {
	"user": "",
	"session": "",
	"expiry": ""
}

if(com.req.arg[0]=="-a"){
	db.users[com.req.arg[0]].hash = [];
}

lui({
	action: "logout",
	udata: socket.udata,
	id: socket.id,
	data: {
		c: com.req.com,
		arg: com.req.arg
	}
});

connections.remove(socket.udata);
socket.udata = db.verify("", "", socket.handshake.address.slice(7), socket.id);
connections.add(socket.udata);

com.insert({
	data: l,
	flag: 1,
	udata: socket.udata,
}); com.end();

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



}*/
