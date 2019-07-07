export var type = 'sub'

export var commands = {
	'tone': com => {
		var actions = {
			'play': () => {
				com.con.Tone.play(...com.arg.slice(1,4))
				com._end()
			}
		}
		if(actions[com.arg[0]]){
			actions[com.arg[0]]()
		}
	}
}

export default class Tone{
	constructor(){
		this.oscillator = null;
		this.isPlaying = false;
	}

	play(freq, gain, time) {

		//stop the oscillator if it's already playing
		if (this.isPlaying) {
			this.oscillator.stop();
			this.isPlaying = false;
		}

		//re-initialize the oscillator
		var context = new AudioContext();

		//create the volume node;
		var volume = context.createGain();
		volume.gain.value = gain;
		volume.connect(context.destination);

		//connect the oscillator to the nodes
		var oscillator = this.oscillator = context.createOscillator();
		oscillator.type = 'sine';
		oscillator.frequency.value = freq;
		oscillator.connect(volume);

		//start playing
		oscillator.start();
		this.isPlaying = true;

		setTimeout(()=>{
			oscillator.stop();
		}, time)
	}
}