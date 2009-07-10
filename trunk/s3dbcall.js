// for documentation and rationale see http://sites.google.com/a/s3db.org/s3db/documentation/mis/json-jsonp-jsonpp

function remove_element_by_id (id) {
	var e = document.getElementById(id);
	if(typeof (e)!='undefined'){
	e.parentNode.removeChild(e);
	}
	return false;
}

function s3dbcall (src,next_eval) {
	call = "call_"+Math.random().toString().replace(/\./g,"");
	if (!src.match(/\?/)) {src=src+"?format=json&callback=s3db_jsonpp&jsonpp="+next_eval}
	else {src=src+"&format=json&callback=s3db_jsonpp&jsonpp="+next_eval}
	var headID = document.getElementsByTagName("head")[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = src ;
	script.id = call;
	headID.appendChild(script);// retrieve answer
	//setTimeout("remove_element_by_id('"+script.id+"')",1000); // wait 1 sec and remove the script that asked the question (IE needs it there for a moment, Firefox is ok with immediate deletion)
	//this.call=function (src,next_eval) { //uncomment this if you want to call through a method
	//	s3dbcall (src,next_eval);
	//	return false}
	return false}

function s3db_jsonpp (ans,jsonpp) {
	eval(jsonpp);
	return ans}