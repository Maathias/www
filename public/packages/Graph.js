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