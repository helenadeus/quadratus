//quadrado.js is an exercise in ubilding an interface that displays only the permission that the user that has been chosen has on the project that has been selected

function trigger_s3db() {
	s3db = {};
	s3db.url = document.getElementById('url').value;
	if(typeof(s3db.url)=='undefined' || s3db.url=='other'){
		s3db.url = document.getElementById('url_other').value;
		if (!s3db.url.match(/\/$/)) {
			s3db.url+='/';
			document.getElementById('url_other').value = url;
		}
	}

	s3db.key = document.getElementById('key').value;
	s3db.core = {};
	s3db.core.entities = {U:'user',P:'project',C:'collection',R:'rule',I:'item',S:'statement'};
	s3db.core.ids = {U:'user_id',P:'project_id',C:'collection_id',R:'rule_id',I:'item_id',S:'statement_id'};
	s3db.core.inherits = {P:["C","R"],C:"I",R:"S",I:"S"};
	s3db.core.prev = {P:["U"], R:["P"],C:["P"],I:["C"],S:["R","I"]};
	s3db.core.boxes = {U:'users',P:'projects',C:'collections',R:'rules',I:'items',S:'statements'};
	s3db.core.labels = {U:['username'],P:['name'],C:['name'],R:['subject', 'verb', 'object'],I:['notes'],S:['value']};
	if(s3db.key=='' || s3db.key=='type your key'){
	
	//call apilogin first
	//authority
	
	s3db.username = document.getElementById('username').value;
	s3db.password = document.getElementById('password').value;
	s3db.authority = document.getElementById('authority').value;
	var url2call = s3db.url+'apilogin.php?authority='+s3db.authority+'&username='+s3db.username+'&password='+s3db.password;
	s3db.key_call =  url2call;
	s3dbcall(url2call, 'findKey(ans)');
	}
	else {
		hide('login');display('login_text');display('square');
		
		findUserId();
		
		
		
	}
	return false;
}


function clickS3DB(s3db_entity, s3db_clicked_id) {
	var s3_id = s3db.core.ids[s3db_entity];
	
	
	//if(typeof(s3db_clicked_id)=='undefined'){ alert("Please select a project first");return false;}
	s3db["active"+s3db_entity]=[];
	s3db["active"+s3db_entity].ind = document.getElementById(s3db_entity+s3db_clicked_id).getAttribute("active_ind")*1;
	s3db["active"+s3db_entity][s3_id] = s3db_clicked_id;
			
	
			
	
	
	//now proceed to finding the s3db entities that inherit from this one
	if(typeof(s3db.activeU)!='undefined'){
		var user_key = s3db.U[s3db.activeU.ind].key;
	}
	else {
		var user_key = s3db.key;
	}
	//params would look something like {project_id: 123};
	var params = {};
    params[s3_id] = s3db["active"+s3db_entity][s3_id];

	
	
		if(typeof(s3db.core.inherits[s3db_entity])!='undefined'){
			for (var i=0; i<s3db.core.inherits[s3db_entity].length; i++) {
				findS3DB(user_key, s3db.core.inherits[s3db_entity][i], params);
			}
		}
		//when box is collection, trim the rules as well
		if(s3db_entity=='C'){
			var params1 = {};
			params1['subject_id'] = s3db["active"+s3db_entity][s3_id];
			var params2 = {};
			params2['object_id'] = s3db["active"+s3db_entity][s3_id];

			trimS3DB("R", params1, params2); //more than 1 params var means a union rather than an intersection
		}
	
}

