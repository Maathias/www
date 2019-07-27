function isDefined(...d) {
	/**
	 * Check if argument is defined
	 * @param {...mixed} d any variable
	 * 
	 * @returns {mixed} first given variable not of type 'undefined'
	 */

	for (let key in d) {
		if (typeof d[key] != "undefined")
			return d[key]
	}
	return undefined
}

function isNotEmpty(...d) {
	/**
	 * Check if argument is not an empty string
	 * @param {...string} d any string
	 * 
	 * @returns {string} first given string that is not empty
	 */

	if (typeof v == "")
		return d
	else
		return v
}

function isWhat(what) {
	/**
	 * Get short description of a variable
	 * @param {mixed} what
	 * 
	 * @returns {string} [type Name|Type]
	 */

	if (what)
		if (what.name)
			if (what.name != "")
				return "[function " + what.name + "]"

	return "[" + typeof what + " " + (what ? what.constructor.name : "Undefined") + "]";
}

function getStackTrace() {
	/**
	 * Get current call stack trace
	 * 
	 * @returns {array} list of caller names
	 */

	var obj = {}; // create stack trace object

	try {
		Error.captureStackTrace(obj, getStackTrace); // capture stack to obj
	} catch (error) {
		return error // on error return
	}

	obj = obj.stack.split("\n").slice(1); // split on newline, remove first element
	for (let trace in obj) {
		obj[trace] = obj[trace].slice(4); // remove whitespace at the beginning
	}

	return obj

}

function makeID(n) {
	/**
	 * Generate base64 id
	 * @param {int} n output length
	 * 
	 * @returns {string} generated base64 string identificator
	 */

	var out = "";
	var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

	for (var i = 0; i < n; i++)
		out += chars.charAt(Math.floor(Math.random() * chars.length));

	return out;
}

function date(format) {
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
			out = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + " " + d.getHours() + ":" + m + ":" + s
			break;
		case 'log':
			let p = new Date().toString().replace(/[A-Z]{3}\+/, '+').split(/ /)
			out = p[2] + '/' + p[1] + ' ' + p[4]
			break;
		case 'tiny':
			out = `${h}:${m}:${s}.${ms}`
			break;
	}

	return out
}

function timestamp() {
	return $('<txxblk></txxblk>')
		.addClass('timestamp')
		.append(date('tiny') + ' ')
}

function newScript(url) {
	return new Promise((resolve, reject) => {
		var script = document.createElement('script');
		script.onload = function () {
			resolve()
		};
		script.onerror = function (message) {
			reject(message)
		};
		script.src = url;
		document.head.appendChild(script); //or something of the likes
	})

}

function requiresStyle(url) {
	return new Promise((resolve, reject) => {
		// console.log($(`link[href='${url}']`).length == 1)
		if ($(`link[href='${url}']`).length == 1) return
		var link = document.createElement('link');
		link.onload = function () {
			resolve()
		};
		link.href = url;
		link.rel = 'stylesheet';
		document.head.appendChild(link); //or something of the likes
	})

}

function toKB(bytes) {
	let precision = 1e4
	return Math.floor((bytes / 1000)*precision)/precision
}

class Storage {
	static get Local() {
		return {
			get(key) {
				return JSON.parse(localStorage.getItem(key))
			},
			set(key, value) {
				value = JSON.stringify(value)
				localStorage.setItem(key, value)
				return value
			}
		}
	}
	static get Session() {
		return {
			get(key) {
				return JSON.parse(sessionStorage.getItem(key))
			},
			set(key, value) {
				value = JSON.stringify(value)
				sessionStorage.setItem(key, value)
				return value
			}
		}
	}
	static get Cookie() {
		return {
			get(key) {
				var name = key + "=";
				var decodedCookie = decodeURIComponent(document.cookie);
				var ca = decodedCookie.split(';');
				for (var i = 0; i < ca.length; i++) {
					var c = ca[i];
					while (c.charAt(0) == ' ') {
						c = c.substring(1);
					}
					if (c.indexOf(name) == 0) {
						return c.substring(name.length, c.length);
					}
				}
				return undefined;
			},
			set(key, value, exdays) {
				var d = new Date();
				d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
				var expires = "expires=" + d.toUTCString();
				document.cookie = key + "=" + value + ";" + expires + ";path=/";
			}
		}
	}
}

