export var type = 'sub'

export var requires = {
	scripts: [
		"https://connect.facebook.net/en_US/sdk.js"
	]
}

export default class Facebook {
	constructor(con){
		this.con = con

		this.loginStatus = null

		

		// FB.login(function (response) {
		// 	if (response.authResponse) {
		// 		console.log('Welcome!  Fetching your information.... ');
		// 		FB.api('/me', function (response) {
		// 			console.log('Good to see you, ' + response.name + '.');
		// 		});
		// 	} else {
		// 		console.log('User cancelled login or did not fully authorize.');
		// 	}
		// });
	}

	init(){
		FB.init({
			appId: '350860092507049',
			autoLogAppEvents: true,
			xfbml: false,
			version: 'v3.3'
		});

		FB.getLoginStatus(r => {
			this.loginStatus = r
		})
	}

	updateLoginStatus(){
		FB.getLoginStatus(r => {
			this.loginStatus = r
		})
	}
}