function trimS3DB(s3db_entity, params1, params2){
	//more than 1 params var means a union rather than an intersection
	var mem_name = memory_varname(s3db_entity);
	var holder = s3db.core.boxes[s3db_entity];
	var s3_id = s3db.core.ids[s3db_entity];
	
	

	
	if (eval(mem_name+"."+s3db_entity)!=""){
		var complete_set =eval(mem_name+"."+s3db_entity);
		if(document.getElementById(holder).innerHTML!="") {
		//before trimming, recover the original setup
		if(document.getElementById('rules').childNodes.length!=complete_set.length){
			display_box(complete_set, s3db_entity);
		}
		
		//extract all entity ids that match the query
		var listed = [];
		for (var i=0, il=complete_set.length; i<il; i++) {
			var toRemove = true;
		
			if(typeof(params1)!='undefined'){
				
				for (var par_name in params1) {
					if(complete_set[i][par_name]==params1[par_name]){
					listed.push(complete_set[i][s3_id]);
					var toRemove  =false;
					}
				}
			}
			if(typeof(params2)!='undefined'){
				
				for (var par_name in params2) {
					if(complete_set[i][par_name]==params2[par_name]){
					listed.push(complete_set[i][s3_id]);
					var toRemove  =false;
					}
				}
			}
		//Now remove the elements ids that are not in the toUnyte list
		if(toRemove){
			remove_element_by_id (s3db_entity+complete_set[i][s3_id]);
		}
		}
		
		
		
		//Finally, remove by id those elements (divs) that do not fit the list
	   	
		}
	}
return listed;
}

function findS3DB(user_key, s3db_entity, params) {

	if(typeof(user_key)=='undefined')
		{
		user_key = s3db.key;
		}
	var s3db_element = s3db.core.entities[s3db_entity];

	if (params) {
	var where = "<where>"; //where will be build from input argummetns at s3db_entity	
		for (var x in params) {
			where +=	"<"+x+">"+params[x]+"</"+x+">";
		}
	where += "</where>";
	}
	else {
		var where = "";
	}
	//memory
	//build and eval the name of the varible that will hold information on this entity
	//display loading
	loading(s3db.core.boxes[s3db_entity], s3db.core.ids[s3db_entity]+"_loading");

	var varname = memory_varname(s3db_entity);
	var facename = varname.replace(".U[s3db.activeU.ind]","");
	if(eval("typeof("+varname+")")=='undefined') { eval(varname+"=[]");}
	if(eval("typeof("+varname+"."+s3db_entity+")")=='undefined'){
	var url2call = s3db.url+"S3QL.php?key="+user_key+"&query=<S3QL><from>"+s3db_element+"</from>"+where+"</S3QL>";
	s3db.U[s3db.activeU.ind][s3db_element+"_call"] = url2call; 
		
		//once it's found, save it
		s3dbcall(url2call, 'saveS3DB(ans, "'+s3db_entity+'")');	
		
		
	}
	else {
		//information already exists, no need for saving. 
		//if the box of this element is empty, then the next step will be to fill it; otherwise, compare and adapt the data in the boxes with the data that was requested
		eval("data="+varname+"."+s3db_entity);
		if(document.getElementById(s3db.core.boxes[s3db_entity]).childNodes.length==0 || s3db.user_id==s3db.activeU.user_id || s3db_entity=="S"){
		display_box(data, s3db_entity);
		}
		else {
		
		compareS3DB(data, s3db_entity);	
		}
	}
	
	
}

function saveS3DB(ans, s3db_entity) {
	  
	  //when user is not the same as user logging in, save it as part of that user
	  	
	  //where should the data be saved?
	  var varname = memory_varname(s3db_entity);
	  eval (varname+"."+s3db_entity+"=ans;");

	  //when user_id is the same as the parent_id, save it in as mainstream data as well
	  if(s3db.activeU.user_id==s3db.user_id){
	  var facename = varname.replace(".U[s3db.activeU.ind]","");
	  eval(facename+"."+s3db_entity+"=ans;");
	  }
	  
	  //now that data has been saved, proceed to either filling the boxes (if empty) or comparing the data in the boxes with the newly found data
	  
	  if(document.getElementById(s3db.core.boxes[s3db_entity]).childNodes.length==0 || s3db.activeU.user_id == s3db.user_id){
			display_box(ans, s3db_entity);
			}
			else {
			compareS3DB(ans, s3db_entity);	
			}
	  				
	  }

