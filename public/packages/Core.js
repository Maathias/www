export var type = "command"

export default {
	'settings': com => {
		var actions = {
			'set': () => {
				let name = com.arg[1],
					value = eval( com.arg.slice(2, com.arg.length).join(' ') )
				com.con.settings.set(name, value)
				com.log(`Setting ${name} set to: ${value}`)
				com._end()
			}
		}
		actions[com.arg[0]]()
	},
	'mod': com => {
		var actions = {
			'get': () => {
				com.con._modInfo(com.arg[1])
					.then(info => {
						com.log(`${com.arg[1]}: type: ${info.type}`)
						com.log(`${com.arg[1]}: status: ${info.state}`)
						com.log(`${com.arg[1]}: size: ${toKB(info.size)} kB`)

						if (info.state == 'installing') { com.log(`Module ${com.arg[1]} is being installed, aborting`, 'warning'); com._end(); return }
						if (info.state == 'downloading') { com.log(`Module ${com.arg[1]} is being downloaded, aborting`, 'warning'); com._end(); return }
						if (info.state == 'installed') {
							com.prompt(`Module ${com.arg[1]} is already installed, update?`, 'yn')
								.then(out => {
									if (out) {
										actions.update()
									} else {
										com.con.log(`Aborting ${com.arg[1]} update`, 'warning')
										com._end()
									}
								})
							return
						}

						com.prompt(`Install ${com.arg[1]} module?`, 'yn')
							.then(out => {
								if (out) {
									com.con._requires(com.arg[1])
										.then(() => com._end())
										.catch(() => com._end())
								} else {
									com.con.log(`Aborting ${com.arg[1]} installation`, 'warning')
									com._end()
								}
							})
					})
			},
			'update': () => {
				com.con.prompt(`Update ${com.arg[1]} module?`, 'yn')
					.then(() => {
						com.con._update(com.arg[1])
							.then(() => {
								com.con.log(`Module ${com.arg[1]} updated succesfully`, 'ok')
								com._end()
							})
							.catch(() => {
								com.con.log(`Module ${com.arg[1]} update failed`, 'error')
								com._end()
							})
					})
			}
		}
		actions[com.arg[0]]()
	},
	'clear': com => {
		com.con.clear()
	},
	'eval': com => {
		com.con._requires('Tree')
			.then(() => {
				try {
					com.insert(new com.con.Classes.Tree(eval(com.arg.join(' '))).$);
				} catch (error) {
					com.log(error, "error");
				}
				com._end()
			})
	}
}