//quadrado.js is an exercise in ubilding an interface that displays only the permission that the user that has been chosen has on the project that has been selected

function trigger_s3db() {
	s3db = {};
	s3db.url = document.getElementById('url').value;
	if(!s3db.url || s3db.url=='other'){
		s3db.url = document.getElementById('url_other').value;
		if (!s3db.url.match(/\/$/)) {
			s3db.url+='/';
			document.getElementById('url_other').value = url;
		}
	}
	
	s3db.key = document.getElementById('key').value;
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
		findProjects();
		findUsers();
	}
	return false;
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
		hide('login');display('login_text');display('square');
		findUserId();
		findProjects();
		findUsers();
	}
	else {
		alert("You were not authenticated. Please try again");
	}
	return false;
}

function findProjects() {
	 url2call = s3db.url+'S3QL.php?key='+s3db.key;
	 s3db.project_call = url2call;
	 s3dbcall(url2call, 'displayProjects(ans);');
	 return false;
}

function findUsers() {
	url2call = s3db.url+'S3QL.php?key='+s3db.key+'&query=<S3QL><from>users</from></S3QL>';
	s3db.user_call = url2call;
	s3dbcall(url2call, 'displayUsers(ans)');
	return false;
}

function findUserKey() {
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
		if(typeof(s3db.U[s3db.activeU.ind].P)=='undefined'){
		s3db.U[s3db.activeU.ind].P = [];
		s3db.U[s3db.activeU.ind].P[s3db.activeP.ind] = [];
		}
		findS3DB(s3db.U[s3db.activeU.ind].key,"C");
		findS3DB(s3db.U[s3db.activeU.ind].key,"R");
		
	}
	
	
	return false;
}

function findS3DB(user_key, s3db_entity, params) {

		switch (s3db_entity) {
		case "U":
			var s3db_element = 'user';
			
			
		break;
		case "P":
		var s3db_element = 'project';
			if(document.getElementById('project_id').value){
			s3db.activeP=[];
			s3db.activeP.project_id = document.getElementById('project_id').value;
			
			if(document.getElementById('project_id').childNodes.length>0)
				//save the active project in the s3db structure	
				for (var i=0; i<document.getElementById('project_id').childNodes.length; i++) {
					if(document.getElementById('project_id').childNodes[i].selected){
					s3db.activeP.ind = i;
					break;
					}	
				}	
			
			}
		break;
		
		case "C":
		var s3db_element = 'collection';	
		var funct = "display_box()";
		break;
		
		case "R":
		var s3db_element = 'rule';	
		break;
		
		case "I":
		var s3db_element = 'item';	
		break;
		
		case "S":
		var s3db_element = 'statement';	
		break;
		}

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

		var url2call = s3db.url+"S3QL.php?key="+user_key+"&query=<S3QL><from>"+s3db_element+"</from>"+where+"</S3QL>";
		s3db.U[s3db.activeU.ind][s3db_element+"_call"] = url2call; 
		s3dbcall(url2call, "saveS3DB(ans, '"+s3db_entity+"')");

	}

