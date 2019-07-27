export var type = 'class'

export var requires ={
	scripts: [
		'res/chart.min.js'
	]
}

export default class Graph{
	constructor(config, data){
		this.id = makeID(4)
		this.x = 400
		this.y = 400
		this.$ = $('<div></div>')
			.addClass('chart')
			.attr('width', this.x)
			.attr('height', this.y)
			.append(
				this.canvas = $('<canvas></canvas>')
					.attr('id', this.id)
			)
		this.obj = new Chart(this.canvas[0].getContext('2d'), {
			...config,
			data: data
		})
	}
}