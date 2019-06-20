// function escapeh(unsafe) {
// 	if (typeof unsafe != "string") return unsafe;
// 	return unsafe
// 		.replace(/&/g, "&amp;")
// 		.replace(/</g, "&lt;")
// 		.replace(/>/g, "&gt;")
// 		.replace(/"/g, "&quot;")
// 		.replace(/'/g, "&#039;")
// }

// function argq(arg){
// 	var v = 0;
// 	var g = [];
// 	for (var ar in arg) {
// 		if((arg[ar].startsWith("\"")) || (arg[ar].startsWith("\'"))){
// 			v=1;
// 			// g.push(arg[ar].slice(1));
// 			if((arg[ar].endsWith("\"")) || (arg[ar].endsWith("\'"))){
// 				g.push(arg[ar].slice(1, arg[ar].length-1));
// 				v=0;
// 			}
// 			else
// 				g.push(arg[ar].slice(1));

// 			continue;
// 		};
// 		if((arg[ar].endsWith("\"")) || (arg[ar].endsWith("\'"))){
// 			v=0;
// 			g[g.length-1] += " "+arg[ar].slice(0, arg[ar].length-1);
// 			// g[g.length-1] = g[g.length-1].slice(1, g[g.length-1].length-1);
// 			continue;
// 		};

// 		if(!v){
// 			g.push(arg[ar]);
// 		}else{
// 			g[g.length-1] += " "+arg[ar]
// 		}
// 	}
// 	return g
// }

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

function download(content, filename) {
	/**
	 * Download variable as file
	 * @param {mixed} content any variable
	 * @param {string} filename name of downloaded file
	 * 
	 * @returns {undefined}
	 */

	var createObjectURL = (window.URL || window.webkitURL || {}).createObjectURL || function () { };
	var blob = null;
	var mimeString = "application/octet-stream";
	window.BlobBuilder = window.BlobBuilder ||
		window.WebKitBlobBuilder ||
		window.MozBlobBuilder ||
		window.MSBlobBuilder;


	if (window.BlobBuilder) {
		var bb = new BlobBuilder();
		bb.append(content);
		blob = bb.getBlob(mimeString);
	} else {
		blob = new Blob([content], { type: mimeString });
	}
	var url = createObjectURL(blob);
	var a = document.createElement("a");
	a.href = url
	a.download = filename;
	a.innerHTML = "";
	document.body.appendChild(a);
	a.click()
	a.remove()
}

// function toTree(obj, mdepth) {
// 	/**
// 	 * Creates tree visualization of variable
// 	 * @param {any} obj variable to visualize
// 	 * @param {number} mdepth max visualization depth
// 	 * 
// 	 * @returns {H} html visualization 
// 	 */

// 	var typeOf = function (o) {
// 		var t = typeof o;

// 		if (o instanceof Array) return "array";
// 		if (o instanceof RegExp) return "regex";
// 		if (o === null) return "null";

// 		return t
// 	}

// 	var contentType = function (v, name) {

// 		var type = typeOf(v)

// 		switch (type) {

// 			case 'number': return $("<txred></txred>").append(name ? name : "number")
// 			case 'string': return $("<txgrn></txgrn>").append(name ? name : "string")
// 			case 'boolean': return $("<txorn></txorn>").append(name ? name : "boolean")
// 			case 'function': return $("<txcya></txcya>").append(name ? name : "function")
// 			case 'array': return $("<txyel></txyel>").append(name ? name : "array")
// 			case 'object': return $("<txblu></txblu>").append(name ? name : "object")
// 			case 'regex': return $("<txprp></txprp>").append(name ? name : "regex")
// 			case 'null': return $("<txblk></txblk>").append(name ? name : "null")
// 			case 'undefined': return $("<txblk></txblk>").append(name ? name : "undefined")
// 			default: return $("<txblk></txblk>").append(name ? name : "?")
// 		}

// 	}

// 	var $collapse = function (n) {
// 		if (n) {
// 			return $("<span></span>")
// 				.addClass("collapse")
// 				.append(
// 					$("<i></i>")
// 						.addClass('icon-plus-squared')
// 				)
// 		} else {
// 			return $("<span></span>")
// 				.addClass("collapse")
// 				.append(
// 					$("<i></i>")
// 						.addClass('icon-minus-squared')
// 				)
// 		}
// 	}

// 	var $recur = function (obj, depth) {

// 		let m = isDefined(mdepth, Config.treeDepth, 4);
// 		const maxd = m <= 7 ? m : 7;	// max depth
// 		const maxn = 50;	// max level length
// 		const maxs = 150;	// max string length
// 		const maxc = 2;		// level to collapse after

// 		var $list = $("<ul></ul>");

// 		var i = 0;
// 		for (let key in obj) {
// 			i++;
// 			if (i > maxn) {
// 				continue
// 			}

// 			var content = obj[key]; // content
// 			var type = typeOf(obj[key]); // content type