function findCollectionsAndRules(user_key) {
	if(typeof(user_key)=='undefined'){
		user_key = s3db.key;
	}

	if(document.getElementById('project_id').value){
	s3db.activeP=[];
	s3db.activeP.project_id = document.getElementById('project_id').value;
	
	if(document.getElementById('project_id').childNodes.length>0)
		//save the active project in the s3db structure	
		for (var i=0; i<document.getElementById('project_id').childNodes.length; i++) {
			if(document.getElementById('project_id').childNodes[i].selected){
			s3db.activeP.ind = i;
			break;
			}	
		}	
	
	}
	
	//depending on who is asking the question, either the user that created other users, or the role of that user, the behavior of box display will be different
	
	//memory
	if(s3db.P[s3db.activeP.ind].C){
	ans = s3db.P[s3db.activeP.ind].C;
	display_box(ans,"C");
	
	}
	else {
	var url2call = s3db.url+'S3QL.php?key='+user_key+'&query=<S3QL><from>collections</from><where><project_id>'+s3db.activeP.project_id+'</project_id></where></S3QL>';
	s3db.P[s3db.activeP.ind].collection_call = url2call;
	//s3dbcall(url2call, 'displayCollections(ans)');
	s3dbcall(url2call, 'display_box(ans,"C")');
	}
	
	//now the rules
	if(s3db.P[s3db.activeP.ind].R){
	
	ans = s3db.P[s3db.activeP.ind].R;
	display_box(ans,"R");
	
	}
	else {
	
	var url2call = s3db.url+'S3QL.php?key='+user_key+'&query=<S3QL><from>rules</from><where><project_id>'+s3db.activeP.project_id+'</project_id></where></S3QL>';
	s3db.P[s3db.activeP.ind].rule_call = url2call;
	
	//s3dbcall(url2call, 'displayRules(ans)');
	s3dbcall(url2call, 'display_box(ans,"R")');
	
	}
	return false;
}