class Waiter {
	constructor(list, f) {
		this.list = {}
		this.callback = f
		for (let n of list) {
			this.list[n] = false
		}
	}

	update(name) {
		this.list[name] = true
		for (let el in this.list) {
			if (this.list[el] == false)
				return false
		}
		this.callback()
	}
}

class Com {
	constructor(data, con) {
		this.con = con; // parent Con object
		this.id = makeID(5); // base64 ID

		this.raw = data.raw; // raw command string
		this.c = data.c; // command name
		this.arg = data.arg; // command arguments
		// this.dir = con.elements.$commpath.html(); // Con working directory (string)

		this.$elem = undefined; // Com element
		this.$ud = undefined; // Com UserData
		this.$sr = undefined // server response
		this.formatted = undefined; // formatted server response data (mixed)
		// this.stack = getStackTrace(); // current stack trace (array)

		this.timer = undefined;
		this.time = performance.now();

		this.res = undefined; // data output

		this.blocks = []

		this.__proto__.log = this.con.log
		this.__proto__.prompt = this.con.prompt

		// con.onload = function(){
		this._init()
		// }
		// this._append()
		// this._init()
		// if (!this._init())
		// this._send()
	}

	_append() {
		this.$elem = $("<div></div>")
			.prop("id", this.id)
			.addClass("command")
			.append(
				timestamp(),
				this.$ud = $("<span></span>")
					.addClass("ud")
					.append(
						$("<span></span>")
							.addClass(this.con.udata.badge)
							.append(this.con.udata.login)
					)
					.append("@")
					.append(
						$("<txgrn></txgrn>")
							.append(document.title)
					)
					.append(":")
					.append(
						$("<txblu></txblu>")
							.append(this.con.elements.$commpath.html())
					)
					.append(" $ ")
					.append(
						$("<span></span>")
							.append(this.raw)
					)
			)
			.append(
				this.$sr = $("<div></div>")
					.addClass("sr")
			)
			.data("com", this);

		this.con.elements.$commands.append(this.$elem);

	}

	_init() {

		this._append()
		this._startLoading()

		if (this.con.Functions[this.c]) { // offline command is available
			this.con.Functions[this.c](this)
		} else { // send command to server
			this.log("Local command not found", 'warning', 2)
			if (this.con.Socket) { // check for module
				if (this.con.Socket.connected) { // check for connection
					this.con.Socket.comSend(this)
				} else {
					this.log("Server disconnected", 'error')
					this._end()
				}
			} else {
				this.log("Socket module not available", 'error')
				this._end()
			}
		}

		return

		switch (this.c) {
			default:
				if (this.con.Socket.connected != true) {
					this.log("socket disconnected", "error");
					this.insertResponse();
					return 1;
				}

				switch (this.c) {
					default: return 0;
						break;
					case "welcome":
						this.formatted = "";
						this.insertResponse();
						break;

					case "login":
						this.addForm({
							label: ["Login", "Password", "Remember me"],
							type: ["text", "password", "checkbox"],
							name: ["login", "pass", "remember"]
						}, "login");
						break;

					case "register":
						this.addform({
							label: ["Login", "E-mail", "Full Name", "Password"],
							type: ["text", "email", "text", "password"],
							name: ["login", "mail", "name", "pass"]
						}, "register");
						break;
				}
				break;

			case "exit":
				window.close();
				break;

			case "json":
				switch (this.arg[0]) {
					default:
						this.formatted = `length: ${jsond.length}`;
						this.insertResponse();
						break;

					case "load":
						this.con.elements.$jsonl.click();
						this.insertResponse();
						break;

					case "messenger":
						switch (this.arg[1]) {
							default:
								this.formatted = mesparse(this.con.jsond, this.arg[1], this.con);
								this.insertResponse();
								break;
							case "all":
								this.formatted = mesall(this.con.jsond, this.arg[2], this.con);
								this.insertResponse();
								break;
						}

						break;

					case "tree":
						this.formatted = toTree(jsond);
						this.insertResponse();
						break;
				}
				break;



			// case "setstyle":
			// 	setstyle(arg[0]);
			// 	break;

		}

	}

