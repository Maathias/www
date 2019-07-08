export var type = "command"

export default {
	'settings': com => {
		var actions = {
			'set': () => {
				com.con.settings[com.arg[1]] = eval(com.arg[2])
				Storage.Local.set('settings', com.con.settings)
				com._end()
			}
		}
		actions[com.arg[0]]()
	},
	'mod': com => {
		var actions = {
			'get': () => {
				com.con.prompt(`Install ${com.arg[1]} module?`, 'yn')
					.then(out => {
						if(out){
							com.con._requires(com.arg[1])
								.then(() => com._end())
						} else {
							com.con.log(`Aborting ${com.arg[1]} installation`, 'warning')
							com._end()
						}
					})
					.catch(out => {
						actions.get()
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