function compareS3DB(newData, s3db_entity) {
	//at this point, a box for this entity has been filled; therefore, new incoming data needs to be compared against data in teh boxes, and the latter adapted accordingly
	//remove loading
	remove_element_by_id(s3db.core.ids[s3db_entity]+"_loading");

	var s3_id  = s3db.core.ids[s3db_entity];
	var varname = memory_varname(s3db_entity);
	var facename = varname.replace(".U[s3db.activeU.ind]","");
	//these 3 share indices; same with the following 3, they are simply the vector extracted from the array
	box_ids = extract(eval(facename+"."+s3db_entity), s3_id);
	box_permission = extract(eval(facename+"."+s3db_entity), 'effective_permission');
	box_assigned = extract(eval(facename+"."+s3db_entity), 'assigned_permission');
	
	new_ids = extract(newData, s3_id);
	new_permission = extract(newData, 'effective_permission');
	new_assigned = extract(newData, 'assigned_permission');
	
	

	for (var i=0, il=box_ids.length; i<il; i++) {
			 
			var new_ind = find(new_ids, box_ids[i]);//find the index of the current box id in the retrieved ids
				if(new_ind.length>0) {
				var sl = new_permission[new_ind[0]].length;
				var al = new_assigned[new_ind[0]].length;
				}
				else {
				var sl = box_permission[i].length;
				var al = box_assigned[i].length;
				}
					
					// "assigned" permissions
					for (var a=0; a<al; a++) {//al is the size of the state
						span_id = s3db_entity+box_ids[i]+'_assigned_'+a;
						var span = document.getElementById(span_id);
						if(new_ind.length>0){
						var qi =  new_assigned[new_ind[0]][a];
						}
						else {
						var qi = "-";	
						}
						if(span){
							color_permission_square(span, qi);
						}
						else {
								var span = document.createElement('span');
								span.id = s3db_entity+new_ids[i];
								color_permission_square(span, qi);
								var tmp = document.getElementById(s3db_entity+box_ids[i]);
								if(tmp && typeof(tmp)!='undefined'){
								tmp.appendChild(span);
								}

						}
					}

					//effective permissions
					for (var s=0; s<sl; s++) {//sl is the size of the state
							//now find the state - or create it - thta reflects this user's permissions 
						span_id = s3db_entity+box_ids[i]+'_perm_'+s;
						var span = document.getElementById(span_id);
						if(new_ind.length>0){
						var pi =  new_permission[new_ind[0]][s];
						}
						else {
						var pi = "n";	
						}
						if(span){
							color_permission_square(span, pi);
						}
						else {
								var span = document.createElement('span');
								span.id = s3db_entity+new_ids[i];
								color_permission_square(span, pi);
								var tmp = document.getElementById(s3db_entity+box_ids[i]);
								if(typeof(tmp)!='undefined'){
								tmp.appendChild(span);
								}

						}
					}

				
			}

		//simlulate clicks in the box just updated, in case they are unfolded
		//	if(typeof(s3db.activeP)!='undefined'){
		//	clickS3DB("P", s3db.activeP.project_id);
		//	}
		//if(typeof(s3db.activeC)!='undefined'){
		//clickS3DB("C", s3db.activeC.collection_id);
		//}
		//if(typeof(s3db.activeR)!='undefined'){
		//clickS3DB("R", s3db.activeR.rule_id);
		//}
		//if(typeof(s3db.activeI)!='undefined'){
		//clickS3DB("I", s3db.activeI.item_id);
		//}
}

function findUserId() {
	var url2call = s3db.url+"URI.php?key="+s3db.key;
	s3db.user_call = url2call;
	s3dbcall(url2call, 'saveUserInfo(ans)');
	return false;
}
function findKey(ans) {
	if (ans[0].key_id!='' && typeof(ans[0].key_id)!='undefined') {
		s3db.key = ans[0].key_id;
		//document.getElementById('key').value = s3db.key;
		hide('login');display('login_text');display('legend');display('square');
		findUserId();
		
		
		
	}
	else {
		alert("You were not authenticated. Please try again");
	}
	return false;
}

function findProjects() {
	 url2call = s3db.url+'S3QL.php?key='+s3db.key;
	 s3db.project_call = url2call;
	 if(typeof(s3db.U[s3db.activeU.ind].P=='undefined')){
	  s3dbcall(url2call, 'document.getElementById("user_id").disabled=false;display_box(ans,"P")');
	 }	 
	 else {
			display_box(s3db.U[s3db.activeU.ind].P,'P');
			
	 }
	 return false;
}

function findUsers() {
	url2call = s3db.url+'S3QL.php?key='+s3db.key+'&query=<S3QL><from>users</from><where><created_by>'+s3db.user_id+'</created_by></where></S3QL>';
	s3db.user_call = url2call;
	s3dbcall(url2call, 'displayUsers(ans)');
	return false;
}