	async update(res) {
		if (res.end) {
			this._end()
			return
		}

		this.log(`#${res.res.id} received block`, "info", 3);
		this.blocks[res.meta.n] = res
		this._timeout(true)

		this._addBlock(this._block(await this.unpack(res), res.meta.n))
		// this.con.scrollBottom(false); // scroll to end of page (non-force)
	}

	async unpack(res) {
		switch (res.meta.flag) {
			default:
			case 0: // plaintext
				return res.data
			case 1: // Tree
				await this.con._requires('Tree')
				return new this.con.Classes.Tree(res.data).$
			case 6: // log response
				this.log(res.data.data, res.meta.arg);
				break;

			case 9: // toTree
			// return toTree(res.data);

			case 10: // toTable
			// return toTable(res.data);
		}
	}

	_block(data, n) {
		return $(`<div data-n="${n}"</div>`)
			.append(data)
			.append(timestamp())
	}

	_addBlock(block) {
		var children = this.$sr.find('[data-n]'),
			len = children.length
		if ((len > 0) && (parseInt(block.attr('data-n')) != -1)) {
			for (let child of children) {
				if (parseInt($(child).attr('data-n')) > block.attr('data-n')) {
					$(child).before(block)
					return
				}
			}
			this.$sr.append(block)
		} else {
			this.$sr.append(block)
		}
	}

	_end() {
		this._stopLoading()
	}

	_timeout(ok) {

		if (ok) { // server responded
			if (this.timer) clearTimeout(this.timer); // clear timer
			this.time = performance.now() - this.time; // calculate response time
		} else { // server timed-out
			this.log("Server timeout", "error"); // add error message
			this.res = null;
			this.insertResponse();
		}

	}

	insert(out) {
		this._addBlock(this._block(out, -1));
		// this._stopLoading(); // stop loading animation

		// if (this.res === null) return; // if response is null (server timed out) stop

		// this._timeout(true); // server responded ok


		// .hide()



		// this.sr.slideDown(200); // animate response div
		// this.con.scrollBottom(false); // scroll to end of page (non-force)

	}

	remove() {
		this.$elem.remove();
	}

	_stopLoading() {
		this.$ud.attr("loading", null);
	}

	_startLoading() {
		this.$ud.attr("loading", " ");
		this.time = performance.now()
	}

	// addForm(obj, type) {
	// 	this.con.scrollBottom(); // scroll to EOP
	// 	this.con.elements.$commline.disable(); // disable commline

	// 	var form = $("<form></form>") // create form Node

	// 	for (let key in obj.label) { // for every label add label Node
	// 		form.append(
	// 			$("<label></label>")
	// 				.append(`${obj.label[key]}: `)
	// 				.append(
	// 					$("<input>")
	// 						.prop("type", obj.type[key])
	// 						.prop("name", obj.name[key])
	// 				)
	// 				.append("<br>")
	// 		)
	// 	}

	// 	this.$elem.append(form); // add form to Com elem
	// 	this.$elem.find("input")[0].focus(); // focus on first form input

	// }

	// sendForm() {

	// 	var form = this.$elem.find("form"); // find Com form
	// 	var obj = {}; // create response object

	// 	this.removeForm(); // disable form

	// 	form.children("label").each(function (index) {
	// 		// add each input value to response object with property name from input name
	// 		obj[$(this).children("input").prop('name')] = $(this).children("input").val() != "on" ? $(this).children("input").val() : $(this).children("input").is(":checked");
	// 	});

	// 	this.arg = obj; // set Com arguments as response object
	// 	this._send(); // send Com

	// }

	// removeForm() {

	// 	this.$elem.find("form").children("label").each(function (index) { // form label of Com
	// 		$(this).children("input").prop('readonly', true); // set each input to 'readonly'
	// 	});

	// 	this.con.elements.$commline.enable(); // enable commline

	// }
}

