const chalk = require('chalk')
module.exports = class Functions{
	static ID(n) {
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

	static date(format) {
		/**
		 * thiserates current date in specified format
		 * long - DD/MM/YYYY HH:MM:SS
		 * log - DD/MMM HH:MM:SS
		 * @param {string} format date format 
		 * 
		 * @returns {string} date in specified format
		 */

		var d = new Date,
			out = new String

		switch (format) {
			default:
			case 'long':
				let m = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()
				let s = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds()
				out = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + " " + d.getHours() + ":" + m + ":" + s
				break;
			case 'log':
				let p = new Date().toString().replace(/[A-Z]{3}\+/, '+').split(/ /)
				out = p[2] + '/' + p[1] + ' ' + p[4]
				break;
		}

		return out
	}

	static escape() {
		return unsafe
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	static multiLine(...arr) {
		var out = "";
		for (let key of arr) {
			out += key.join("\n");
		}
		return out;
	}

	static hrtimeToMs(hrtime) {
		return hrtime[0] * 1e3 + hrtime[1] / 1e6
	}

	static email(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	static isDefined(...d) {

		for (let key in d) {
			if (typeof d[key] != "undefined")
				return d[key]
		}
		return undefined
	}

	static isNotNull(v, d) {
		if (v == null)
			return d
		else
			return v
	}

	static find(key, value, array) {
		for (let index in array) {
			if (typeof array[index] == 'object') return Che.find(key, value, array[index])
			if (array[index][key] == value) return array[index]
		}
		return undefined
	}

	static log(data, lvl) { // log user information //user, session, action, data, ip

		var lvl = lvl || 1,
			verbose = typeof db != 'undefined' ? (typeof db.config != 'undefined' ? db.config.verbose : Infinity) : Infinity

		if (lvl > verbose) return

		var date = chalk.underline(this.date('log')) + ` ${"#".repeat(lvl)}`,
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

			};

		if (actions[data.action]) {
			actions[data.action]()
		} else {
			console.log(data)
		}

	}

	static blink() { // blink the status led
		// cmd.run('python /home/mathias/python/blink.py');
	}

	static getUptime() {

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

}