// 			switch (type) {
// 				case 'object':
// 				case 'array':
// 					if ($.isEmptyObject(content)) { // is content epmty
// 						$list.append( // empty object
// 							$("<li></li>")
// 								.append(contentType(content, key))
// 								.append(": ")
// 								.append(`<txpnk>[empty]</txpnk>`)
// 						)
// 					} else { // content not empty
// 						if (depth > maxd) { // is max depth reached
// 							$list.append( // function description (max depth reached)
// 								$("<li></li>")
// 									.append(contentType(content, key))
// 									.append(": ")
// 									.append(`<txpnk>${isWhat(content)}</txpnk>`)
// 							)
// 						} else { // max depth not reached
// 							$list.append( // continue recursion
// 								$("<li></li>")
// 									.append(contentType(content, key))
// 									.append(": ")
// 									.append( // collapse button
// 										$collapse(depth >= maxc)
// 									)
// 									.append($recur(content, depth + 1))
// 							)
// 						}
// 					}
// 					break;

// 				case 'function':
// 					$list.append(
// 						$("<li></li>")
// 							.append(contentType(content, key))
// 							.append(": ")
// 							.append(
// 								`<txpnk>${isWhat(content)}</txpnk>`
// 							)
// 					)
// 					break;

// 				default:
// 					$list.append(
// 						$("<li></li>")
// 							.append(contentType(content, key))
// 							.append(": ")
// 							.append(content)
// 					)
// 					break;
// 			}

// 		}

// 		if (i > maxn) {

// 			$list.append(
// 				$("<li></li>")
// 					.append(
// 						$("<txprp></txprp>")
// 							.append(`... ${i - maxn} more`)
// 					)
// 			)

// 		}

// 		if (depth > maxc) {
// 			$list.hide()
// 		}

// 		return $list

// 	}

// 	if (typeOf(obj) != "array" && typeOf(obj) != "object")
// 		return $("<span></span>").append(contentType(obj)).append(": ").append(obj + "")

// 	var $ascii = $("<ul></ul>")
// 		.addClass("ascii")
// 		.append(
// 			$("<li></li>")
// 				.append(contentType(obj))
// 				.append(
// 					$collapse(false)
// 				)
// 				.append($recur(obj, 1))
// 		)

// 	return $ascii;

// }

function toTable(content) {
	/**
	 * Creates html table from 2D array
	 * @param {array} content 2d array
	 * 
	 * @returns {H} html table from array
	 */

	var $table = $("<table></table>")

	for (let row of content) {
		let tr = $("<tr></tr>")
		for (let col of row) {
			tr.append(
				$("<td></td>").append(col + "")
			)
		}
		$table.append(tr)
	}

	return $table

}

function toGraph(data, x, y) {
	/**
	 * Create chart.js graph
	 * @param {object} data chart.js configuration object
	 * @param {number} x graph width
	 * @param {number} y grap height
	 * 
	 * @returns {H} chart.js html element with init script
	 */

	var id = makeID(6);

	return `<div class="chartdiv"><canvas id="${id}" width="${isDefined(x, 400)}" height="${isDefined(y, 400)}"></canvas></div><script>var ctx = document.getElementById("${id}").getContext("2d");var myChart = new Chart(ctx, JSON.parse('${JSON.stringify(data)}'));</script>`
}

function toSyntax(data, lang) {
	/**
	 * Text syntax highlighting
	 * @param {string} data text to highlight
	 * @param [lang] syntax language
	 */

	if (lang) {
		var langs = [];
		langs.push(lang)
	}
	var hl = hljs.highlightAuto(data, lang);
	var out = "";

	var r = /(\<.*?\>)(.*?)(\<\/[\S]*?\>)/g;

	out = hl.value.replace(r, function (match, beg, mid, end) {
		// console.log(beg+"|"+mid+"|"+end);
		// console.log(beg+ mid.replace(/\n/g, `[\n]`) +end)
		return beg + mid.replace(/\n/g, `${end}\n${beg}`) + end
	})

	// var match = r.exec(hl.value);
	// while (match != null) {
	// 	console.log(match[0])
	//   out += match[1] + match[2].replace("\n", `${match[3]}\n${match[2]}`) + match[3]
	//   match = r.exec(hl.value);
	// }


	var lines = out.split("\n");
	var code = $("<code></code>")
		.append(`<!-- language: ${hl.language}, r: ${hl.r}, second: ${hl.second_best ? hl.second_best.language : undefined}-->`)

	/*for(let index in lines){
		code.append(
			$("<span></span>")
				.addClass('hljs-newline')
				.append(lines[index])
				// .prop( "data-int", " ".repeat( (lines.length.toString().length) - ((parseInt(index)+1).toString().length) ) + (parseInt(index)+1) )
		)
		.append("\n")
	}*/
	code.append(hl.value)

	return $("<pre></pre>").append(code)

	/*for(let index in lines){
		indexed+=`<span class="hljs-newline" data-int="${
			" ".repeat( (lines.length.toString().length) - ((parseInt(index)+1).toString().length) ) + (parseInt(index)+1)
		}">${lines[index]}</span>\n`
	}

	return `<pre><code>${indexed}</code></pre>`*/
}


