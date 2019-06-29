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
