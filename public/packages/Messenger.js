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