function getLocal(key) {
	return JSON.parse(localStorage.getItem(key))
}

function setLocal(key, value) {
	value = JSON.stringify(value)
	localStorage.setItem(key, value)
	return value
}

function getSession(key) {
	return JSON.parse(sessionStorage.getItem(key))
}

function setSession(key, value) {
	value = JSON.stringify(value)
	sessionStorage.setItem(key, value)
	return value
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
		script.src = location.href + url;
		document.head.appendChild(script); //or something of the likes
	})

}

function requiresStyle(url) {
	return new Promise((resolve, reject) => {
		// console.log($(`link[href='${url}']`).length == 1)
		if ($(`link[href='${url}']`).length == 1) return
		var link = document.createElement('link');
		link.onload = function () {
			console.log('resolve')
			resolve()
		};
		link.href = url;
		link.rel = 'stylesheet';
		document.head.appendChild(link); //or something of the likes
	})

}

// function updateInfo(res) {
// 	// refresh status informations

// 	// var rp = JSON.parse(res);	// parse json

// 	if (($(".info0")[0]) && (res.type == "uptime")) {
// 		$(".info0").html(res["uptime"]);
// 		$(".info1").html(res["load1"]);
// 		$(".info2").html(res["load2"]);
// 		$(".info3").html(res["load3"]);
// 		$(".info4").html(res["memory"]);
// 		$(".info5").html(res["users"]);
// 	}
// 	// update uptime section

// 	if (($(".info6")[0]) && (res.type == "stats")) {
// 		$(".info6").html(res["tempout"]);
// 		$(".info7").html(res["tempin"]);
// 		$(".info8").html(res["humout"]);
// 		$(".info9").html(res["humin"]);
// 	}
// 	// update stats section

// 	if (($(".info10")[0]) && (res.type == "network")) {
// 		var nl = "";
// 		for (var i = 0; i < res['network'].length; i++) {
// 			nl += "<li><txcya>" + res['network'][i] + "</txcya></li>";
// 		}
// 		nl += '<li><txblu>Raspberry</txblu><ul><li><txred>I2C</txred><ul></ul></li><li><txred>Serial</txred><ul></ul></li></ul></li>';
// 		$(".info10").html(nl);
// 	}
// 	// update devices section
// }

// function setStyle() {
// 	setstyle: function setstyle(name){ // set style theme
// 		if(!name) var name = "";

// 		if(name != ""){
// 			log("Style: "+name, "info");
// 			setCookie("style", name);
// 			$('head').append('<link rel="stylesheet" href="styles/'+name+'.css" type="text/css" />');
// 		}else{
// 			log("Style "+name+" doesn't exist, using default preset", "warning");
// 			setstyle("default");
// 		}
// 	},
// }

// function mesparse(data, amount, con) { // parse mesenger chat information
// 	var response = "";
// 	var perf = performance.now();

// 	// check if json is loaded\
// 	if (typeof data != "undefined") {

// 		// check if participants are defined\
// 		if (typeof data.participants != "undefined") {

// 			l = []; // links
// 			p = 0; // pics
// 			a = []; // unique words
// 			ac = []; // unique words counter
// 			w = 0;  // word counter
// 			d = [0, 0, 0, 0, 0, 0, 0] // weekdays
// 			h = new Array(24).fill(0);

// 			// unique words by participant
// 			for (let key in data.participants) {
// 				data.participants[key].w = [];
// 			}

// 			// check if messages are defined\
// 			if (typeof data.messages != "undefined") {

// 				// parse every message in file
// 				for (let key in data.messages) {

// 					// check if content is present
// 					if (typeof data.messages[key].content != "undefined") {

// 						let x = new Date();
// 						x.setTime(data.messages[key].timestamp_ms);
// 						d[x.getDay()] += 1;
// 						h[x.getHours()] += 1;

// 						// check if message is a photo
// 						if (data.messages[key].photos) {
// 							p++;
// 							continue;
// 						}

// 						data.messages[key].content = data.messages[key].content.replace(/ +(?= )/g, '');
// 						words = data.messages[key].content.split(" ");

// 						for (let word in words) {

// 							let i = a.indexOf(words[word]);
// 							if (i == -1) {
// 								a.push(words[word]);
// 								ac.push(1);
// 							} else {
// 								ac[i] += 1;
// 							}

// 							for (let p in data.participants) {
// 								if (data.messages[key].sender_name == data.participants[p].name)
// 									data.participants[p].w.push(words[word])
// 							}
// 							// if(data.messages[key].sender_name == "Sebastian Fudalej") s.push(words[word]);
// 							// else if(data.messages[key].sender_name == "Mateusz Pstrucha") m.push(words[word]);
// 							w++;
// 						}
// 					}

// 					// break if requested amount is parsed
// 					if (typeof amount != "undefined")
// 						if (amount > 0)
// 							if (key == amount) break;
// 				}

