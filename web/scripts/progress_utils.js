function showProgress(title, message,imgSrc,width){

	var _width = width;
	if(!_width){
		_width = "600";
	}
	
	var body = document.getElementsByTagName("body")[0];
    var div = document.createElement("div");

    var img = document.createElement("img");
    img.style.verticalAlign = "bottom";
    if(imgSrc)
    	img.src = imgSrc;
    else
    	img.src = "web/images/progressing.gif";
    
    div.appendChild(img);
    
    var labelDiv = document.createElement("div");
    div.appendChild(labelDiv);
    var label = document.createElement("label");
    $(label).text(message);
    div.title = title;
    div.style.display = "none";
    div.id = "pro_diva45b6";
    div.align = "center";
    labelDiv.appendChild(label);
    
    body.appendChild(div);
    
    $(div).dialog({ modal:true,
    	closeOnEscape: false,
        position: [($(window).width() / 2) - (_width / 2), 150],
        width : _width,
        open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); }
    });
    
  
}


function closeProgress(){
	
	
	$('#pro_diva45b6').dialog("close" , function(){
		
		$('#pro_diva45b6').empty();
	});
	
	$("#pro_diva45b6").remove();
	
}