class Con {

	constructor($wind) {

		this.id = makeID(6) // Con ID
		this.elements = {}
		this.con = this

		this.elements.$wind = $("<div></div>")
			.addClass("wind")
			.append(
				this.elements.$commands = $("<div></div>")
					.addClass("commands")
			)
			.append(
				this.elements.$commline = $("<div></div>")
					.addClass("commline")
					.append(
						this.elements.$ud = $("<span></span>")
							.addClass("ud")
							.append(
								this.elements.$commuser = $("<span></span>")
									.addClass('comuser')
									.append(
										$("<txcya></txcya>")
											.append('guest')
									)
							)
							.append("@")
							.append(
								$("<txgrn></txgrn>")
									.append(document.title)
							)
							.append(":")
							.append(
								this.elements.$commpath = $("<txblu></txblu>")
									.addClass("commpath")
									.append("~")
							)
							.append(" $ ")

					)
					.append(
						this.elements.$commin = $("<input>")
							.addClass("commin")
							.prop("autocomplete", "off")
							.prop("autocorrect", "off")
							.prop("autocapitalize", "off")
							.prop("spellcheck", false)
							.prop("autofocus", true)
					)
			)

		$('body').append(this.elements.$wind)

		// commands input history
		this.history = {

			counter: 0,
			commands: [""],

			push(com) {
				this.commands.splice(1, 0, com)
				this.counter = 0
				Storage.Session.set('history', this.commands)
				return this
			},

			increment() {
				// this.counter++
				if (this.counter < this.commands.length - 1) this.counter++

				return this
			},

			decrement() {
				// this.counter--
				if (this.counter > 0) this.counter--

				return this
			},

			current() {
				return this.commands[this.counter]
			},

			get up() {
				this.increment()
				return this.commands[this.counter]
			},

			get down() {
				this.decrement()
				return this.commands[this.counter]
			}

		}

		// module managment
		this.modules = {
			all: {},
			_new(name) {
				this.all[name] = {
					state: 'uninstalled',
					type: undefined,

					callbacks: []
				}
			},
			update(name, data) {
				if (!this.all[name]) this._new(name)

				this.all[name] = { ...this.all[name], ...data }
				if (data.state) {
					for (let callback of this.all[name].callbacks) {
						if (this.all[name].state == callback.state) {
							callback.resolve(this.info(name))
						}
					}
				}


			},
			info(name) {
				if (!this.all[name]) this._new(name)
				return {
					state: this.all[name].state,
					type: this.all[name].type,
					state: this.all[name].state,
				}
			},
			callback(name, state) {
				return new Promise((resolve, reject) => {
					if (!this.all[name]) this._new(name)
					if (state == this.all[name].state) {
						resolve(this.info(name))
						return
					}
					this.all[name].callbacks.push({ state, resolve, reject })
				})
			}
		}

		this.settings = {
			list: (function(){
				let defaults = {
					logModuleNames: false,
					verbose: 5
				}

				return defaults = { ...defaults, ...Storage.Local.get('settings') || {}}
				
			})(),
			update: function(obj){
				for(let setting in obj) this.set(setting, obj[setting])
			},
			get: function(key){
				if(key === undefined) return this.list
				return this.list[key]
			},
			set: function(key, value){
				this.list[key] = value
				Storage.Local.set('settings', this.list)
				return value
			}
		}

		this.Functions = {};
		this.Classes = {};

		this.coms = []; // executed Coms list
		this.scroll = true; // block scrollBottom flag
		this.timeout = 16000 // Com response waiting time [ms]
		this.first = false
		// this.verbose = 2; // log display level

		// credentials
		this.credentials = Storage.Local.get('credentials')
		this.udata = Storage.Local.get('udata') || {
			badge: 'txcya',
			login: 'guest',
			group: 9,
			lastLogin: 'n/a',
			shortid: undefined
		}

		this.keymap = {
			'2l': () => this.clear(),
			'0Escape': () => con.elements.$commin.val(""),
			'0ArrowUp': () => con.commandHistory(true),
			'0ArrowDown': () => con.commandHistory(false),
			'0Enter': () => con.commandlineParse()
		}

		this.elements.$commline.ready(() => {
			this._ready()
		});

	}

