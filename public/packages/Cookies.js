class Cookies {
	getCookie(cname) {
		/**
		 * Get cookie
		 * @param {string} cname cookie name
		 * 
		 * @returns {string} cookie content (undefined if doesn't exist)
		 */

		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0)
				return c.substring(name.length, c.length);

		}
		return undefined;
	}

	setCookie(cname, cvalue, exdays) {
		/**
		 * Set cookie
		 * @param cname cookie name
		 * @param cvalue cookie value
		 * @param exdays cookie expiry in days
		 * 
		 * @returns {undefined}
		 */

		var d = new Date();
		isDefined(exdays, 3650);
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		document.cookie = cname + "=" + cvalue + ";expires=" + d.toUTCString() + ";path=/";
	}
}