function clickUser() {
	//user permissions will be compared against those of opened projects
	//create a key for this user - who is the active user?
	if(document.getElementById('user_id').value){
	s3db.activeU=[];
	s3db.activeU.user_id= document.getElementById('user_id').value;
	
	if(document.getElementById('user_id').childNodes.length>0)
		//save the active project in the s3db structure	
		for (var i=0; i<document.getElementById('user_id').childNodes.length; i++) {
			if(document.getElementById('user_id').childNodes[i].selected){
			s3db.activeU.ind = i;
			break;
			}	
		}	
	
	}
	
	//key will be used to login as that user; this will only be usefull to chekc permission on resources that user can already see
	if(typeof(s3db.U[s3db.activeU.ind].key)=='undefined'){
		var url2call = s3db.url+"S3QL.php?key="+s3db.key+"&query=<S3QL><insert>key</insert><where><user_id>"+s3db.activeU.user_id+"</user_id></where></S3QL>";	
		s3db.U[s3db.activeU.ind].key_call = url2call;
		s3dbcall(url2call, 'saveUserKey(ans)');
	}
	else {
		//collections and rules that current user has in current project_id; 
		findS3DB(s3db.U[s3db.activeU.ind].key, "P");
		
		
	}
	

	return false;
}

function findStatements(id, S3DBEntity) {
   
	switch (S3DBEntity) {
	case "I":
		S3DBID = "item_id";
		s3db.activeI=[];
		s3db.activeI.item_id= id;
		s3db.activeI.ind = document.getElementById("I"+id).getAttribute("active_ind")*1;
		if(s3db.P[s3db.activeP.ind].C[s3db.activeC.ind].I[s3db.activeI.ind].S){
		ans = s3db.P[s3db.activeP.ind].C[s3db.activeC.ind].I[s3db.activeI.ind].S;
		}
	break;
	case "R":
		S3DBID = "rule_id";
		s3db.activeR=[];
		s3db.activeR.rule_id= id;
		s3db.activeR.ind = document.getElementById("R"+id).getAttribute("active_ind")*1;
		if(s3db.P[s3db.activeP.ind].R[s3db.activeR.ind].S){
		ans = s3db.P[s3db.activeP.ind].R[s3db.activeR.ind].S;
		}
		break;
	}
	
	
	//check if the ans is not already in memory
	if(typeof(ans) == 'undefined'){
	var url2call = s3db.url+'S3QL.php?key='+s3db.key+'&query=<S3QL><from>statements</from><where><'+S3DBID+'>'+id+'</'+S3DBID+'></where></S3QL>';
	//s3db.P[s3db.activeP.ind].C[s3db.activeC.ind].item_call = url2call;
	
	s3dbcall(url2call, 'display_box(ans,"S")');
	}
	else {
	display_box(ans,"S");	
	}
	return false;
}

//save routines: these are callbacks that are not necessarily displayed

function saveUserInfo(ans) {
	s3db.user_id = ans[0].user_id;
	s3db.user_info = ans;
	findUsers();
    return false;
}

//display routines: these are routines that affect the interface

function displayUsers(ans) {
	var hold = 'users';
	//clean previous data
	document.getElementById(hold).innerHTML = "";

	use = document.createElement('select');
	use.id = 'user_id';
	//use.setAttribute('onClick', 'findUserKey()');
	use.setAttribute('onClick', 'clickUser()');
	use.disabled = false;
	use.size=3;
	s3db.U=ans;
	
	//make the logged user the current user
	s3db.activeU = [];
	s3db.activeU.ind = ans.length;
	s3db.activeU.user_id = s3db.user_id;
	s3db.U[s3db.activeU.ind] = s3db.user_info[0];
	s3db.U[s3db.activeU.ind].key=s3db.key;
	
	if(ans){
		for (var i=0, u=ans.length; i<u; i++) {
			
			var opt = document.createElement('option')
			opt.value = ans[i].user_id;
			opt.innerHTML = ans[i].username+' (U'+ans[i].user_id+')';
			use.appendChild(opt);
			}

		}
	//add one entry for this user
//	var opt = document.createElement('option')
//	opt.value = s3db.user_id;
//	opt.innerHTML = s3db.user_info[0].username+' (U'+s3db.user_id+')';
//	opt.selected = true;
//	use.appendChild(opt);	

	document.getElementById(hold).appendChild(use);
	findS3DB(s3db.key, "P");
	return false;
}