	hijack() {
		return new Promise((resolve, reject) => {
			this.hijacked = [resolve, reject]
		})
	}

	getCom(id) {

		for (let key in this.coms) {
			if (this.coms[key].id == id) return this.coms[key];
		}

		this.log(`Com #${id} not found`, "error", 2);
		return undefined

	}

	get lastCom() {
		return this.coms[con.coms.length - 1]
	}

	clear() {

		for (let com of this.coms) {
			this.log(`Removing Com #${com.id}`, "info", 2);
			com.remove();
		}
		this.log(`Clearing commands div`, "info", 2);
		this.elements.$commands.empty();

	}

	log(data, opt, lvl) {
		var source = getStackTrace().toString().match(/packages\/([A-Z]\S+)\.js/)
		source = source != null ? source[1] : 'main'

		var lvl = isDefined(lvl, 1);

		if (lvl > this.con.settings.get('verbose')) return

		var opt = isDefined(opt, "");

		switch (opt) {
			default:
			case 'info': opt = ['blu', 'Info']; break;
			case 'warning': opt = ['yel', 'Warning']; break;
			case 'error': opt = ['red', 'Error']; break;
			case 'ok': opt = ['grn', 'OK']; break;
			case 'prompt': opt = ['cya', '?']; break;
			case 'server': opt = ['red', 'Server']; break;
			case 'blank': break;
		}

		
		var out = opt == 'blank' ? $("<div></div>")
			.addClass('inline')
			.append(data)	
			:
			$("<div></div>")
			.addClass('inline')
			.append(
				timestamp(),
				$('<tx></tx>')
					.addClass(`tx${opt[0]}`)
					.append((this.con.settings.get('logModuleName')?`${source} `:'') + "#".repeat(lvl))
					.append(` ${opt[1]}: `)
			)
			.append(data)

		if (this instanceof Con) {
			var lastlog = this.elements.$commands.children().last();
			if (lastlog.text() == out.text()) {
				let tx = lastlog.children('tx')

				if (!lastlog.hasClass('duplicate')) lastlog.addClass('duplicate')

				let d = isDefined(tx.attr('data-duplicate'), 1)
				d = parseInt(d)
				d += 1
				d = d.toString()

				lastlog.children('tx').attr('data-duplicate', `${d}`)

				return
			}
			this.elements.$commands.append(out);
			this.scrollBottom(false)
		} else if (this instanceof Com) {
			this.$elem.append(out)
		}

		return out

	}

	prompt(prompt, type) {
		return new Promise((resolve, reject) => {
			var types = {
				'yn': 'y\\n',
				'number': 'number'
			}
			
			this.log(prompt + ` [${types[type] || '-'}]`, 'prompt')
			this.hijack()
				.then(out => {
					switch(type){
						default: resolve(out); break;
						case 'yn':
							switch(out){
								case 'y': case 'Y': case 'yes': case 'Yes':
									resolve(true); break;
								case 'n': case 'N': case 'no': case 'No':
									resolve(false); break;
								default: reject(out); break;
							}
					}
				})
		})
	}

	commandlineParse(override) { // command send event

		if (this.elements.$commin.is(":hidden")) return;	// if commandline is blocked (hidden), stop executing

		var raw = this.elements.$commin.val();	// get raw input
		this.elements.$commin.val("");	// clear commandline input

		if (this.hijacked) {
			this.hijacked[0](raw)
			delete this.hijacked
			return
		}

		if (override) raw = override

		if (raw == "") return;

		this.history.push(raw)

		if (raw.indexOf(' ') > -1) {	// sperate arguments
			var arg = raw.split(" "),	// split to array
				c = arg.shift();	// get command only
		} else { // no arguments given
			var arg = [],
				c = raw.toLowerCase()
		}

		this.coms.push(new Com({
			raw: raw,
			c: c,
			arg: arg
		}, this))

	}