// 				// merging words and count arrays
// 				b = [];
// 				for (let key in a) {
// 					b.push([a[key], ac[key]]);
// 				}

// 				// sorting words by count
// 				b.sort(function (a, b) {
// 					if (a[1] === b[1]) {
// 						return 0;
// 					}
// 					else {
// 						return (a[1] > b[1]) ? -1 : 1;
// 					}
// 				});

// 				response += "<br>" + con.returnError("Done", "ok");
// 				response += "<br><txpnk>#### " + data.title + ": ####</txpnk>"

// 				// top #10 words
// 				let v = b.slice(0, 10);
// 				var tp = [];
// 				for (let key in v) {
// 					tp.push(["<txyel>" + decodeURIComponent(escape(v[key][0])) + "</txyel>", v[key][1]]);
// 				}
// 				response += toTable(tp);

// 				// words by participant
// 				var partic = [];
// 				for (let key in data.participants) {
// 					partic.push(["<txorn>" + decodeURIComponent(escape(data.participants[key].name)) + "</txorn>", data.participants[key].w.length])
// 					// response += "<br><txorn>"+decodeURIComponent(escape(data.participants[key].name))+"</txorn> words: "+data.participants[key].w.length;
// 				}
// 				response += toTable(partic);

// 				// response += toTable([
// 				// 	["<txred>Monday</txred>", d[0]],
// 				// 	["<txred>Tuesday</txred>", d[1]],
// 				// 	["<txred>Wednesday</txred>", d[2]],
// 				// 	["<txred>Thursday</txred>", d[3]],
// 				// 	["<txred>Friday</txred>", d[4]],
// 				// 	["<txred>Saturday</txred>", d[5]],
// 				// 	["<txred>Sunday</txred>", d[6]]
// 				// ])

// 				// let hrs = [];
// 				// for(let hours in h){
// 				// 	hrs.push([hours+":00", h[hours]]);
// 				// }

// 				response += toGraph({
// 					type: 'line',
// 					data: {
// 						labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
// 						datasets: [{
// 							label: '# per hour of day',
// 							data: h,
// 							backgroundColor: "#ffffff66",
// 							borderColor: "#ffffff66",
// 							borderWidth: 1
// 						}]
// 					},
// 					options: {
// 						maintainAspectRatio: false,
// 						responsive: false,
// 						scales: {
// 							yAxes: [{
// 								ticks: {
// 									beginAtZero: true
// 								}
// 							}]
// 						}
// 					}
// 				}, 400, 200);

// 				response += toGraph({
// 					type: 'line',
// 					data: {
// 						labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
// 						datasets: [{
// 							label: '# per weekday',
// 							data: d,
// 							backgroundColor: "#ffffff66",
// 							borderColor: "#ffffff66",
// 							borderWidth: 1
// 						}]
// 					},
// 					options: {
// 						maintainAspectRatio: false,
// 						responsive: false,
// 						scales: {
// 							yAxes: [{
// 								ticks: {
// 									beginAtZero: true
// 								}
// 							}]
// 						}
// 					}
// 				}, 400, 200);

// 				response += toTable([
// 					["<txcya>Total messages</txcya>", data.messages.length],
// 					["<txcya>Total words</txcya>", w],
// 					["<txcya>Unique words</txcya>", a.length],
// 					["<txcya>Total photos</txcya>", p],

// 					["<txcya>Parsing time</txcya>", (performance.now() - perf) + "ms"]
// 				])

// 				// response += "<br>"+"<txcya>Unique words</txcya>: "+a.length;
// 				// response += "<br>"+"<txcya>Total photos</txcya>: "+p;
// 				// response += "<br>"+"<txcya>Total words</txcya>: "+w;
// 				// response += "<br>"+"<txcya>Parsing time</txcya>: "+(performance.now()-perf)+"ms";

// 			} else {
// 				response += "<br>" + con.returnError("JSON structure invalid", "error");
// 			}
// 		} else {
// 			response += "<br>" + con.returnError("Invalid message file", "error");
// 		}
// 	} else {
// 		response += "<br>" + con.returnError("No json data loaded", "error");
// 	}

// 	return response;
// }

// function mesall(data, amount, con) { // parse mesenger chat information
// 	var response = "";
// 	var perf = performance.now();

// 	// check if json is loaded
// 	response += "<br>" + con.returnError("Checking data", "info");
// 	if (typeof data != "undefined") {

// 		// check if participants are defined
// 		response += "<br>" + con.returnError("Loading participants", "info");
// 		if (typeof data.participants != "undefined") {

// 			response += "<br>" + con.returnError("Initializing variables", "info");
// 			var colors = {};