function findItems(collection_id) {

	if(collection_id){
	s3db.activeC=[];
	s3db.activeC.collection_id = collection_id;
	s3db.activeC.ind = document.getElementById("C"+collection_id).getAttribute("active_ind")*1;
	//save the active collection in the s3db structure	
	}

	//memory 
	if(s3db.P[s3db.activeP.ind].C[s3db.activeC.ind].I){
	ans = s3db.P[s3db.activeP.ind].C[s3db.activeC.ind];
	display_box(ans,"I");
	}
	else {
	var url2call = s3db.url+'S3QL.php?key='+s3db.key+'&query=<S3QL><from>items</from><where><collection_id>'+s3db.activeC.collection_id+'</collection_id></where></S3QL>';
	s3db.P[s3db.activeP.ind].C[s3db.activeC.ind].item_call = url2call;
	s3dbcall(url2call, 'display_box(ans,"I")');
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

function saveS3DB(ans, s3db_entity) {
	  //when user is not the same as user logging in, save it as part of that user
	  if(s3db.activeU.user_id!=s3db.user_id){
	  	switch (s3db_entity) {
			case "P":
				s3db.U[s3db.activeU.ind].P = ans;
				break;
			case "C":
				s3db.U[s3db.activeU.ind].P[s3db.activeP.ind].C = ans;
				//now compare these against those that were retrieved for parent user_id and change it in the boxes
			    s3_id = 'collection_id';
				box_ids = extract(s3db.P[s3db.activeP.ind].C, s3_id);
				box_permission = extract(s3db.P[s3db.activeP.ind].C, 'effective_permission');
				new_ids = extract(s3db.U[s3db.activeU.ind].P[s3db.activeP.ind].C, s3_id);
				new_permission = extract(s3db.U[s3db.activeU.ind].P[s3db.activeP.ind].C, 'effective_permission');
				
			break;
			case "R":
				s3db.U[s3db.activeU.ind].P[s3db.activeP.ind].R = ans;	
				s3_id = 'rule_id';
				box_ids = extract(s3db.P[s3db.activeP.ind].R, s3_id);
				box_permission = extract(s3db.P[s3db.activeP.ind].R, 'effective_permission');
				new_ids = extract(s3db.U[s3db.activeU.ind].P[s3db.activeP.ind].R, s3_id);
				new_permission = extract(s3db.U[s3db.activeU.ind].P[s3db.activeP.ind].R, 'effective_permission');
			break;
			case "I":
				s3db.U[s3db.activeU.ind].P[s3db.activeP.ind].C[s3db.activeC.ind].I = ans;	
			break;
			case "S":
			if(typeof(s3db.activeI.ind)!='undefined')
				{
				s3db.U[s3db.activeU.ind].P[s3db.activeP.ind].C[s3db.activeC.ind].I[s3db.activeI.ind].S = ans;
				}
			else if (typeof(s3db.activeR.ind)!='undefined') {
				s3db.U[s3db.activeU.ind].P[s3db.activeP.ind].R[s3db.activeR.ind].S = ans;
			}
			break;
			
		}
	  for (var i=0, il=box_ids.length; i<il; i++) {
			//var tmp = document.getElementById(s3db_entity+new_ids[i]); 
			var new_ind = find(new_ids, box_ids[i]);//find the index of the current box id in the retrieved ids
				if(new_ind.length>0) {
				var sl = new_permission[new_ind[0]].length;
				}
				else {
				var sl = box_permission[i].length;
				}
						//find the permissions
					for (var s=0; s<sl; s++) {//sl is the size of the state
							//now find the state - or create it - thta reflects this user's permissions 
						span_id = s3db_entity+new_ids[i]+'_perm_'+s;
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
								tmp.appendChild(span);

						}
					}
				
				
			}
				
	  }
	  else {
		switch (s3db_entity) {
			case "P":
				s3db.P = ans;
				break;
			case "C":
			s3db.P[s3db.activeP.ind].C = ans;	
			break;
			case "R":
			s3db.P[s3db.activeP.ind].R = ans;	
			break;
			case "I":
			s3db.P[s3db.activeP.ind].C[s3db.activeC.ind].I = ans;	
			break;
			case "S":
			if(typeof(s3db.activeI.ind)!='undefined')
				{
				s3db.P[s3db.activeP.ind].C[s3db.activeC.ind].I[s3db.activeI.ind].S = ans;
				}
			else if (typeof(s3db.activeR.ind)!='undefined') {
				s3db.P[s3db.activeP.ind].R[s3db.activeR.ind].S = ans;
			}
			break;
			
		}
	  }
}

function saveUserInfo(ans) {
	s3db.user_id = ans[0].user_id;
	s3db.user_info = ans;
    return false;
}

//display routines: these are routines that affect the interface

function displayProjects(ans) {

	proj = document.createElement('select')
	hold = 'projects';
	proj.id = 'project_id';
	proj.setAttribute('onClick','document.getElementById("user_id").disabled=false;findCollectionsAndRules()');
	proj.size="3";

	//clean previous data
	document.getElementById(hold).innerHTML = "";

	s3db.P = [];
	for (var i=0, l=ans.length; i<l; i++) {
		s3db.P[i] = ans[i]; 
		opt = document.createElement('option');
		opt.value = ans[i].project_id;
		opt.innerHTML = ans[i].name+" (P"+ans[i].project_id+")";
		proj.appendChild(opt);
	}
	document.getElementById(hold).appendChild(proj);
	return false;

}

function displayUsers(ans) {
	var hold = 'users';
	//clean previous data
	document.getElementById(hold).innerHTML = "";

	use = document.createElement('select');
	use.id = 'user_id';
	use.setAttribute('onClick', 'findUserKey()');
	use.disabled = true;
	s3db.U=ans;
	s3db.roles=[];
	if(ans){
		for (var i=0, u=ans.length; i<u; i++) {
			//when user wwas created by this user, he is one of his roles
			if(ans[i].created_by==s3db.user_id){
			s3db.roles.push(ans[i]);
			}
			opt = document.createElement('option')
			opt.value = ans[i].user_id;
			opt.innerHTML = ans[i].username+' (U'+ans[i].user_id+')';
			use.appendChild(opt);
		}
	}
	document.getElementById(hold).appendChild(use);
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
	//collections and rules that current user has in current project_id; 
		if(typeof(s3db.U[s3db.activeU.ind].P)=='undefined'){
		s3db.U[s3db.activeU.ind].P = [];
		s3db.U[s3db.activeU.ind].P[s3db.activeP.ind] = [];
		}
		findS3DB(ans[0].key_id,"C", {project_id:s3db.activeP.project_id});
		findS3DB(ans[0].key_id,"R", {project_id:s3db.activeP.project_id});
	}
}