	getScroll() { // get scroll distance to bottom

		var s = this.elements.$wind.scrollTop() - (this.elements.$wind.prop('scrollHeight') - this.elements.$wind.outerHeight());
		if (s >= 0) s = 0;
		else s = s * -1;
		return s
	}

	scrollBottom(f) { // scroll to the bottom

		// let force = isDefined(f, false);
		// if (force) return;

		// let a = this.elements.$commands.children();
		// let b = this.elements.$commands.children().children();

		// var to = 0;
		// for (let index of a)
		// 	to += index.scrollHeight
		// for (let index of b)
		// 	to += index.scrollHeight

		// this.elements.$commands.stop().animate({ scrollTop: to }, 200, 'swing', function () { });

	}

	updateInputWidth() {
		var w = this.elements.$ud.width() + 20;
		this.elements.$commin.css({ 'width': `calc(100% - ${w}px)` });
		return w;
	}

	commandHistory(key) {
		this.elements.$commin.val(key ? this.history.up : this.history.down);
		this.elements.$commin.focus();
	}

	_getPackage(name) {
		return new Promise((resolve, reject) => {
			this.modules.update(name, { state: 'downloading' })
			this.log(`Requesting ${name} module`, 'info')
			import(`./packages/${name}.js`)
				.then(mod => {
					var done = () => {
						switch (mod.type) {
							case 'sub':
								try {
									this[name] = new mod.default(this)
								} catch (err) {
									this.log(`Module ${name} installation failed: ${err}`, 'error')
									reject()
									return
								}
								break;
							case 'class':
								this.Classes[name] = mod.default
								break;
							case 'command':
								for (let f in mod.default) {
									this.Functions[f] = mod.default[f]
								}
								break;
						}
						if (mod.commands) {
							for (let f in mod.commands) {
								this.Functions[f] = mod.commands[f]
							}
						}
						this.modules.update(name, { state: 'installed' })
						this.log(`Downloaded ${name} module`, 'ok')
						resolve()
					}
					this.modules.update(name, { state: 'installing', type: mod.type })
					if (mod.requires) {
						var list = []
						for (let what in mod.requires) {
							list = list.concat(mod.requires[what])
						}
						let waiter = new Waiter(list, () => {
							done()
						})

						if (mod.requires.styles) {
							for (let style of mod.requires.styles) {
								requiresStyle(style)
									.then(() => {
										waiter.update(style)
									})
							}
						}
						if (mod.requires.scripts) {
							for (let script of mod.requires.scripts) {
								newScript(script)
									.then(() => {
										waiter.update(script)
									})
							}
						}
						if (mod.requires.modules) {
							for (let m of mod.requires.modules) {
								this._requires(m)
									.then(() => {
										waiter.update(m)
									})
							}
						}
					} else done()
				})
				.catch(err => {
					this.modules.update(name, { state: 'failed' })
					this.log(`Downloading ${name} module failed: ${err}`, 'error')
					reject()
				})
		});
	}

	_getMultiPackage(...names) {
		return new Promise((resolve, reject) => {
			var waiter = new Waiter(names, () => {
				resolve()
			})
			for (let name of names) {
				this._getPackage(name)
					.then(() => {
						waiter.update(name)
					})
			}
		})
	}

	_update(name) {
		return new Promise((resolve, reject) => {
			var info = this.modules.info(name)
			if (info.state == 'installed') {
				if (info.type == 'sub') {
					this.log(`Destructuring ${name} module`, 'warning')
					this[name].destructor()
					delete this[name]
				}
				this._getPackage(name)
					.then(() => resolve())
					.catch(() => reject())
			} else {
				this.log(`Module ${name} is not installed`, 'error')
				reject()
			}
		})
	}

	_requires(name) {
		var mod = this.modules.info(name)
		switch (mod.state) {
			case 'installed': return new Promise((resolve, reject) => {
				resolve(mod)
			})
			case 'downloading':
			case 'installing': return this.modules.callback(name, 'installed')
			case 'uninstalled': return this._getPackage(name)
		}
	}

	_optional(name) {
		return new Promise((resolve, reject) => {
			this.prompt(`There is an optional module: ${name}, do you want to download it?`, 'yn')
				.then(out => {
					if(out){
						this._requires(name)
							.then(() => {
								resolve()
							})
					} else {
						reject()
					}
				})
		})

	}

