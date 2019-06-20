export var type = "command"

export default {
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
			})
	}
}