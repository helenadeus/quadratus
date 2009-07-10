	remove_element_by_id ('quadrado')
	var headID = document.getElementsByTagName("head")[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.id = 'quadrado' ;
	script.src = 'quadrado.js' ;
	headID.appendChild(script);// retrieve answer