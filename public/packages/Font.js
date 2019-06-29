export var type = 'sub'

export default class Font{
	constructor(con){
		this.con = con
		this.fonts = {}
	}

	set(name){
		if(this.fonts[name]){
			$(':root').css('--font', name)
		} else {
			this.con.log(`Font ${name} is not installed`, 'error')
		}
	}

	install(url, name, prop){
		this.fonts[name] = new FontFace(name, `url(${url})`, prop);
		this._load(name)
	}

	_load(name){
		this.fonts[name].load().then(face => {
			document.fonts.add(face)
		}).catch(err => {
			this.con.log(`Loading font ${name} failed: ${err}`)
			throw err
		});
	}
}