function display_box(ans,S3DB_Entity) {
	   ClickColor = "#333366"
	   MovColor = "#33FF66";
	   MoffColor = "blue";
		 
		switch (S3DB_Entity) {
	    case "C":
		   
	   //display them inside their square, on top of the picture
		hold="collections";
		funct = 'findItems';
		S3DB_ID = "collection_id";
		
		if(!s3db.P[s3db.activeP.ind].C){
		s3db.P[s3db.activeP.ind].C=ans;
		var data = ans;
		}
		else {
			var data = s3db.P[s3db.activeP.ind].C;
		}

		S3DBLabel = ["name"];
		break;
	   case "R":
		hold="rules";
		funct = 'findStatements';
		S3DB_ID = "rule_id";
		if(!s3db.P[s3db.activeP.ind].R){
		s3db.P[s3db.activeP.ind].R=ans;
		var data = ans;
		}
		else {
			var data = s3db.P[s3db.activeP.ind].R;
		}
		
		S3DBLabel = ["subject","verb","object"];
	   break;
	   case "I":
		    hold="items";
			funct = 'findStatements';
			S3DB_Entity = "I";
			S3DB_ID = "item_id";
			
			if(!s3db.P[s3db.activeP.ind].C[s3db.activeC.ind].I){
			s3db.P[s3db.activeP.ind].C[s3db.activeC.ind].I=ans;
			var data = ans;
			}
			else {
				var data = s3db.P[s3db.activeP.ind].C[s3db.activeC.ind].I;
			}
			S3DBLabel = ["notes"];
			break;
	   case "S":
		    hold="statements";
			funct = '';
			S3DB_Entity = "S";
			S3DB_ID = "statement_id";
			if(s3db.activeR)
		    {
				
				if(!s3db.P[s3db.activeP.ind].R[s3db.activeR.ind].S){
				s3db.P[s3db.activeP.ind].R[s3db.activeR.ind].S=ans;
				var data = ans;
				}
				else {
					var data = s3db.P[s3db.activeP.ind].R[s3db.activeR.ind].S;
				}
			}
			else if (s3db.activeI) {
			
				
				if(!s3db.P[s3db.activeP.ind].C[s3db.activeC.ind].I[s3db.activeI.ind].S){
				s3db.P[s3db.activeP.ind].C[s3db.activeC.ind].I[s3db.activeI.ind].S=ans;
				var data = ans;
				}
				else {
					var data = s3db.P[s3db.activeP.ind].C[s3db.activeC.ind].I[s3db.activeI.ind].S;
				}		
			}
			
			S3DBLabel = ["value"];
		   break;
	   
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
					opt.setAttribute('onClick', funct+"("+data[i][S3DB_ID]+", '"+S3DB_Entity+"'); this.style.color='"+ClickColor+"';this.setAttribute('clicked', 'true')");
					opt.setAttribute('onMouseOut', 'if(this.getAttribute("clicked")!="true") {this.style.color="'+MoffColor+'"}');
					
					//new span for colors
					p =  data[i]['effective_permission'];
					for (var j=0, k=p.length; j<k; j++) {//until the end of the state size
							
						pi= p[j].match(/^y|n|s/i);
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
			span.setAttribute("style", "background-color: green; border: 1px solid blue");
		}
						else if(pi=='s' || pi=='S'){
						span.setAttribute("style", "background-color: yellow; border: 1px solid blue");
						}
						else if(pi=='n' || pi=='N'){
						span.setAttribute("style", "background-color: red; border: 1px solid blue");
						}
						span.innerHTML = "&nbsp;"+pi+"&nbsp;";	
		return span;
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

function extract(arr, key) {
	var a = [];
	for (var j=0; j<arr.length; j++) {
		for (var i in arr[j]) {
			if(i==key){
			a.push(arr[j][i]);
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