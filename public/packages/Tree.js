export var type = "class"
export default class Tree {
	constructor(data) {
		this.data = data

		if (this._typeOf(data) != "array" && this._typeOf(data) != "object")
			return $("<span></span>").append(_contentType(data)).append(": ").append(data + "")

		this.$ = $("<ul></ul>")
			.addClass("ascii tree")
			.append(
				$("<li></li>")
					.append(
						this._contentType(data),
						this._collapse(false),
						this._recur(data, 1)
					)
			)

	}

	get(){
		return this.$
	}

	_typeOf(o) {
		var t = typeof o

		if (o instanceof Array) t = "array"
		if (o instanceof RegExp) t = "regex"
		if (o === null) t = "null"

		return t
	}

	_contentType(v, name) {

		var type = this._typeOf(v)

		switch (type) {

			case 'number': return $("<txred></txred>").append(name ? name : "number")
			case 'string': return $("<txgrn></txgrn>").append(name ? name : "string")
			case 'boolean': return $("<txorn></txorn>").append(name ? name : "boolean")
			case 'function': return $("<txcya></txcya>").append(name ? name : "function")
			case 'array': return $("<txyel></txyel>").append(name ? name : "array")
			case 'object': return $("<txblu></txblu>").append(name ? name : "object")
			case 'regex': return $("<txprp></txprp>").append(name ? name : "regex")
			case 'null': return $("<txdrk></txdrk>").append(name ? name : "null")
			case 'undefined': return $("<txdrk></txdrk>").append(name ? name : "undefined")
			default: return $("<txdrk></txdrk>").append(name ? name : "?")
		}

	}

	_collapse(n) {
		if (n) {
			return $("<span></span>")
				.addClass("collapse")
				.append(
					$("<i></i>")
						.addClass('icon-plus-squared')
				)
		} else {
			return $("<span></span>")
				.addClass("collapse")
				.append(
					$("<i></i>")
						.addClass('icon-minus-squared')
				)
		}
	}

	_recur(obj, depth) {

		let m = this.mdepth || Config.treeDepth || 4
		const maxd = m <= 7 ? m : 7;	// max depth
		const maxn = 50;	// max level length
		const maxs = 150;	// max string length
		const maxc = 2;		// level to collapse after

		var $list = $("<ul></ul>");

		var i = 0;
		for (let key in obj) {
			i++;
			if (i > maxn) {
				continue
			}

			var content = obj[key]; // content
			var type = this._typeOf(obj[key]); // content type


			switch (type) {
				case 'object':
				case 'array':
					if ($.isEmptyObject(content)) { // is content epmty
						$list.append( // empty object
							$("<li></li>")
								.append(this._contentType(content, key))
								.append(": ")
								.append(`<txpnk>[empty]</txpnk>`)
						)
					} else { // content not empty
						if (depth > maxd) { // is max depth reached
							$list.append( // function description (max depth reached)
								$("<li></li>")
									.append(this._contentType(content, key))
									.append(": ")
									.append(`<txpnk>${isWhat(content)}</txpnk>`)
							)
						} else { // max depth not reached
							$list.append( // continue recursion
								$("<li></li>")
									.append(this._contentType(content, key))
									.append(": ")
									.append( // collapse button
										this._collapse(depth >= maxc)
									)
									.append(this._recur(content, depth + 1))
							)
						}
					}
					break;

				case 'function':
					$list.append(
						$("<li></li>")
							.append(this._contentType(content, key))
							.append(": ")
							.append(
								`<txpnk>${isWhat(content)}</txpnk>`
							)
					)
					break;

				default:
					$list.append(
						$("<li></li>")
							.append(this._contentType(content, key))
							.append(": ")
							.append(content)
					)
					break;
			}

		}

		if (i > maxn) {

			$list.append(
				$("<li></li>")
					.append(
						$("<txprp></txprp>")
							.append(`... ${i - maxn} more`)
					)
			)

		}

		if (depth > maxc) {
			$list.hide()
		}

		return $list

	}

};