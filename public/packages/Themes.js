export var type = 'sub'

export var commands = {
	'theme': com => {
		var actions = {
			'set': () => {
				if (com.con.Themes.check(com.arg[1])){
					com.con.Themes.change(com.arg[1])
					com.log(`Theme ${com.arg[1]} applied`, 'ok')
				} else {
					com.log(`Theme ${com.arg[1]} not found`, 'error')
				}
				com._end()
			}
		}
		if (actions[com.arg[0]])
			actions[com.arg[0]]()
	}
}

export default class Themes{
	constructor(con){
		this.con = con
		this.list = {
			'default': {
				blk: '#1f1f1f',
				red: '#d25252',
				grn: '#7fe173',
				yel: '#ffc66d',
				blu: '#4099ff',
				prp: '#f680ff',
				cya: '#bed6ff',
				wht: '#eeeeec',
				xblk: '#535353',
				xred: '#f07070',
				xgrn: '#9dff91',
				xyel: '#ffe48b',
				xblu: '#5eb7f7',
				xprp: '#ff9dff',
				xcya: '#dcf4ff',
				xwht: '#ffffff'
			}
		}
	}

	check(name){
		return true
	}

	add(theme){}

	change(name){
		var n = this.list[name]
		for(let color in n){
			$(':root').css(`--tx${color}`, n[color])
		}
	}
}