function saveUserPermissions(ans){
   if(ans){
	s3db.P[s3db.activeP.ind].U = ans;
   }
}

function saveUserKey(ans) {
	if(ans[0].key_id){
	s3db.U[s3db.activeU.ind].key = ans[0].key_id;
	
	findS3DB(ans[0].key_id, "P");
	
	}
}

function display_box(ans,S3DB_Entity) {
	   ClickColor = "#333366"
	   MovColor = "#33FF66";
	   MoffColor = "blue";
		
		//remove loading
		remove_element_by_id(s3db.core.ids[S3DB_Entity]+"_loading");
		
		var hold = s3db.core.boxes[S3DB_Entity];
		var S3DB_ID = s3db.core.ids[S3DB_Entity];
		var S3DBLabel = s3db.core.labels[S3DB_Entity];
				
	    var memholder = memory_varname(S3DB_Entity);
		
		if(typeof(eval(memholder+"."+S3DB_Entity))=='undefined'){
		eval(memholder+"."+S3DB_Entity+"=ans");
		var data = ans;
		}
		else {
			var data = eval(memholder+"."+S3DB_Entity)
		}

		//if user_id equals active user, then save also in the s3db portion that manages the interface
		if(s3db.activeU.user_id==s3db.user_id){
		var faceholder = memholder.replace('.U[s3db.activeU.ind]', '');
		eval (faceholder+"."+S3DB_Entity+"=ans");
		}


	   //Clean previous data first
		document.getElementById(hold).innerHTML = "";

	   
		if(data){
				
				for (var i=0, u=data.length; i<u; i++) {
					opt = document.createElement('div');
					opt.id = S3DB_Entity+data[i][S3DB_ID];
					opt.setAttribute("s3db_entity", S3DB_Entity);
					opt.setAttribute("s3db_id", data[i][S3DB_ID]);
					opt.setAttribute("active_ind", i);
					opt.setAttribute(S3DB_ID, data[i][S3DB_ID]);
					opt.setAttribute('onMouseOver', 'if(this.getAttribute("clicked")!="true") {this.style.color="'+MovColor+'"}');
					//opt.setAttribute('onClick', funct+"("+data[i][S3DB_ID]+", '"+S3DB_Entity+"'); this.style.color='"+ClickColor+"';this.setAttribute('clicked', 'true')");
					opt.setAttribute('onClick', "clickS3DB('"+S3DB_Entity+"', '"+data[i][S3DB_ID]+"'); this.style.color='"+ClickColor+"';this.setAttribute('clicked', 'true')");
					opt.setAttribute('onMouseOut', 'if(this.getAttribute("clicked")!="true") {this.style.color="'+MoffColor+'"}');
					
					//new span for effective colors
					//new span for assigned colors
					q =  data[i]['assigned_permission'];
					for (var k=0, kl=q.length; k<kl; k++) {//until the end of the state size
							
						qi= q[k].match(/^y|n|s|-/i);
						var span = document.createElement('span');
						span.id = opt.id+"_assigned_"+k;
						color_permission_square(span, qi);
						opt.appendChild(span);
					}
					
					
					//put a span between the two to distinguish
					var clutter = document.createElement('span');
					clutter.id = 'perm_clutter';
					clutter.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
					opt.appendChild(clutter);

					p =  data[i]['effective_permission'];
					for (var j=0, k=p.length; j<k; j++) {//until the end of the state size
							
						pi= p[j].match(/^y|n|s|-/i);
						var span = document.createElement('span');
						span.id = opt.id+"_perm_"+j;
						color_permission_square(span, pi);
						opt.appendChild(span);
					}

					document.getElementById(hold).appendChild(opt);
					
					//span to separate text from colors
					span = document.createElement('span');
					span.innerHTML = '&nbsp;&nbsp;&nbsp;';
					opt.appendChild(span);


					//create a span for the text
					var span = document.createElement('span');
					
					if(S3DBLabel.length==1){
					span.innerHTML = S3DB_Entity+data[i][S3DB_ID]+" ("+data[i][S3DBLabel]+")";
					}
					else {
						var tmp = "";
						for (var Li=0; Li<S3DBLabel.length; Li++) {
							tmp +=  data[i][S3DBLabel[Li]]+" ";
						}
						
						span.innerHTML = S3DB_Entity+data[i][S3DB_ID]+" ("+tmp+")";
					}
					 opt.appendChild(span);
					
				}
			
		}
		return false;
}

