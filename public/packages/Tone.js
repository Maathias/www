export var type = 'sub'

export var commands = {
	'tone': com => {
		var actions = {
			'play': () => {
				com.con.Tone.play(...com.arg.slice(1,5))
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

	destructor(){
		this.stop()
		delete this.oscillator
		delete this.isPlaying
	}

	play(freq, gain, pan, time) {

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

		// span node
		var panNode = context.createStereoPanner();
		panNode.pan.setValueAtTime(pan, context.currentTime);

		panNode.connect(volume);

		//connect the oscillator to the nodes
		var oscillator = this.oscillator = context.createOscillator();
		oscillator.type = 'sine';
		oscillator.frequency.value = freq;
		oscillator.connect(panNode);

		//start playing
		oscillator.start();
		this.isPlaying = true;
		console.log(`Playing ${freq}Hz at ${gain}dB, ${pan} center, for ${time}ms`)

		setTimeout(()=>{
			oscillator.stop();
		}, time)
	}

	stop() {
		if (this.oscillator)
			this.oscillator.stop()
	}
}