// 			// unique words by participant
// 			for (let key in data.participants) {
// 				switch (key) {
// 					case "0":
// 						colors[data.participants[key].name] = "txgrn";
// 						break;
// 					case "1":
// 						colors[data.participants[key].name] = "txblu";
// 						break;
// 					case "2":
// 						colors[data.participants[key].name] = "txcya";
// 						break;
// 					case "3":
// 						colors[data.participants[key].name] = "txyel";
// 						break;
// 					case "4":
// 						colors[data.participants[key].name] = "txorn";
// 						break;
// 					case "5":
// 						colors[data.participants[key].name] = "txred";
// 						break;
// 					case "6":
// 						colors[data.participants[key].name] = "txpnk";
// 						break;
// 					case "7":
// 						colors[data.participants[key].name] = "txred";
// 						break;
// 					default:
// 						colors[data.participants[key].name] = "txblk";
// 						break;
// 				}

// 			}

// 			// check if messages are defined
// 			response += "<br>" + con.returnError("Parsing messages", "info");
// 			if (typeof data.messages != "undefined") {

// 				// parse every message in file
// 				var messages = data.messages.slice().reverse()
// 				for (let key in messages) {
// 					let col = colors[messages[key].sender_name] ? colors[messages[key].sender_name] : "txblk";
// 					con.log("<" + col + ">" + decodeURIComponent(escape(messages[key].sender_name)) + "</" + col + ">: " + decodeURIComponent(escape(messages[key].content)));

// 					// break if requested amount is parsed
// 					if (typeof amount != "undefined")
// 						if (amount > 0)
// 							if (key == amount) break;
// 				}

// 			} else {
// 				response += "<br>" + con.returnError("JSON structure invalid", "error");
// 			}
// 		} else {
// 			response += "<br>" + con.returnError("Invalid message file", "error");
// 		}
// 	} else {
// 		response += "<br>" + con.returnError("No json data loaded", "error");
// 	}

// 	return null;
// }

class Waiter {
	constructor(list, f){
		this.list = {}
		this.callback = f
		for(let n of list){
			this.list[n] = false
		}
	}

	update(name){
		this.list[name] = true
		for(let el in this.list){
			if(this.list[el] == false)
				return false
		}
		this.callback()
	}
}