//neat little interface functions; they will be usefull for other interfaces
function display_other() {
	if (document.getElementById('url').value=='other') {
		document.getElementById('url_other').style.display='inline';
	}
	else {
		document.getElementById('url_other').style.display='none';	
	}
}

function clean_default(divId, def) {
	if (document.getElementById(divId).value===def) {
		document.getElementById(divId).value = "";
	}
}

function putTheImageInTheMiddle() {
   win = window.innerWidth;
   hei = window.innerHeight;
   
	document.getElementById('blue_grad').width=win;
	document.getElementById('square').width=win/1.5;
	document.getElementById('square').height=hei;
    document.getElementById('collections').height = (hei/2)-10;
	document.getElementById('rules').height = (hei/2)-10;

}
function hide(div) {
	document.getElementById(div).style.display='none';
}

function display(div) {
	document.getElementById(div).style.display='inline';
}

function checkForm() {
	if ((document.getElementById('username').value && document.getElementById('password').value) || document.getElementById('key').value) {
		if(document.getElementById('url').value!='other' || document.getElementById('url_other').value){
		document.getElementById('go').style.display = 'inline';
		}
		}
}
 function color_permission_square(span, pi) {
		if(pi=='y' || pi=='Y'){
		span.setAttribute("style", "background-color: green");
		
		}
		else if(pi=='s' || pi=='S'){
		span.setAttribute("style", "background-color: yellow");
		}
		else if(pi=='n' || pi=='N'){
		span.setAttribute("style", "background-color: red");
		}
		else if(pi=='-'){
		span.setAttribute("style", "background-color: silver");
		}
		span.setAttribute("class", "permission_spans");
		span.innerHTML = "&nbsp;"+pi+"&nbsp;";	
		return span;
		}
						
						
						
function memory_varname(s3db_entity) {
			
		var tmp = [];
		p=s3db_entity;
		var varname = "s3db.";
			while (typeof(s3db.core.prev[p])!='undefined') {
				
				var prev = s3db.core.prev[p];
				if(prev.length==1){ var p = prev[0]; }
				else { 
					if(typeof(s3db["active"+prev[0]])=='undefined')
						{ var p = prev[1];
					}
					else { 
						var p = prev[0];
					}
				}
				tmp.push(p);
					
				
			}
		
		for (var i=(tmp.length-1); i>=0; i--) {
			varname += tmp[i]+"[s3db.active"+tmp[i]+".ind]";
			if(i!=0) {
			varname += ".";
			}
		}
		//varname += "."+s3db_entity;
		return varname;
}						
//other, general scope array manipulating functions
function intersect(a,b) {
	var c=[];
	for (var i=0; i<a.length; i++) {
		for (var j=0; j<b.length; j++) {
			if(a[i]==b[j]){
			c.push(b[j]);
			}
		}
	}
	return c;
}

function union(dataset1, dataset2) {
	 for (var i=0; i<dataset2.length; i++) {
		dataset1.push(dataset2[i]);
	 }
	 return dataset1;
}

function extract(arr, key) {
	var a = [];
	if(typeof(arr)!='undefined'){
	for (var j=0; j<arr.length; j++) {
		for (var i in arr[j]) {
			if(i==key){
			a.push(arr[j][i]);
			}
		}
	}
	}
	return a;
}

function find(arr, val) {
	var a = [];
	for (var i in arr) {
		if(arr[i]==val){
		a.push(i);
		}
	}
	return a;
}

function loading(parent_span, id) {
	var load = document.createElement('div');
	load.id = id;
	var imag = document.createElement('img');
	imag.src = 'blue_loading.gif';
	load.appendChild(imag);
	document.getElementById(parent_span).appendChild(load);
	return load;
}
