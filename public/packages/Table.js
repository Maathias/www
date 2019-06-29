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