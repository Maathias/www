function download(content, filename) {
	/**
	 * Download variable as file
	 * @param {mixed} content any variable
	 * @param {string} filename name of downloaded file
	 * 
	 * @returns {undefined}
	 */

	var createObjectURL = (window.URL || window.webkitURL || {}).createObjectURL || function () { };
	var blob = null;
	var mimeString = "application/octet-stream";
	window.BlobBuilder = window.BlobBuilder ||
		window.WebKitBlobBuilder ||
		window.MozBlobBuilder ||
		window.MSBlobBuilder;


	if (window.BlobBuilder) {
		var bb = new BlobBuilder();
		bb.append(content);
		blob = bb.getBlob(mimeString);
	} else {
		blob = new Blob([content], { type: mimeString });
	}
	var url = createObjectURL(blob);
	var a = document.createElement("a");
	a.href = url
	a.download = filename;
	a.innerHTML = "";
	document.body.appendChild(a);
	a.click()
	a.remove()
}