class Elements {
	constructor($wind) {

		if (typeof $wind == "undefined") {
			var $wind = $("<div></div>")
				.addClass("wind")
				.append(
					$("<input>")
						.addClass("jsonl")
						.prop("type", "file")
						.hide()
				)
				.append(
					$("<div></div>")
						.addClass("commands")
				)
				.append(
					$("<div></div>")
						.addClass("commline")
						.append(
							$("<span></span>")
								.addClass("ud")
								.append(
									$("<span></span>")
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
									$("<txblu></txblu>")
										.addClass("commpath")
										.append("~")
								)
								.append(" $ ")

						)
						.append(
							$("<input>")
								.addClass("commin")
								.prop("autocomplete", "off")
								.prop("autocorrect", "off")
								.prop("autocapitalize", "off")
								.prop("spellcheck", false)
								.prop("autofocus", true)
						)
					// .append(
					// 	$("<span></span>")
					// 		.addClass("icons")
					// 		.append(
					// 			$("<i></i>").addClass("icon-volume-up"),
					// 			$("<i></i>").addClass("icon-lock-open"),
					// 			$("<i></i>").addClass("icon-trash"),
					// 			$("<i></i>").addClass("icon-level-down"),
					// 			$("<i></i>").addClass("icon-unlink")
					// 		)
					// )
				)
			$("body").append($wind);
		}

		this.$wind = $wind;
		this.$commands = $wind.children(".commands");
		this.$ud = $wind.children(".commline").children(".ud")
		this.$commuser = $wind.children(".commline").children(".ud").children(".comuser");
		this.$commpath = $wind.children(".commline").children(".ud").children(".commpath");
		this.$commin = $wind.children(".commline").children(".commin");
		this.$jsonl = $wind.children(".jsonl");

		// this.$commin.on("blur", function () {
		// 	if ($(this).closest(".wind").data("con").scroll) {
		// 		this.focus();
		// 	}
		// })

		var icons = $wind.children(".commline").children(".icons");

		// this.icons = {};

		// this.icons.$trash = icons.children("i.icon-trash");
		// this.icons.$trash.on("click", function () {
		// 	$(this).closest(".wind").data("con").clear();
		// })

		// this.icons.$levelDown = icons.children("i.icon-level-down");
		// this.icons.$levelDown.on("click", function () {
		// 	$(this).closest(".wind").data("con").scrollBottom(true);
		// })

		// this.icons.$volume = icons.children("i.icon-volume-up");

		// this.icons.$lock = icons.children("i.icon-lock-open");
		// this.icons.$lock.change = function () {
		// 	var con = $wind.data("con")
		// 	if (!con.scroll) {
		// 		this.removeClass();
		// 		this.addClass("icon-lock-open");
		// 		con.scroll = true;
		// 		con.elements.$commin.focus();
		// 	} else {
		// 		this.removeClass();
		// 		this.addClass("icon-lock");
		// 		con.scroll = false;
		// 	}
		// }
		// this.icons.$lock.on("click", function () {
		// 	$(this).closest(".wind").data("con").elements.icons.$lock.change();
		// });

		// this.icons.$connection = icons.children("i.icon-unlink");
		// this.icons.$connection.blink = function () {
		// 	this.addClass("txgrn glow");
		// 	setTimeout(function (icon) {
		// 		icon.removeClass("txgrn glow");
		// 	}, 200, this);
		// }
		// this.icons.$connection.on("click", function () {
		// 	$(this).closest(".wind").data("con").executeCom("connection");
		// })

		// this.icons.$lock.enable = function () {
		// 	this.removeClass();
		// 	this.addClass("icon-lock-closed");
		// }
		// this.icons.$lock.disable = function () {
		// 	this.removeClass();
		// 	this.addClass("icon-lock");
		// }

		// this.icons.$connection.enable = function () {
		// 	this.removeClass();
		// 	this.addClass("icon-link");
		// }
		// this.icons.$connection.disable = function () {
		// 	this.removeClass();
		// 	this.addClass("icon-unlink");
		// }

		this.$commline = $wind.children(".commline");
		this.$commline.enable = function () {
			this.children(".commin").prop('disabled', false);
			this.css("filter", "grayscale(0%)");
		}
		this.$commline.disable = function () {
			this.children(".commin").prop('disabled', true);
			this.css("filter", "grayscale(1000%)");
		}
		this.$commuser.change = function (user, badge) {
			this.html(user);
			this.removeClass();
			this.addClass(badge);
			this.closest(".wind").data("con").updateInputWidth()
		}

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

		if (this.con.Functions[this.c]) { // offline command is available
			this.con.Functions[this.c](this)
		} else { // send command to server
			// this.log("Local command not found", 'warning', 3)
			if (this.con.Socket) { // check for module
				if (this.con.Socket.socket.connected) { // check for connection
					this.con.Socket.send(this)
				} else {
					this.log("Server disconnected", 'error')
				}
			} else {
				this.log("Socket module not available", 'error')
			}
		}

		return

		switch (this.c) {
			default:
				if (this.con.Socket.socket.connected != true) {
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

		this.con.log(`#${res.res.id} received block`, "info", 3);
		this.blocks[res.meta.n] = res
		this._timeout(true)

		this._addBlock(this._block(await this.con.unpack(res), res.meta.n))
		// this.con.scrollBottom(false); // scroll to end of page (non-force)
	}
	
	_block(data, n){
		return $(`<div data-n="${n}"</div>`)
			.append(data)
			.append(timestamp())
	}

	_addBlock(block){
		var children = this.$sr.children(),
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
		this.elements = new Elements($wind); // DOM elements object

		// commands input history
		this.history = {

			counter: 0,
			commands: [""],

			push(com) {
				this.commands.push(com)
				this.counter = 0
				return this
			},

			increment() {
				this.counter++
				if (this.counter > this.commands.length - 1) this.counter = 0
				return this
			},

			decrement() {
				this.counter--
				if (this.counter < 0) this.counter = this.commands.length - 1
				return this
			},

			current() {
				return this.commands[this.counter]
			},

			get up() {
				this.decrement()
				return this.commands[this.counter]
			},

			get down() {
				this.increment()
				return this.commands[this.counter]
			}

		}

		this.Functions = {};
		this.Classes = {};

		this.m = undefined;	// last m recipient
		this.coms = []; // executed Coms list
		this.scroll = true; // block scrollBottom flag
		this.jsond = undefined; // user loaded json data
		this.timeout = 16000 // Com response waiting time [ms]
		this.fConnect = false; // first connect event flag
		// this.fAuth = false; // first auth event flag
		this.first = false
		this.verbose = Config.verbose; // log display level

		// credentials
		this.credentials = getLocal('credentials')
		this.udata = getLocal('udata') || {
			badge: 'txcya',
			login: 'guest',
			group: 9,
			lastLogin: 'n/a',
			shortid: undefined
		}

		this.keymap = {
			'2l': () => this.clear()
		}
		
		// var c = this
		// this.elements.$wind[0].onload = ()=>{
		// 	// console.log('ready')
		// 	// c._ready()`
		// }

		// this.elements.$wind[0].onload = alert
		this.elements.$commline.ready(() => {
			// alert()
			this._ready()
		});
		// this._ready()

	}

	removeCom(id) {

		this.log("Removing Com #${id} element", "warning", 2);
		for (let key in this.coms) {
			if (this.coms[key].id === id) {
				this.coms[key].remove();
				this.log("Com #${id} removed", "info", 2);
				return true
			}
		}

		this.log(`Com #${id} element not found`, "error", 2);
		return false

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

	executeCom(val) {

		this.log(`Force Com execute: ${val}`, "info", 3);
		this.elements.$commin.val(val);
		this.commandlineParse();

	}

	log(data, opt, lvl) {
		// console.log(getStackTrace())
		var lvl = isDefined(lvl, 1);

		if (lvl > this.verbose) return

		var opt = isDefined(opt, "");

		switch (opt) {
			default:
			case 'info': opt = ['txblu', 'Info']; break;
			case 'warning': opt = ['txyel', 'Warning']; break;
			case 'error': opt = ['txred', 'Error']; break;
			case 'ok': opt = ['txgrn', 'OK']; break;
			case 'prompt': opt = ['txcya', '?']; break;
		}

		var out = $("<div></div>")
			.addClass('inline')
			.append(
				timestamp(),
				$('<tx></tx>')
					.addClass(opt[0])
					.append("#".repeat(lvl))
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

	}

	commandlineParse() { // command send event

		if (this.elements.$commin.is(":hidden")) return;	// if commandline is blocked (hidden), stop executing

		var raw = this.elements.$commin.val();	// get raw input
		this.elements.$commin.val("");	// clear commandline input

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

	async unpack(res) {
		switch (res.meta.flag) {
			default:
			case 0: // plaintext
				return res.data
			case 1: // Tree
				await this._requires('Tree')
				return new this.Classes.Tree(res.data).$
			case 6: // log response
				// this.log(res.data.data, res.meta.arg);
				break;

			case 9: // toTree
			// return toTree(res.data);

			case 10: // toTable
			// return toTable(res.data);
		}
	}

	getScroll() { // get scroll distance to bottom

		var s = this.elements.$wind.scrollTop() - (this.elements.$wind.prop('scrollHeight') - this.elements.$wind.outerHeight());
		if (s >= 0) s = 0;
		else s = s * -1;
		return s
	}

	scrollBottom(f) { // scroll to the bottom

		let force = isDefined(f, false);
		if (force) return;

		let a = this.elements.$commands.children();
		let b = this.elements.$commands.children().children();

		var to = 0;
		for (let index of a)
			to += index.scrollHeight
		for (let index of b)
			to += index.scrollHeight

		this.elements.$commands.stop().animate({ scrollTop: to }, 200, 'swing', function () { });

	}

	updateInputWidth() {
		var w = this.elements.$ud.width() + 20;
		this.elements.$commin.css({ 'width': `calc(100% - ${w}px)` });
		return w;
	}

	commandHistory(key) {
		this.elements.$commin.val(key == 38 ? this.history.up : (key == 40 ? this.history.down : ""));
		this.elements.$commin.focus();
	}

	readJson(data) {
		var file = data.target.files[0];
		var reader = new FileReader();

		reader.con = $(this).closest(".wind").data("con");
		reader.onload = function (event) {
			try {
				this.con.jsond = JSON.parse(event.target.result);
				this.con.log("JSON loaded", "ok");
			} catch (error) {
				this.con.log(`JSON parsing error: ${error}`, "error");
			}

		}
		reader.readAsText(file, "UTF-8");

	}

	_getPackage(name) {
		return new Promise((resolve, reject) => {

			this.log(`Requesting ${name} module`, 'info')
			import(`./packages/${name}.js`)
				.then(mod => {
					var done = ()=>{
						switch (mod.type) {
							case 'sub':
								try{
									this.log(`Starting ${name} module`, 'info')
									this[name] = new mod.default(this)
								}catch(err){
									this.log(`Module ${name} failed: ${err}`, 'error')
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
						this.log(`Downloaded ${name} module`, 'ok')
						resolve()
					}
					
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
					} else done()
					// resolve()
				})
				.catch(err => {
					this.log(`Downloading ${name} module failed: ${err}`, 'error')
					reject()
				})


			// var tag = document.createElement('script')
			// tag.src = `packages/${name}.js`

			// Config.packages.update(name, 'downloading')


			// $(tag).ready(() => {
			// 	Config.packages.update(name, 'downloaded')
			// 	resolve()
			// if (eval(`if(typeof ${name} != 'undefined')true;else false`)) {

			// 	this.log(`${name} package downloaded`, 'ok')
			// 	resolve()
			// } else {
			// 	Config.packages.update(name, 'failed')
			// 	this.log(`${name} package download failed`, 'error')
			// 	reject()
			// }
			// })
			// $('head').append(tag)
		});
	}

	// _getMultiPackage(...names){
	// 	return new Promise((resolve, reject) => {
	// 		var list = {}
	// 		function update(name) {
	// 			list[name] = true
	// 			for (let el in list) {
	// 				if (!el) return
	// 			}
	// 			console.log('resolve',)
	// 			resolve()
	// 		}
	// 		for (let name of names) {
	// 			list[name] = false
	// 			this._getPackage(name)
	// 				.then(()=>update(name))
	// 		}
	// 	})
	// }

	_requires(name) {
		if (!Config.packages[name])
			Config.packages[name] = this._getPackage(name)

		return Config.packages[name]
		// return new Promise((resolve, reject) => {
		// 	if (Config.packages.check(name) == 'undefined')
		// 		this._getPackage(name)
		// 	else resolve()

		// 	Config.packages.callback(name)
		// 		.then(() => {
		// 			this[name] = eval(`new ${name}(this)`)
		// 			resolve()
		// 		})
		// })
	}

	_optional(name) {
		this.log(`There is an optional module: ${name}, do you want to download it?`, 'prompt')
	}

	_ready() {
		$(this.elements.$wind).prop("id", this.id); // attach Con id to DOM
		$(this.elements.$wind).data("con", this); // attach Con object to DOM

		// command input key handling
		this.elements.$commline.on("keydown", "input", function (e) {
			var con = $(this).closest(".wind").data("con");

			switch (e.which) {
				// ENTER key
				case 13: con.commandlineParse(); // commandline handling
					break;

				// KEYUP key
				// KEYDOWN key
				case 38:
				case 40: con.commandHistory(e.which); e.preventDefault(); // last command down
					break;

				// ESCAPE key
				case 27: con.elements.$commin.val("") // clear input
					break;
			}

		});

		// tree collapse subtree click handling
		this.elements.$wind.on("click", ".collapse", function (e) {
			var collapse = $(this);

			collapse.parent().children("ul").slideToggle(200)
			if (collapse.children("i").hasClass("icon-minus-squared")) {
				collapse.children("i").removeClass();
				collapse.children("i").addClass("icon-plus-squared");
			} else {
				collapse.children("i").removeClass();
				collapse.children("i").addClass("icon-minus-squared");
			}

		})

		this.elements.$wind.on('keydown', e => {
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

		// form key handling
		this.elements.$commands.on("keydown", "form", function (e) {
			var com = $(this).closest(".command").data("com");

			switch (e.which) {
				case 13: com.sendForm(); // send form [enter]
					break;

				case 27: com.removeForm(); // remove form [escape]
					break;
			}
		});

		// link click handling
		this.elements.$wind.on("click", "a", function (e) {
			var a = $(this);
			var href = a.prop("href");
			href = href.slice(href.indexOf("#"));

			if (href.startsWith("#")) {
				e.preventDefault();
				a.closest(".wind").data("con").executeCom(decodeURIComponent(href.slice(1)))
			}
		})

		// jsonl file input event listener
		this.elements.$jsonl[0].addEventListener('change', this.readJson, false);

		// // 'accept cookies' prompt
		// if (typeof getCookie("cookies") == "undefined") {
		// 	setCookie("cookies", "1");
		// 	this.log("This site uses cookies. By continuing, you agree to our use of cookies. <a target = '_blank' href='http://wikipedia.org/wiki/HTTP_cookie'>Learn more</a>", "warning")
		// }

		// update input width // TODO: get this working in pure css
		this.updateInputWidth();

		this.log("Console ready", 'ok')

		this._requires("Socket")
		this._requires("Essentials")
		// this._requires("Tree")

	}

}

var Config = {
	notif: new Audio('res/unsure.mp3'), // notification sound object
	treeDepth: 4, // tree visualization Depth
	socket: undefined, // socket connection object
	cons: [], // cons list
	packages: {},
	// packages: {
	// 	list: {},
	// 	update(name, state) {
	// 		if (this.list[name]) {
	// 			this.list[name].state = state
	// 		} else {
	// 			this.list[name] = {
	// 				state: state,
	// 				callbacks: []
	// 			}
	// 		}

	// 		if (state == 'ready') {
	// 			for (let fs of this.list[name].callbacks) {
	// 				fs[0]()
	// 			}
	// 		} else if (state == 'failed') {
	// 			for (let fs of this.list[name].callbacks) {
	// 				fs[1]()
	// 			}
	// 		}
	// 	},
	// 	callback(name, f) {
	// 		return new Promise((resolve, reject) => {
	// 			this.list[name].callbacks.push([resolve, reject])
	// 		})
	// 	},
	// 	check(name) {
	// 		return typeof this.list[name] != 'undefined' ? this.list[name].state : 'undefined'
	// 	}
	// },
	verbose: 2,
	serviceWorker: false // enable serviceWorker
}

$(document).ready(function () {
	$("noscript").remove(); // remove 'js disabled' notice

	Config.notif.volume = 0.3
	Config.cons.push(new Con())
	con = Config.cons[0]

	if ('serviceWorker' in navigator && Config.serviceWorker) { // check is serviceWorker is available
		navigator.serviceWorker
			.register('service-worker.js')
			.then(reg => console.log('sw registered'))
			.catch(error => console.log(`sw error: ${error}`))
	}

	setInterval(function () { // loading animation
		if ($(".ud").length) $(".ud").each(function (index) { // for every Com
			var c = $(this);
			var s = c.attr('loading');
			if (typeof s == "undefined") return; // return if Com is not loading

			switch (s) {
				case "[--------]": c.attr('loading', '[#-------]'); break;
				case "[#-------]": c.attr('loading', '[##------]'); break;
				case "[##------]": c.attr('loading', '[###-----]'); break;
				case "[###-----]": c.attr('loading', '[####----]'); break;
				case "[####----]": c.attr('loading', '[#####---]'); break;
				case "[#####---]": c.attr('loading', '[######--]'); break;
				case "[######--]": c.attr('loading', '[#######-]'); break;
				case "[#######-]": c.attr('loading', '[########]'); break;
				default: case "[########]": c.attr('loading', '[--------]'); break;
			}

		});

	}, 250);

});