	_ready() {
		$(this.elements.$wind).prop("id", this.id)
		$(this.elements.$wind).data("con", this) // attach Con object to DOM

		$(document).on('keydown', e => {
			var val = (e.altKey) * 1
				+ (e.ctrlKey) * 2
				+ (e.metaKey) * 3
				+ (e.shiftKey) * 4
				+ e.key

			if (this.keymap[val]) {
				this.keymap[val]()
				e.preventDefault()
			}
		})

		// // focus on input on 'enter'
		// this.elements.$wind.on("keydown", function (e) {
		// 	var con = $(this).data("con");

		// 	switch (e.which) {
		// 		// ENTER key
		// 		case 13: con.elements.$commin.focus(); // focus on input
		// 			break;
		// 	}

		// })

		// // form key handling
		// this.elements.$commands.on("keydown", "form", function (e) {
		// 	var com = $(this).closest(".command").data("com");

		// 	switch (e.which) {
		// 		case 13: com.sendForm(); // send form [enter]
		// 			break;

		// 		case 27: com.removeForm(); // remove form [escape]
		// 			break;
		// 	}
		// });

		// window.addEventListener('popstate', ()=>{
		// 	this.commandlineParse(location.hash.slice(1))
		// });

		// // link click handling
		// this.elements.$wind.on("click", "a", function (e) {
		// 	var a = $(this);
		// 	var href = a.prop("href");
		// 	href = href.slice(href.indexOf("#"));

		// 	if (href.startsWith("#")) {
		// 		e.preventDefault();
		// 		a.closest(".wind").data("con").executeCom(decodeURIComponent(href.slice(1)))
		// 	}
		// })

		// // 'accept cookies' prompt
		// if (Storage.Cookie.get('cookies') == undefined) {
		// 	Storage.Cookie.set('cookies', '1');
		// 	this.log("This site uses cookies. By continuing, you agree to our use of cookies. <a target = '_blank' href='http://wikipedia.org/wiki/HTTP_cookie'>Learn more</a>", 'warning')
		// }

		// update input width // TODO: get this working in pure css
		this.updateInputWidth();

		this.history.commands = Storage.Session.get('history') || [""]

		this.log("Console ready", 'ok')

		var extra = this.settings.get('bootPackages') ? this.settings.get('bootPackages') : []

		this._getMultiPackage(...['Socket', 'Core'], ...extra)
			.then(() => {
				this.Socket.init()
			})

		// if(this.settings.bootPackages){
		// 	this._getMultiPackage(...this.settings.bootPackages)
		// }

	}

}

var Config = {
	// notif: new Audio('res/unsure.mp3'), // notification sound object
	cons: [], // cons list
	serviceWorker: false // enable serviceWorker
}

$(document).ready(function () {
	$("noscript").remove(); // remove 'js disabled' notice

	// Config.notif.volume = 0.3
	Config.cons.push(new Con())
	con = Config.cons[0]

	if ('serviceWorker' in navigator && Config.serviceWorker) { // check is serviceWorker is available
		navigator.serviceWorker
			.register('service-worker.js')
			.then(reg => console.log('sw registered'))
			.catch(error => console.log(`sw error: ${error}`))
	}

	setInterval(function () { // loading animation
		function bar(bar) {
			var max = 10,
				a = '#',
				b = ' '

			if (typeof bar == 'string') {
				bar = bar.split(a).length - 1
				var percent = (bar / max) * 100
				return percent
			}
			if (typeof bar == 'number') {
				bar = Math.floor((bar * max) / 100)
				return `[${a.repeat(bar)}${b.repeat(Math.abs(bar - max))}]`
			}
		}
		if ($(".ud").length) $(".ud").each(function (index) { // for every Com
			var c = $(this),
				s = c.attr('loading'),
				b = bar(s)

			if (typeof s == "undefined") return; // return if Com is not loading

			if (b >= 100) c.attr('loading', bar(0))
			else c.attr('loading', bar(b + 10))

		});

	}, 250);

});
