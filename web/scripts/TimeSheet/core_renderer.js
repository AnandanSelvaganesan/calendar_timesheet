
var _activeSR = []; 
var _arrActiveSR = [];
var _sheetType = "ACTIVE_SR_SHEET";
var _timeSheetData;
var _isDataSubmited = false;
var _sDate; // selected date from calendar;
var _srCount = 0;
var _currentDateCal;
var _dCal;
var _mCal;
var _yMonthly = new Date().getFullYear();
var _isSubmitted = false;
var _dataObj = {};
var _effortData = [];
var _dayEvents = [];
var empNames = new Object();  
// initiating the calendar here
$(function(){
	initiateTimeSheet();
	$.mask.definitions['~'] = "[+-]";
});
 

function showMonthlyViewLedgend(){
	
	var baseElement = document.getElementById("legend_help");
	$(baseElement).dialog({ 
		  modal:true,
			width: 250,
			title:"Status Legend",					
			closeOnEscape:true,
			position: [($(window).width() / 2) - (250 / 2), 150],
			open: function(event, ui) { $(".ui-dialog-titlebar-close").show(); },
				close: function(event,ui){
					$( this ).dialog( "close" );
					
				}

		});
}
function showAlertDialog(baseElement, titleMes, message){
	
	if(titleMes == "")
		titleMes = "Message";
	
	var div = document.createElement("div");
	$(div).attr('style','font-size: 14px;');
	$(div).attr('class','m-t-10 text-center');
	$(div).attr('id','message-Element');
	$(baseElement).append(div);		
	$(div).html(message);
	
	// var baseElement = document.getElementById("legend_help");
	$(baseElement).dialog({ 
			resizable: false,
		    modal:true,
		    width: 600,
			title: titleMes,					
			closeOnEscape: false,
			position: [($(window).width() / 2) - (600 / 2), 150],
			open: function(event, ui) { $(".ui-dialog-titlebar-close").show(); },
				close: function(event,ui){
					$( this ).dialog( "close" );
					$(baseElement).empty();
					
				}

		});
} 
function showConfirmDailog(baseElement, titleMes, message){
	
	if(titleMes == "")
		titleMes = "Message";
	
	var div = document.createElement("div");
	$(div).attr('style','font-size: 14px;');
	$(div).attr('class','m-t-10 text-center');
	$(div).attr('id','message-Element');
	$(baseElement).append(div);		
	$(div).html(message);
	
	$(baseElement).dialog({ 
		resizable: false,
	    modal:true,
	    width: 600,
		title: titleMes,					
		closeOnEscape: false,
		position: [($(window).width() / 2) - (600 / 2), 150],
		open: function(event, ui) { $(".ui-dialog-titlebar-close").show(); },
		buttons: [{
			text: "No",
            "class": 'btn btn-default btn-sm',
            click: function() {
				$(this).dialog( "destroy" );
				$(baseElement).empty();
				return false;
			}
		},{
			 text: "Yes",
             "class": 'btn btn-success btn-sm',
              click: function() {
            	
            	$(this).dialog("destroy");
				$(baseElement).empty();
				submitTimeSheet();
				return true;
			}
		}],
		close: function(event,ui){
			$(this).dialog( "destroy" );
			$(baseElement).empty();
			return false;
		}
	});

	return false;
}

function initiateTimeSheet(month, year){
	_currentDateCal = new Date();
	_dCal = _currentDateCal.getDate();
	_mCal = _currentDateCal.getMonth();
	if(month || month == 0)
		_mCal = month; 
	_yCal = _currentDateCal.getFullYear(); 
	if(year)
		_yCal = year; 
	
	 _currentDateCal = new Date(_yCal, _mCal, 1);
	
	loadSRNumbers();
	loadTimeSheets();
	loadEffortTypes();
	loadMonthlyTimeSheets(); 

}
 
function loadTimeSheets(){

	var reqURL = "web/getTimeSheetDataEmployeeTimeSheet.json";
	//var reqURL = "TimeSheet.do?method=getTimeSheetData&key=EMPLOYEE_TIME_SHEET&user_id=" + _userId ;
	var paramObj = {};
	paramObj['MONTH'] = _mCal + 1; 
	
	var jsonString = JSON.stringify(paramObj);
	
	$.ajax({ 
		 type: 'GET',
	 	 dataType: "json",
	  	 url: reqURL,
	  	 data: {"param": jsonString, "timeStamp" : new Date().getTime()},
	 	 success:function(result){ 
	 		if(result && result['data']){  
	 			_timeSheetData = result['data']; 
	 			
	 			$('#defaulter_count').html(result['defaulter_count']);
	 			
	 			if(_sheetType == "TIME_SHEET")
	 				createCalendar(_timeSheetData);
	 			else
	 				loadActiveSRSheets(_timeSheetData);
			}
	}});	 
	
}
 

function loadActiveSRSheets(timeSheetData){

	var reqURL = "web/getActiveUserSRs.json";
	//var reqURL = "TimeSheet.do?method=getActiveUserSRs&emp_num=" + _empId;
	
	$.ajax({ 
		 type: 'GET',
	 	 dataType: "json",
	  	 url: reqURL,
	  	 data: {"timeStamp" : new Date().getTime()},
	 	 success:function(result){ 
	 		if(result && result['data']){  
	 			_dataObj = result['data'];
	 			_activeSRObjects = _dataObj;
	 			if(_sheetType == "ACTIVE_SR_SHEET"){ 
	 				_dataObj = mergeCustomData(_dataObj, timeSheetData); 
	 				createCalendar(_dataObj, _currentDateCal);
	 				// loadPrevCalendar(_dataObj, _mCal-1);
	 			}
			}
	}});	 
	
}	


function createCalendar(timeEvents, d){ 
	
	var calendar = $('#calendar').fullCalendar({
		schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
		header: {
			left: 'title',
			center: '',
			right: '' 
		}, 
		resources: timeEvents['resourceEvents'],
		eventSources: timeEvents['customEvents'], 
		editable: true,
		/* now: '2017-02-17', */
		eventRender: function (event, element, view) {
			
			// ignored for day view since it only sees 1 date (no overlap across
			// days of different months)
	        // ignored for week view since we want to see events which appears
			// in 2 different months (overlap)
	        // this will only be triggered in initialization or when view is
			// changed to month view to hide events from other months
	        if(view.name == "month") {
	            if(event.start._i.split("-")[1] != getMonthFromString(view.title.split(" ")[0])) {
	                return false;
	            }
	        }
	        
			event.editable = false;
			element.removeClass('fc-draggable');
			element.addClass('default-cursor');
			
			if(event['effort'] != undefined){
				
				var dataToFind = moment(event.start).format('YYYY-MM-DD');
				
				if(!document.getElementById("total-time-" + event['start'])){ 
					
					element.addClass('hide');
					
					var spanleft = document.createElement("span");
			        $(spanleft).attr("class","fc-total-hrs");
			        $(spanleft).attr("id", "total-time-" + event['start']);
			        $(spanleft).html("<i class='glyphicon glyphicon-time'></i> " + event['title']); 
			        
			       if(event["status"] == "S"){ 
			        	
			        	 // $(spanleft).html("<i class='fa fa-check'></i> " +
							// "<i class='glyphicon glyphicon-time'></i> " +
							// event['title']);
			        	 $(".fc-bg td[data-date='"+dataToFind+"']").addClass('effort-active');
			        	 
			        }
			        
			        
			        $("td.fc-day-bottom[data-date='"+dataToFind+"']").append(spanleft); 
			        
				} 
			}
			
		},
		eventAfterAllRender:function( view ) { 
			// console.log(view);
		},
		
		dayClick: function (date,jsEvent, view) {
			
			$('#eventTitle').val(""); 
			showTimeSheetForm(date,this, jsEvent, view['options']['eventSources'][0]['events']); 
			
		},
		dayRender: function (date, cell) {  
			
			var maxDate = moment(new Date()).format('YYYY-MM-DD');
			var renderDate = moment(date).format('YYYY-MM-DD'); 
			var isValidDate = moment(renderDate).isAfter(maxDate);
		    
		    if(isValidDate){
		    	$("td.fc-day-top[data-date='"+renderDate+"']").addClass('disabled-add-btn');
		    }
		    
		   
	    }, 
		viewRender: function(view, date, allDay, jsEvent) { 
					 	
	        var spanleft = document.createElement("span");
	        $(spanleft).attr("class","fc-action-btn"); 
	        var addbtn = document.createElement("a");
	        $(addbtn).attr("class","btn btn-xxxs btn-success m-3 custom-add-btn");
	        $(addbtn).attr("href","javascript:void(0);");
	        $(addbtn).html("<i class='glyphicon glyphicon-plus p-l-1 custom-i-element'></i>");  
	        $(spanleft).append(addbtn);
	        $(".fc-day-top").prepend(spanleft);  
	       
	    }
		
	}); 
	
	$('#calendar').fullCalendar( 'gotoDate', d );
	
	if(_isDataSubmited){
		var dateFormat = moment(_sDate).format('YYYY-MM-DD'); // '2017-02-18';
		renderSelectedDate(dateFormat);
	}

    if(isMonthDataSubmitted()){
    	$('#submit_time_sheet_id').attr("disabled", true);
    	$('#show_exp_list_id').attr("disabled", false);
    	
    }else{
    	$('#submit_time_sheet_id').attr("disabled", false); 
    	$('#show_exp_list_id').attr("disabled", true);
    }
    	
	
}
function getMonthFromString(mon){
    var d = Date.parse(mon + " 1, "+ _yCal);
    if(!isNaN(d))
        return new Date(d).getMonth() + 1;
    return -1;
}
function renderSelectedDate(date) { 
    // var today = $('td.fc-today');
    var today = $("td.fc-day-top[data-date='"+ date +"']");
    var down = new $.Event("mousedown");
    var up = new $.Event("mouseup");
    down.which = up.which = 1;
    down.pageX = up.pageX = today.offset().left+1;
    down.pageY = up.pageY = today.offset().top+1;
    today.trigger(down);
    today.trigger(up); // this is optional if you just want the dayClick event,
						// but running this allows you to reset the 'clicked'
						// state of the <td>
}

function mergeCustomData(events, customDataArr){
	
	var timeEvents = {};
	
	var mergedEvents = [];
	
	var resourceEvents = [];
	
	var customEventsArr = []; 
	
	if(customDataArr && customDataArr.length > 0){
		
		var customEvents = {}; 
		
		var oldDate = "";
		
		var totalTravelTime = new Date(0, 0, 0, 0, 0, 0, 0);
		
		var oldCustomDataEvent = {};
		
		for(var int = 0; int < customDataArr.length; int++){
			
			var customDataEvent = customDataArr[int];
			
			for (var int1 = 0; int1 < events.length; int1++){
				
				var event = events[int1];
				
				if(event['sr_no'] == customDataEvent['sr_no'] && event['start'] == customDataEvent['start']){
					event['time_sheet_id'] = customDataEvent['time_sheet_id'];
				}
				
			}
			
			if(int != 0 && customDataEvent && customDataEvent['start'] != oldDate){
				
				oldCustomDataEvent['id'] = oldCustomDataEvent['id'] + "-" + oldCustomDataEvent['start'];
				oldCustomDataEvent['resourceId'] = oldCustomDataEvent['id'];
				customEventsArr.push(oldCustomDataEvent);
				var resourceEvent = createResourceEvent(oldCustomDataEvent);
				if(resourceEvent)
					resourceEvents.push(resourceEvent); 
				
				totalTravelTime = new Date(0, 0, 0, 0, 0, 0, 0);
				oldCustomDataEvent = {};
			} 
			
			
			if(customDataEvent['effort']){
				totalTravelTime = calculateTime(customDataEvent['effort'], ":", totalTravelTime); 
			}if(customDataEvent['travel_time']){
				totalTravelTime = calculateTime(customDataEvent['travel_time'], ":", totalTravelTime); 
			} 
			
			customDataEvent['title'] = formatHours(totalTravelTime) + ":" + formatTime(totalTravelTime.getMinutes())  + " hrs";  
			oldDate = customDataEvent['start']; 
			
			if(oldCustomDataEvent && oldCustomDataEvent['start'] == customDataEvent['start'] 
				&& customDataEvent['sr_key'] && customDataEvent['sr_key'] == "current")
				oldCustomDataEvent = customDataEvent;
			else if(oldCustomDataEvent && oldCustomDataEvent['start'] != customDataEvent['start'] )
				oldCustomDataEvent = customDataEvent;
			
			
			oldCustomDataEvent['title'] = customDataEvent['title'];
		}
		
		if(!$.isEmptyObject(oldCustomDataEvent)){
			oldCustomDataEvent['id'] = oldCustomDataEvent['id'] + "-" + oldCustomDataEvent['start'];
			oldCustomDataEvent['resourceId'] = oldCustomDataEvent['id'];
			customEventsArr.push(oldCustomDataEvent);
			var resourceEvent = createResourceEvent(oldCustomDataEvent);
			if(resourceEvent)
				resourceEvents.push(resourceEvent);
			
		}

	} 
	
	if(events){
		
		var originalEvents = {};
		
		originalEvents['events'] = events; 
		
		mergedEvents.push(originalEvents);
		
		if(customEventsArr && customEventsArr.length > 0){
			customEvents['events'] = customEventsArr; 
			mergedEvents.push(customEvents);
		}  
		
	}
	
	if(mergedEvents && mergedEvents.length > 0){
		timeEvents['customEvents'] = mergedEvents;
		if(resourceEvents && resourceEvents.length > 0)
			timeEvents['resourceEvents'] = resourceEvents;
	}
	
	return timeEvents;
}


function calculateTime(time, splitter, totalTime){
	
	var baseDt = new Date(0, 0, 0, 0, 0, 0, 0);
	
	if(!totalTime)
		totalTime = new Date(0, 0, 0, 0, 0, 0, 0);
	if(time){
		var timeHM = time.split(splitter);
		
		var timeDt = new Date(0, 0, 0, 0, 0, 0, 0);
		
		if(timeHM[0] && timeHM[1]){
		
			timeDt.setHours(timeHM[0]);
			timeDt.setMinutes(timeHM[1]);
		
			totalTime.setHours(totalTime.getHours() + timeDt.getHours());
			totalTime.setMinutes(totalTime.getMinutes() + timeDt.getMinutes());
		}
	}
	
	return totalTime;
}
/*function replaceOriginalEvents(events, customEvent){
	
	for (var int = 0; int < events.length; int++){
		
		var event = events[int];
		
		if(event['sr_no'] == customEvent['sr_no'] && event['start'] == customEvent['start']){
			event = customEvent;
		}
		
	}


	
}*/

function createResourceEvent(customDataEvent){
	
	var resourceEvent = {}; 
	
	if(customDataEvent){
		
		resourceEvent['id'] = customDataEvent['id'];
		resourceEvent['title'] = customDataEvent['title'];
		resourceEvent['eventColor'] = "orange";
	}
	
	return resourceEvent;
}

function showTimeSheetForm(date,element,event,dayEvents) { 
	
	// console.log(element);
	if((event && event.target && ( $(event.target).hasClass('custom-add-btn') ||
			$(event.target).hasClass('custom-i-element')) || _isDataSubmited) || $(element).hasClass('fc-event')){
		
			timeSheetRender(event, date, dayEvents);
			if(_isDataSubmited)
				_isDataSubmited = false;
		
	}

}

function timeSheetRender(event, date, dayEvents){
	
	_isSubmitted = false;
	if(isDateSubmitted(date))
		_isSubmitted = true; 
	// Rendering the poupdivelement which contains the user time sheet element.
	var timeSheetEle = renderEventElement(event, date, dayEvents); 
	if(timeSheetEle && document.getElementById('event-popup-container')){ 
		
		var timeSheetContainerEle = document.getElementById('event-popup-container');
		$(timeSheetContainerEle).html("");
		
		timeSheetContainerEle.appendChild(timeSheetEle);
		// to auto calculate total values here for the hard-coded fields.
		if(!_isSubmitted)
			manageEffortRules();
		calculateTotalValues();
		
	}
		
}

function loadPrevCalendar(timeEvents, month){ 
	
	var d = new Date();
	d.setMonth(month);
	
	var calendarNext = $('#calendarNext').fullCalendar(
		
		{ 
		
		schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
		header: {
			left: 'title',
			center: '',
			right: '' 
		}, 
		resources: timeEvents['resourceEvents'],
		eventSources: timeEvents['customEvents'], 
		editable: true,
		/* now: '2017-02-17', */
		eventRender: function (event, element, view) {
			
			event.editable = false;
			element.removeClass('fc-draggable');
			element.addClass('default-cursor');
			
			if(event['effort'] != undefined ){
				
				var dataToFind = moment(event.start).format('YYYY-MM-DD');
				element.addClass('hide'); 
				if(!document.getElementById("total-time-" + month + "-" + event['start'])
						&& event._start && event._start._d.getMonth() == month){ 
					var spanleft = document.createElement("span");
			        $(spanleft).attr("class","fc-total-hrs");
			        $(spanleft).attr("id","total-time-" + month + "-" + event['start']);
			        $(spanleft).html("<i class='glyphicon glyphicon-time'></i> " + event['title']); 
			        $("td.fc-day-bottom[data-date='"+dataToFind+"']").append(spanleft); 
			        
				} 
				
			}
			
			
			
		},
		eventAfterAllRender:function( view ) { 
			// console.log(view);
		},
		
		dayClick: function (date, jsEvent, view) {
			$('#eventTitle').val(""); 
			
			showTimeSheetForm(date,this, jsEvent, view['options']['eventSources'][0]['events']); 
			
		},
		dayRender: function (date, cell) {  
			
		        
	    }, 

		viewRender: function(date, allDay, jsEvent, view,element) {
	        
			 
	       
	    }
		
	});
	$('#calendarNext').fullCalendar( 'gotoDate', d );
}

function prevMonth() {
	
	
	var d = new Date();  
	
	if(_mCal == 0){
		_mCal = 12;
		_yCal = _yCal - 1;
	} 
	
	_mCal = _mCal - 1;
	d.setFullYear(_yCal);
	d.setMonth(_mCal); 
	var prevMonthDate = new Date(_yCal, _mCal, 1);
	
	createCalendar(_dataObj, prevMonthDate); 
}

function nextMonth() {
	
	var d = new Date(); 
	
	if(_mCal == 11){
		_mCal = -1;
		_yCal = _yCal + 1;
	}
	
	_mCal = _mCal + 1;
	d.setFullYear(_yCal);
	d.setMonth(_mCal); 
	var nextMonthDate = new Date(_yCal, _mCal, 1);
	
	createCalendar(_dataObj, nextMonthDate); 
	
}



function renderEventElement(event, date, dayEvents){
	
	var timeSheetEle = document.createElement('div');
	$(timeSheetEle).attr('id' ,'time-sheet');
	
	var activeDate = getCurrentActiveDate(date);
	
	var startDateHiddenEle = document.createElement('input');
	$(startDateHiddenEle).attr("type" , "hidden");    
	$(startDateHiddenEle).attr("id" , "time-sheet-date");  
	$(startDateHiddenEle).val(activeDate);
	timeSheetEle.appendChild(startDateHiddenEle); 
	
	var topDivSection = document.createElement('div');
	$(topDivSection).attr("class" , "col-xs-12 p-l-0 p-r-0"); 
	timeSheetEle.appendChild(topDivSection); 
	
	var headingEle = document.createElement('h3');
	$(headingEle).attr("class" , "text-right panel-title"); 
	topDivSection.appendChild(headingEle);

	var formEle = document.createElement('form');
	$(formEle).attr("class" , "form-horizontal p-l-0 p-r-0"); 
	$(formEle).attr("role" , "form");  
	topDivSection.appendChild(formEle); 
	
	var formh4Ele = document.createElement('h5');
	$(formh4Ele).attr("class" , "margin-r-l-0 m-t-0");  
	$(formh4Ele).html("<i class='glyphicon glyphicon-calendar'></i> " + moment(activeDate).format('dddd, MMM DD, YYYY') );
	formEle.appendChild(formh4Ele); 
	 
	
	var currentSRDiv = document.createElement('div');
	$(currentSRDiv).attr("id" , "current-SR-Div"); 
	formEle.appendChild(currentSRDiv); 
	
	var showOtherSR = document.createElement('a');
	$(showOtherSR).attr("id" , "show-other-SR-link"); 
	$(showOtherSR).attr("class" , "inline-block m-t-10 fontBold font12 text-danger hide");
	$(showOtherSR).attr("href" , "#other-SR-Div");
	$(showOtherSR).attr("role" , "button");
	$(showOtherSR).attr("aria-expanded" , "false");
	$(showOtherSR).attr("data-toggle","collapse");
	$(showOtherSR).html("Click here to enter travel / effort for other SR's");
	/*$(showOtherSR).click(function(){ //you can give id or class name here for $('button')
	    $(this).html(function(i,old){
	        return old=='Show Other SR' ?  'Hide Other SR' : 'Show Other SR';
	    });
	});*/
	formEle.appendChild(showOtherSR);
	
	var otherSrDiv = document.createElement('div');
	$(otherSrDiv).attr("id" , "other-SR-Div"); 
	$(otherSrDiv).attr("class","collapse");
	formEle.appendChild(otherSrDiv); 
	

	var otherSrContainer = document.createElement('div');
	$(otherSrContainer).attr("id" , "other-SR-Div-Container"); 
	//$(otherSrContainer).attr("class","collapse");
	otherSrDiv.appendChild(otherSrContainer); 
	

	_dayEvents = dayEvents;
	var timeSheetEvents = getCurrentEvents(dayEvents, activeDate);
	
	var eventCounts = 0;
	_srCount = 0;
	
	if(timeSheetEvents && timeSheetEvents.length > 0){
	
		for(var int = 0; int < timeSheetEvents.length; int++){
			
			var timeSheetEvent = timeSheetEvents[int];
			
			var index = int;
			
			var activeSRObject = timeSheetEvent['activeSRObj'];
			
			var panelEle = _renderSRElement(activeSRObject, index, activeDate, timeSheetEvent, null);
			
			if(panelEle){
				
				if(activeSRObject['key'] && activeSRObject['key'] != "current"){
					$(showOtherSR).removeClass('hide');
					otherSrContainer.appendChild(panelEle); 
				}else{
					currentSRDiv.appendChild(panelEle); 
				}
				
				eventCounts++;
				if(index >= 1)
					_srCount = index;
				else
					_srCount = 0;
			} 
		} 
	}
	

	// loading SR's here.
	var currentSRs = loadActiveSRs(activeDate, null, null, timeSheetEvents, null); 
	
	// rendering multiple SR Number element here
	for(var int = 0; int < currentSRs.length; int++){
		
		var activeSRObject = currentSRs[int];
		
		var index = int + eventCounts;
		
		var panelEle = _renderSRElement(activeSRObject, index, activeDate, null, timeSheetEvents);
		
		if(panelEle){
			
			if(activeSRObject && activeSRObject['key'] != "current"){
				$(showOtherSR).removeClass('hide');
				otherSrContainer.appendChild(panelEle); 
			}else{
				currentSRDiv.appendChild(panelEle); 
			}
			
			
			if(index >= 1)
				_srCount = index;
			else
				_srCount = 0;
		}
		
	} 
	
	
	
	var addNoSR = document.createElement('a');
	$(addNoSR).attr("id" , "add-No-SR-link"); 
	$(addNoSR).attr("class" , "btn btn-success btn-xs m-t-10 pull-right");
	$(addNoSR).attr("href" , "javascript:;");
	$(addNoSR).attr("role" , "button");
	$(addNoSR).html("<i class='glyphicon glyphicon-plus'></i> Add Effort");
	if(!_isSubmitted){
		$(addNoSR).click(function(){
			
			_srCount = _srCount + 1;
			var noSRObject = {key:"add",value:"0-No SR"};
			var panelEle = _renderSRElement(noSRObject, _srCount, activeDate, null, null);
			otherSrContainer.appendChild(panelEle);  
			setEffortRules("effort-type-" + _srCount , null);
			
		});	
	}else if(_isSubmitted){
		$(addNoSR).attr("disabled", "true");
	}
	
	otherSrDiv.appendChild(addNoSR);
	
	if($(showOtherSR).hasClass('hide')){
		$(otherSrDiv).addClass("in");
	}
	
	formGroupDivEle = document.createElement('div');
	$(formGroupDivEle).attr("class" , "form-group margin-r-l-0");  
	formEle.appendChild(formGroupDivEle); 
	
	var formGroupDivChildEle = document.createElement('div');
	$(formGroupDivChildEle).attr("class" , "col-xs-12 text-right m-t-10 p-t-10 p-l-0 p-r-0");  
	formGroupDivEle.appendChild(formGroupDivChildEle);
	
	if(timeSheetEvents.length != 0 || currentSRs.length != 0){
		
		var totalDivEle = _renderTotalEffortTable();	
		if(totalDivEle)
			formGroupDivChildEle.appendChild(totalDivEle);
		
		var formGroupDivChildInputEle = document.createElement('a');
		$(formGroupDivChildInputEle).attr("href" , "javascript:void(0)");      
		$(formGroupDivChildInputEle).attr("class" , "btn btn-primary btn-xs");   
		$(formGroupDivChildInputEle).html("Save");
		
		if(!_isSubmitted){
			formGroupDivChildEle.appendChild(formGroupDivChildInputEle);
		}
		
		
		(function () { 
			
			if (formGroupDivChildInputEle.addEventListener)
				formGroupDivChildInputEle.addEventListener("click", function() { saveData(date);});
		  	else
		  		formGroupDivChildInputEle.attachEvent("click", function() { saveData(date);}); 
			
		}()); 
		
		
	}else{
		
		var NoSRh6 =  document.createElement('h6');
		$(NoSRh6).attr("class" , "text-center p-t-b-22 gray-color");  
		$(NoSRh6).html("SR Not Available.")
		formGroupDivChildEle.appendChild(NoSRh6);
		
	}
	
	
	
	clearFixDivEle = document.createElement('div');
	$(clearFixDivEle).attr("class" , "clearfix");  
	timeSheetEle.appendChild(clearFixDivEle);  
	
	return timeSheetEle;
	
}

function getCurrentEvents(sourceEvents, activeDate){
	
	var currentEvents = [];
	
	var activeDates = getAllActiveDates(activeDate); 
	
	if(_sheetType == "ACTIVE_SR_SHEET")  
		sourceEvents = jQuery.extend(true, [], _timeSheetData);

	
	if(sourceEvents && activeDate ){  
		
		for(var int = 0; int < sourceEvents.length; int++){
			
			var sourceEvent = sourceEvents[int];  
			
			if(sourceEvent && sourceEvent['sr_key'] && sourceEvent['start'] && sourceEvent['start'] == activeDate){
				
				var activeSRObject = {};
				
				activeSRObject['key'] = sourceEvent['sr_key'];
				activeSRObject['value'] = sourceEvent['sr_no'];
				sourceEvent['activeSRObj'] = activeSRObject;
				currentEvents.push(sourceEvent);
				
			}   
			
		} 
		
		/*for(var int = 0; int < sourceEvents.length; int++){
			
			var sourceEvent = sourceEvents[int];  
			
			if(sourceEvent && sourceEvent['start'] && sourceEvent['start'] == activeDate){
				
				if(activeDates){
					for(var int1 = 0; int1 < activeDates.length; int1++){
					
						var activeDateObj = activeDates[int1];  
						
						if(activeDateObj && activeDateObj['value'] && _activeSR[activeDateObj['value']]){
							
							var activeSRs = _activeSR[activeDateObj['value']]; 
							
							for (var int2 = 0; int2 < activeSRs.length; int2++) {
								
								var activeSR = activeSRs[int2];
								
								if(activeSR && activeSR.indexOf('-') != -1){
									
									var value = activeSR.split('-')[0];
									
									if(activeDateObj && value == sourceEvent['sr_no']){
										var activeSRObject = {};
										activeSRObject['key'] = activeDateObj['key'];
										activeSRObject['value'] = value;
										sourceEvent['activeSRObj'] = activeSRObject;
										currentEvents.push(sourceEvent);
										break;
									}
								} 
							}  
							
							if(sourceEvent['activeSRObj'])
								break;
						}else if(sourceEvent['sr_no'] == "0"){ 
							sourceEvent['activeSRObj'] = activeDateObj;
							currentEvents.push(sourceEvent);
							break; 
						}
					} 
				}   
			}
		}*/
	}
	
	return currentEvents;
	
}

function getCurrentActiveDate(date){
	var retDate;
	if(date && date._d){
		retDate = moment(date._d).format('YYYY-MM-DD'); 
	} 
	return retDate;
}
function getCurrentSrEndDate(activeDate,activeSRObject,data){
	
	var retDate;
	var active_sr_no;
	var currentDate = moment(new Date()).format('YYYY-MM-DD');
	var srNoMonthEndDate = moment(activeDate).endOf('month').format('YYYY-MM-DD');
	var nextDate = moment(activeDate, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
	
	if(activeSRObject){
		
		var sr_split = activeSRObject['value'].split('-');
		active_sr_no = sr_split[0];
		
	}else if(data){
		active_sr_no = data['sr_no'];
	}
	
	if(active_sr_no != "0"){
		
		for(var i=0;i < _arrActiveSR.length;i++){
			
			var sr_date = _arrActiveSR[i].date;
			var split = _arrActiveSR[i].value.split('-');
			var global_sr_no  = split[0];
		
			 // if(sr_date == nextDate){

				  if(active_sr_no == global_sr_no){
					  retDate = sr_date;
					  // nextDate = moment(nextDate, 'YYYY-MM-DD').add(1,
						// 'days').format('YYYY-MM-DD');
				  }
			 // }
		}
		
	}else{
		
		retDate = srNoMonthEndDate;
		
		/*
		 * for(var i=0;i < _arrActiveSR.length;i++){
		 * 
		 * var sr_date = _arrActiveSR[i].date; var split =
		 * _arrActiveSR[i].value.split('-'); var global_sr_no = split[1];
		 * 
		 * if(sr_date > activeDate){ retDate = moment(sr_date,
		 * 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD');; break; } }
		 * 
		 * if(!retDate){ retDate = currentDate; }
		 */
		
	}
	
	if(retDate > srNoMonthEndDate){
		retDate = srNoMonthEndDate;
	}
		
	if(!retDate || (retDate < activeDate)){
		retDate = activeDate;
	}	
	
	
	if(retDate > currentDate){ retDate = currentDate; }
	 
	
	return retDate;
}

function sortObject(obj) {
    var arr = [];
    var prop;
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
        	
        	for(i=0;i<obj[prop].length;i++){
        		
        		 arr.push({
                     'date': prop,
                     'value': obj[prop][i]
                 });
        	}
           
        }
    }
    arr.sort(function(a, b) {
    	  return new Date(a.date).getTime() - new Date(b.date).getTime() 
    });
    return arr; // returns array
}


function _renderTotalEffortTable(){
	
	var totalDivEle = document.createElement('div');
	$(totalDivEle).attr("class" , "col-xs-12 p-l-0 p-r-0");  

	formTableEle = document.createElement('table');
	$(formTableEle).attr("class" , "table table-bordered totalEffortTable m-b-5");  
	totalDivEle.appendChild(formTableEle); 
	
	formTheadEle = document.createElement('thead');
	formTableEle.appendChild(formTheadEle); 
	
	formTheadTrEle = document.createElement('tr');
	formTheadEle.appendChild(formTheadTrEle); 
	
	/*
	 * formTheadThEle = document.createElement('th');
	 * $(formTheadThEle).html(""); formTheadTrEle.appendChild(formTheadThEle);
	 */
	
	formTheadThEle = document.createElement('th');
	$(formTheadThEle).html("Effort (hh.mm) ");
	formTheadTrEle.appendChild(formTheadThEle); 
	
	formTheadThEle = document.createElement('th');
	$(formTheadThEle).html("Travel time (hh.mm)");   
	formTheadTrEle.appendChild(formTheadThEle);
	
	formTheadThEle = document.createElement('th');
	$(formTheadThEle).html("OT");   
	formTheadTrEle.appendChild(formTheadThEle); 
	
	
	
	formTbodyEle = document.createElement('tbody');
	formTableEle.appendChild(formTbodyEle); 
	
	formTbodyTrEle = document.createElement('tr');
	formTbodyEle.appendChild(formTbodyTrEle); 
	
	/*
	 * formTbodyTdEle = document.createElement('td');
	 * $(formTbodyTdEle).html("Total");
	 * formTbodyTrEle.appendChild(formTbodyTdEle);
	 */
	
	formTbodyTdEle = document.createElement('td');
	$(formTbodyTdEle).attr('id', 'total-effort')
	$(formTbodyTdEle).html("0");
	formTbodyTrEle.appendChild(formTbodyTdEle); 
	
	formTbodyTdEle = document.createElement('td');
	$(formTbodyTdEle).attr('id', 'total-travel-time')
	$(formTbodyTdEle).html("0");   
	formTbodyTrEle.appendChild(formTbodyTdEle);
	
	formTbodyTdEle = document.createElement('td');
	$(formTbodyTdEle).attr('id', 'total-over-time')
	$(formTbodyTdEle).html("0");   
	formTbodyTrEle.appendChild(formTbodyTdEle); 
	
	return totalDivEle;
}

function _renderSRElement(activeSRObject, index, activeDate, timeSheetEvent, currentDateTimeSheets){
	
	// SRGroup.
	var SRGroupDiv = document.createElement('div');
	$(SRGroupDiv).attr("class" , "p-l-5 p-r-5 p-t-5 p-b-10 m-t-15"); 
	$(SRGroupDiv).attr("id","SR_panel_"+index);
	$(SRGroupDiv).attr("role" , "form");  
	
	
	if(activeSRObject && activeSRObject['key'] != "current"){
		
		$(SRGroupDiv).addClass('bg-lightblue-xx');
	}else{
		$(SRGroupDiv).addClass('bg-lightgreen-xx');
	}
	
	// formEle.appendChild(SRGroupDiv);

	var activeEndDate = getCurrentSrEndDate(activeDate,activeSRObject,timeSheetEvent);
	
	// Close btn
	var formGroupDivEle = document.createElement('div');
	$(formGroupDivEle).attr("class" , "col-xs-12 p-r-0 p-l-0 h0");  
	SRGroupDiv.appendChild(formGroupDivEle); 
	
	var closeBtn = document.createElement("a");
	$(closeBtn).attr("class","btn btn-xxxs btn-danger custom-close-btn hide");
	$(closeBtn).attr("href","javascript:void(0);");
	$(closeBtn).html("<i class='glyphicon glyphicon-remove m-t-1'></i>");  
	formGroupDivEle.appendChild(closeBtn);

	
	(function () { 
		
		if (closeBtn.addEventListener)
			closeBtn.addEventListener("click", function() { removeSegment(index);});
	  	else
	  		closeBtn.attachEvent("click", function() { removeSegment(index);}); 
		
	}()); 
	
	
	// Effort Type
	
	var formGroupDivEle = document.createElement('div');
	$(formGroupDivEle).attr("class" , "form-group margin-r-l-0 col-xs-6 p-r-0 p-l-0");  
	SRGroupDiv.appendChild(formGroupDivEle); 
	
	formGroupDivlabelEle = document.createElement('label');
	$(formGroupDivlabelEle).attr("class" , "control-label col-xs-12 text-left");  
	$(formGroupDivlabelEle).attr("for" , "");  
	$(formGroupDivlabelEle).html("Effort Type");   
	formGroupDivEle.appendChild(formGroupDivlabelEle); 
	
	formGroupDivlabelSpanEle = document.createElement('span');
	$(formGroupDivlabelSpanEle).attr("class" , "red");  
	$(formGroupDivlabelSpanEle).html("*");  
	formGroupDivlabelEle.appendChild(formGroupDivlabelSpanEle); 
	
	var formGroupDivChildEle = document.createElement('div');
	$(formGroupDivChildEle).attr("class" , "col-xs-12");  
	formGroupDivEle.appendChild(formGroupDivChildEle);
	
	var formGroupDivChildSelectEle = document.createElement('select');
	$(formGroupDivChildSelectEle).attr("data-msg-required" , "Please Select Effort Type");  
	$(formGroupDivChildSelectEle).attr("data-rule-required" , "true");  
	$(formGroupDivChildSelectEle).attr("name" , "effort-type"); 
	$(formGroupDivChildSelectEle).attr("id" , "effort-type-" + index);   
	$(formGroupDivChildSelectEle).attr("class" , "form-control input-xs");  
	$(formGroupDivChildSelectEle).attr("onchange" , "");   
	formGroupDivChildEle.appendChild(formGroupDivChildSelectEle); 
	
	var formGroupDivChildHiddenEle = document.createElement('input');
	$(formGroupDivChildHiddenEle).attr("type" , "hidden");    
	$(formGroupDivChildHiddenEle).attr("id" , "effort-type-id-" + index);     
	formGroupDivChildEle.appendChild(formGroupDivChildHiddenEle); 
	
	var formGroupDivChildHiddenEle = document.createElement('input');
	$(formGroupDivChildHiddenEle).attr("type" , "hidden");    
	$(formGroupDivChildHiddenEle).attr("id" , "sr-key-" + index);   
	if(activeSRObject && activeSRObject['key']){
		$(formGroupDivChildHiddenEle).attr("value" , activeSRObject['key']);    
	}
	formGroupDivChildEle.appendChild(formGroupDivChildHiddenEle); 
	
	var formGroupDivEle = document.createElement('div');
	$(formGroupDivEle).attr("class" , "form-group margin-r-l-0 col-xs-6 p-r-0 p-l-0");  
	SRGroupDiv.appendChild(formGroupDivEle); 
	
	formGroupDivlabelEle = document.createElement('label');
	$(formGroupDivlabelEle).attr("class" , "control-label col-xs-12 text-left");  
	$(formGroupDivlabelEle).attr("for" , "");  
	$(formGroupDivlabelEle).html("SR No.");   
	formGroupDivEle.appendChild(formGroupDivlabelEle); 
	
	formGroupDivlabelSpanEle = document.createElement('span');
	$(formGroupDivlabelSpanEle).attr("class" , "red");  
	$(formGroupDivlabelSpanEle).html("*");  
	formGroupDivlabelEle.appendChild(formGroupDivlabelSpanEle); 
	
	var formGroupDivChildEle = document.createElement('div');
	$(formGroupDivChildEle).attr("class" , "col-xs-12");  
	formGroupDivEle.appendChild(formGroupDivChildEle);
	
	// have to append SR selection element;
	var srNumberSelectEle = document.createElement('select');
	$(srNumberSelectEle).attr("data-msg-required" , "Please Select SR Number");  
	$(srNumberSelectEle).attr("data-rule-required" , "true");  
	$(srNumberSelectEle).attr("name" , ""); 
	$(srNumberSelectEle).attr("id" , "sr-number-" + index);   
	$(srNumberSelectEle).attr("class" , "form-control input-xs");  
	$(srNumberSelectEle).attr("onchange" , "");   
	formGroupDivChildEle.appendChild(srNumberSelectEle); 
	loadActiveSRs(activeDate, srNumberSelectEle, timeSheetEvent, currentDateTimeSheets, activeSRObject, formGroupDivChildSelectEle);
	
	var timeSheetHiddenEle = document.createElement('input');
	$(timeSheetHiddenEle).attr("type" , "hidden");    
	$(timeSheetHiddenEle).attr("id" , "time-sheet-id-" + index);  
	formGroupDivChildEle.appendChild(timeSheetHiddenEle); 
	
	if(timeSheetEvent && timeSheetEvent['time_sheet_id']){
		$(timeSheetHiddenEle).val(timeSheetEvent['time_sheet_id']);
	}
    
	var formGroupDivEle = document.createElement('div');
	$(formGroupDivEle).attr("class" , "col-xs-12 p-r-0 p-l-0");  
	SRGroupDiv.appendChild(formGroupDivEle); 
	
	
	formTableEle = document.createElement('table');
	$(formTableEle).attr("class" , "table no-table-bordered m-b-5");  
	formGroupDivEle.appendChild(formTableEle); 
	
	formTheadEle = document.createElement('thead');
	formTableEle.appendChild(formTheadEle); 
	
	formTheadTrEle = document.createElement('tr');
	formTheadEle.appendChild(formTheadTrEle); 
	
	formTheadThEle = document.createElement('th');
	$(formTheadThEle).html(" Effort  (in hh:mm) ");
	formTheadTrEle.appendChild(formTheadThEle); 
	
	formTheadThEle = document.createElement('th');
	$(formTheadThEle).html("Travel time");   
	formTheadTrEle.appendChild(formTheadThEle);
	
	formTheadThEle = document.createElement('th');
	$(formTheadThEle).html("OT");   
	formTheadTrEle.appendChild(formTheadThEle);  
	
	formTbodyEle = document.createElement('tbody');
	formTableEle.appendChild(formTbodyEle); 
	
	formTbodyTrEle = document.createElement('tr');
	formTbodyEle.appendChild(formTbodyTrEle); 
	
	formTbodyTdEle = document.createElement('td');
	
	var formGroupDivChildInputEle = document.createElement('input');
	$(formGroupDivChildInputEle).attr("data-msg-required" , "Please Select Enter Effort (in hours)");  
	$(formGroupDivChildInputEle).attr("data-rule-required" , "true");  
	$(formGroupDivChildInputEle).attr("type" , "text");   
	$(formGroupDivChildInputEle).attr("placeholder" , "hh:mm");   
	$(formGroupDivChildInputEle).attr("name" , ""); 
	$(formGroupDivChildInputEle).attr("id" , "effort-" + index);   
	$(formGroupDivChildInputEle).attr("class" , "form-control input-xs"); 
	if(activeSRObject && activeSRObject['key'] != "current" || 	(_isSubmitted)){ 
		$(formGroupDivChildInputEle).attr("disabled", true); 
	} 
	
	$(formGroupDivChildInputEle).attr("size" , "20");   
	formTbodyTdEle.appendChild(formGroupDivChildInputEle);
	
	if(timeSheetEvent && timeSheetEvent['effort']){
		$(formGroupDivChildInputEle).val(timeSheetEvent['effort']);
		$(formGroupDivChildInputEle).addClass('has-highlight');  
	}
	
	var effortEle = formGroupDivChildInputEle;
	
	(function () { 
		
		//$(effortEle).mask("99:99",{ autoclear: false });	
		var idIndex = index;
		var elementId = effortEle.id;
		
		elementId = elementId.replace(idIndex, "");  
		
		if(effortEle.addEventListener){
			effortEle.addEventListener("focus",function() {return formatTimePicker(effortEle);});
			effortEle.addEventListener("focusout", function() { manageAutoCalculatedFields(elementId, idIndex);});
			
		}else{
			effortEle.attachEvent("focusin",function() {return formatTimePicker(effortEle);});
			effortEle.attachEvent("focusout", function() { manageAutoCalculatedFields(elementId, idIndex);}); 

		} 

	}());
	
	if(effortEle.addEventListener){
		effortEle.addEventListener("blur",function() { return checkValidTime(this); },false);
    }else {
    	effortEle.attachEvent("focusout",function() { return checkValidTime(this);  },false);
    }
	
	
	formTbodyTrEle.appendChild(formTbodyTdEle); 
	
	formTbodyTdEle = document.createElement('td');
	
	var formGroupDivChildInputEle = document.createElement('input');
	$(formGroupDivChildInputEle).attr("type" , "text");   
	$(formGroupDivChildInputEle).attr("size" , "20"); 
	$(formGroupDivChildInputEle).attr("placeholder" , "hh:mm");   
	$(formGroupDivChildInputEle).attr("id" , "travel-time-" + index);    
	$(formGroupDivChildInputEle).attr("class" , "form-control input-xs");   
	formTbodyTdEle.appendChild(formGroupDivChildInputEle);
	
	if(timeSheetEvent && timeSheetEvent['travel_time']){
		$(formGroupDivChildInputEle).val(timeSheetEvent['travel_time']);
		$(formGroupDivChildInputEle).addClass('has-highlight'); 
	}
	
	if(_isSubmitted)
		$(formGroupDivChildInputEle).attr("disabled", true); 
	
	var travelTimeEle = formGroupDivChildInputEle;
	
	(function () { 
	
		//$(travelTimeEle).mask("99:99",{ autoclear: false });
		
		var idIndex = index;
		var elementId = travelTimeEle.id;
		
		elementId = elementId.replace(idIndex, ""); 
		
		if(travelTimeEle.addEventListener){
			
			travelTimeEle.addEventListener("focus",function() { return formatTimePicker(travelTimeEle); });
			travelTimeEle.addEventListener("focusout", function() { manageAutoCalculatedFields(elementId, idIndex);});
			
		}else{
			
			travelTimeEle.attachEvent("focusin",function() { return formatTimePicker(travelTimeEle); });
			travelTimeEle.attachEvent("focusout", function() { manageAutoCalculatedFields(elementId, idIndex);}); 

		} 
		
	}()); 
	
	if(travelTimeEle.addEventListener){
		travelTimeEle.addEventListener("blur",function() { return checkValidTime(this); },false);
    }else {
    	travelTimeEle.attachEvent("focusout",function() { return checkValidTime(this);  },false);
    }
	
	
	// $(formTbodyTdEle).html("Travel time");
	formTbodyTrEle.appendChild(formTbodyTdEle);
	
	
	formTbodyTdEle = document.createElement('td');
	var formGroupDivChildInputEle = document.createElement('input');
	$(formGroupDivChildInputEle).attr("type" , "text");   
	$(formGroupDivChildInputEle).attr("size" , "20"); 
	$(formGroupDivChildInputEle).attr("placeholder" , "00:00");   
	$(formGroupDivChildInputEle).attr("disabled", "true");    
	$(formGroupDivChildInputEle).attr("id", "over-time-" + index);    
	$(formGroupDivChildInputEle).attr("class" , "form-control input-xs");   
	formTbodyTdEle.appendChild(formGroupDivChildInputEle);
	
	if(timeSheetEvent && timeSheetEvent['over_time']){
		$(formGroupDivChildInputEle).val(timeSheetEvent['over_time']);  
	} 
	
	// $(formTbodyTdEle).html("OT");
	formTbodyTrEle.appendChild(formTbodyTdEle); 


	formGroupDivEle = document.createElement('div');
	$(formGroupDivEle).attr("class" , "form-group margin-r-l-0 m-b-0");  
	SRGroupDiv.appendChild(formGroupDivEle); 
	
	
	var formGroupDivChildEle = document.createElement('div');
	$(formGroupDivChildEle).attr("class" , "col-xs-12");  
	formGroupDivEle.appendChild(formGroupDivChildEle); 
	
	var formGroupDivChildDivEle = document.createElement('div');
	$(formGroupDivChildDivEle).attr("class" , "col-xs-12 p-l-0");  
	formGroupDivChildEle.appendChild(formGroupDivChildDivEle); 
	
	var formGroupDivChildTextareaEle = document.createElement('textarea');
	$(formGroupDivChildTextareaEle).attr("class" , "form-control font11");
	$(formGroupDivChildTextareaEle).attr("id", "remarks-" + index); 
	$(formGroupDivChildTextareaEle).attr("placeholder", "Enter Remarks");  
	$(formGroupDivChildTextareaEle).attr("row" , "2");
	formGroupDivChildDivEle.appendChild(formGroupDivChildTextareaEle); 
	
	if(timeSheetEvent && timeSheetEvent['remarks']){
		$(formGroupDivChildTextareaEle).val(timeSheetEvent['remarks']);
	}
	
	if(_isSubmitted)
		$(formGroupDivChildTextareaEle).attr("disabled", true); 
	
	// Replicate effort till
	
	var formGroupDivEle = document.createElement('div');
	$(formGroupDivEle).attr("class" , "form-group margin-r-l-0 m-t-5 p-r-0 p-l-0");  
	SRGroupDiv.appendChild(formGroupDivEle); 
	
	formGroupDivlabelEle = document.createElement('label');
	$(formGroupDivlabelEle).attr("class" , "control-label col-xs-4 text-left");  
	$(formGroupDivlabelEle).attr("for" , "");  
	$(formGroupDivlabelEle).html("Replicate effort till");   
	formGroupDivEle.appendChild(formGroupDivlabelEle); 
	
	var formGroupDivChildEle = document.createElement('div');
	$(formGroupDivChildEle).attr("class" , "col-xs-8");  
	formGroupDivEle.appendChild(formGroupDivChildEle);
	
	var formGroupDivChildInputEle = document.createElement('input');
	$(formGroupDivChildInputEle).attr("name" , ""); 
	$(formGroupDivChildInputEle).attr("id" , "effort-till-" + index);   
	$(formGroupDivChildInputEle).attr("class" , "form-control input-xs");  
	formGroupDivChildEle.appendChild(formGroupDivChildInputEle); 
	
	if(_isSubmitted || activeSRObject['key'] != "current")
		$(formGroupDivChildInputEle).attr("disabled", true); 
	
	var spanIcon = document.createElement('span');
	$(spanIcon).attr("class" , "glyphicon glyphicon-calendar form-control-icon-xs color-default");  
	formGroupDivChildEle.appendChild(spanIcon); 
	
	$(formGroupDivChildInputEle).pickadate({
    	
    	format: "yyyy-mm-dd",
    	min: new Date(activeDate),
    	max: new Date(activeEndDate),
    	onStart: function() { 
    	       	this.set('select', new Date(activeDate))
    	   }
    	
    });

	return SRGroupDiv;
}

function calculateTotalValues(){
	
	var calculationFieldArr = ["effort-","travel-time-","over-time"];
	
	for(var int = 0; int < calculationFieldArr.length; int++ ){
		
		manageAutoCalculatedFields(calculationFieldArr[int], int);
		
	}
	
}

function manageAutoCalculatedFields(selectedElementId, idIndex){
	
	var totalElementValue = new Date(0, 0, 0, 0, 0, 0, 0);
	
	var totalElementId = "";  
	
	for(var int = 0; int <= _srCount; int ++){
		
		var timeDt = new Date(0, 0, 0, 0, 0, 0, 0);
		
		var elementId = selectedElementId + int;
		
		if(document.getElementById(elementId)){
			
			var elementValue = $("#" + elementId).val();

			var elementHM = elementValue.split(":"); 
			
			if(elementHM[0] && elementHM[1]){
			
				timeDt.setHours(elementHM[0]);
				timeDt.setMinutes(elementHM[1]);
				
				totalElementId = "total-" + elementId.replace("-" + int, ""); 
					
				if(document.getElementById(totalElementId)){  
					totalElementValue.setHours(totalElementValue.getHours() + timeDt.getHours());
					totalElementValue.setMinutes(totalElementValue.getMinutes() + timeDt.getMinutes()); 
				} 
			}
		}
	}   
	  
	var totalValueElement = document.getElementById(totalElementId);
	$(totalValueElement).html("" + formatHours(totalElementValue) + ":" + formatTime(totalElementValue.getMinutes())); 
		 
	if(idIndex != null && idIndex != "undefined"){
		
		calculateOT(selectedElementId, idIndex);
		
	}
		 
	 
}

function formatTimePicker(timeEle){

	$(timeEle).timepicker({
        timeFormat : 'HH:mm',
        dropdown: false
    });
	
}

function checkValidTime(element){
	  if(!$(element).val())
	    return false;
	  var timeCheckColon = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])( )?:?([0-5]?[0-9])?$/; /* with colon */
	  var timeCheck = /^(2[0-3]|[01]?[0-9])([0-5]?[0-9]( )?$)/; /* without colon */
	  var time =  $(element).val();
	  if(timeCheck.test(time)==false && timeCheckColon.test(time)==false ){
	    $(element).val('');
	    $(element).focus();
	    return false;
	  }else{
		  var i = time.indexOf(":");
		  var newTime;
		    if(i < 0){
		        newTime = time.substr(0,2) +":"+ time.substr(2,2);
		        $(element).val(newTime);
		    }
	  } 
}
  

function loadEffortTypes(parentSelectEle, timeSheetEvent){

	var reqURL = "web/getEffortTypes.json";

	//var reqURL = "TimeSheet.do?method=getEffortTypes";
	$.getJSON(reqURL,{"timeStamp" : new Date().getTime()}, function(result) {
		if(result && result['data']) {
			
			var data = result['data'];
			var selectedVal = null;
			
			if(data){
				
				_effortData = data; 
				
			}
		
		}
	}); 
	
}

function calculateOT(elementId, index){
	
	if(elementId && (index || index == 0) && elementId.indexOf("effort") != - 1){
			
		var effortVal = document.getElementById(elementId + index).value;
		
		if(!effortVal)
			effortVal = new Date(0, 0, 0, 0, 0, 0, 0);
		
		if(document.getElementById('time-sheet-date') && document.getElementById('sr-number-' + index)){
			
			var formDate = document.getElementById('time-sheet-date').value;
			
			var formSRNumber = $('#sr-number-' + index).val();
			
			if(formDate && _dayEvents){
				
				var activeEvents = _dayEvents;
				
				for(var int = 0; int < activeEvents.length; int++){
					
					var activeEvent = activeEvents[int];
					
					if(activeEvent['sr_no'] && activeEvent['working_hours']){ 
						
						var activeEventSRNo = activeEvent['sr_no'];
						
						var workingHours = activeEvent['working_hours'];
						
						var otDt = new Date(0, 0, 0, 0, 0, 0, 0);
						
						if(activeEventSRNo == formSRNumber){
							
							var effortDt = calculateTime(effortVal, ":");
							
							var workingHoursDt = calculateTime(workingHours, ".");
							
							if(effortDt.getHours() > workingHoursDt.getHours()){
							
								otDt.setHours(effortDt.getHours() - workingHoursDt.getHours());
								
								otDt.setMinutes(effortDt.getMinutes() - workingHoursDt.getMinutes()); 
								
							}
							
							var overTimeEleId = 'over-time-';
							
							var otElement = document.getElementById( overTimeEleId + index);   
							
							otElement.value = formatHours(otDt) + ":" + formatTime(otDt.getMinutes());  
							  
							// to manage and calculate total OT value here.
							manageAutoCalculatedFields(overTimeEleId);
							
							break;
							
						}
						
					}
					
				}
				
			}
			
		}
			
	}
	
}

function setEffortType(parentSelectEle, selectedValue){
	
	if(parentSelectEle && _effortData){
	// alert(data);
		var data = _effortData;
		for (var i = 0; i < data.length; i++) {
	
			var value = data[i].id; 
			var text =  data[i].name; 
			
			var optionEle = document.createElement("option");
			
			optionEle.text = text;
			optionEle.value = value; 
			
			if(selectedValue && value == selectedValue) { 
				optionEle.selected = "selected";  
			}
			
			parentSelectEle.appendChild(optionEle); 
	
		}
		
		(function () { 
			
			var idIndex = parentSelectEle.id; 
			
			if (parentSelectEle.addEventListener)
				parentSelectEle.addEventListener("change", function() { setEffortRules(idIndex);});
			else
				parentSelectEle.attachEvent("change", function() { setEffortRules(idIndex); });
			 
			
		}()); 
		
		if(_isSubmitted)
			$(parentSelectEle).prop( "disabled", true );
	}
	
}

// to load active SR's on the basis of calendar dates around 3 months of current
// month
function loadSRNumbers(selectedDate){
	 
	var reqURL = "web/getSrNumbers.json";
	//var reqURL = "TimeSheet.do?method=getSrNumbers&emp_num=" + _empId;
	$.getJSON(reqURL,{"date": selectedDate,"timeStamp" : new Date().getTime()}, function(result) {
		if(result && result['data']) {
			
			var data = result['data'];
			
			if(data){
				
				_activeSR = data;
				_arrActiveSR = sortObject(_activeSR);
				makeSRViewDropdown(data);
				
			}
		
		}
	}); 
	
}


function setTimeSheet(event, index){
	if(event){
		
		if(event['time_sheet_id'] && document.getElementById('time-sheet-id-' + index) ){
			$('#time-sheet-id-' + index).val(event['time_sheet_id']);
		} 
		
		if(event['effort'] && document.getElementById('effort-' + index) ){
			$('#effort-' + index).val(event['effort']);
		}
		
		if(event['travel_time'] && document.getElementById('travel-time-' + index) ){
			$('#travel-time-'+ index).val(event['travel_time']);
		}
		
		if(event['over_time'] && document.getElementById('over-time-' + index) ){
			$('#over-time-' +index).val(event['over_time']);
		}
		
		if(event['remarks'] && document.getElementById('remarks-' + index) ){
			$('#remarks-'+ index).val(event['remarks']);
		}
		
	} 
}


function loadActiveSRs(activeDate, parentSelectEle, timeSheetEvent, savedTimeSheetEvents, activeSRObject, effortEle){ 
	
	var currentSRs = [];
	
	var activeDates = getAllActiveDates(activeDate); 
	
	var selectedVal = null;
	
	var isSavedVal = false;
	
	var selectedEffortVal = null;
	
	if(timeSheetEvent && timeSheetEvent['sr_no']){
		selectedVal = timeSheetEvent['sr_no'];
		isSavedVal = true;
		selectedEffortVal = timeSheetEvent['effort_type_id'];
	}else if(activeSRObject && activeSRObject['value'] && activeSRObject['value'].indexOf("-") != -1){
		
		var selectedRowVal = activeSRObject['value'].split("-");
		
		if(selectedRowVal.length > 1){
			
			selectedVal = selectedRowVal[0];
			
		} 
		
	}
		
	var isSelectedValAppended = false;
	
	var uniqueActiveSRs = {};
	
	if(activeDates){
		for(var int = 0; int < activeDates.length; int++){
		
			var activeDateObj = activeDates[int]; 
			
			if(activeDateObj && activeDateObj['value'] && _activeSR[activeDateObj['value']]){
				
				var activeSRs = _activeSR[activeDateObj['value']]; 
				
				for (var int1 = 0; int1 < activeSRs.length; int1++) {
					
					var activeSR = activeSRs[int1];
					
					if(activeSR && activeSR.indexOf('-') != -1){
						
						var value = activeSR.split('-')[0];
						var text =  activeSR.split('-')[1];
						
						if(value && !uniqueActiveSRs[value] && !isAlreadyEventLoaded(savedTimeSheetEvents, value)){
							
							if(parentSelectEle){
								var optionEle = document.createElement("option");
								
								optionEle.text = text;
								optionEle.value = value;
								
								if(value == selectedVal) {
									isSelectedValAppended = true;
									optionEle.selected = "selected"; 
									$(parentSelectEle).prop( "disabled", true );
									
									if(!isSavedVal && effortEle && effortEle.id && activeDateObj['key'] != "current"){
										  
										var effortSelector = "#" + effortEle.id + " option[value='" + 8 + "']";
										$(effortSelector).attr('selected', true);
										$(effortEle).prop('disabled', true);
										// loading Effort types's here.
										selectedEffortVal = 8; 
											
									}
								}
								
								parentSelectEle.appendChild(optionEle);
							}
							
							uniqueActiveSRs[value] = true;
							
							// creating Active SR's for a selected date
							var activeSRObj = {};
							activeSRObj['key'] = activeDateObj['key'];
							activeSRObj['value'] = activeSR;
							currentSRs.push(activeSRObj);
							
						}
		
					}  
					
				}
				 
			}else{
				var value = "0";
				var text =  "No SR";
				if(value && !uniqueActiveSRs[value] && !isAlreadyEventLoaded(savedTimeSheetEvents, value)){
					if(parentSelectEle){
						var optionEle = document.createElement("option");
						
						optionEle.text = text;
						optionEle.value = value;
						
						if(value == selectedVal) {
							isSelectedValAppended = true;
							optionEle.selected = "selected"; 
							$(parentSelectEle).prop( "disabled", true );
							
							if(!isSavedVal && effortEle && effortEle.id){
								
								var effortVal = 4;
								if(activeDateObj && activeDateObj['key'] != "current")
									effortVal = 8; 
								
								var effortSelector = "#" + effortEle.id + " option[value='" + effortVal + "']";
								$(effortSelector).attr('selected', true)
								// loading Effort types's here.
								selectedEffortVal = effortVal; 
									
							}
						}
						
						parentSelectEle.appendChild(optionEle);
					}
					
					uniqueActiveSRs[value] = true;
					
					// creating Active SR's for a selected date
					var activeSRObj = {};
					activeSRObj['key'] = activeDateObj['key'];
					activeSRObj['value'] = "0-No SR";
					currentSRs.push(activeSRObj);
				}
				
			}
		}
	}else if(!isSelectedValAppended && selectedVal && event['_id']){
		var optionEle = document.createElement("option"); 
		optionEle.text = selectedVal;
		optionEle.value = event['_id'];
		optionEle.selected = "selected";
		$(parentSelectEle).prop( "disabled", true );
		parentSelectEle.appendChild(optionEle);
	}
	
	if(!isSelectedValAppended && selectedVal && timeSheetEvent && timeSheetEvent['status']){
		var optionEle = document.createElement("option"); 
		optionEle.text = timeSheetEvent['Project_Name'];
		optionEle.value = timeSheetEvent['sr_no'];
		optionEle.selected = "selected";
		$(parentSelectEle).prop( "disabled", true );
		parentSelectEle.appendChild(optionEle);
	}
	else if(!isSelectedValAppended && selectedVal && activeSRObject){
		var optionEle = document.createElement("option"); 
		optionEle.text = activeSRObject['value'].split("-")[1];
		optionEle.value = selectedVal;
		optionEle.selected = "selected";
		$(parentSelectEle).prop( "disabled", true );
		parentSelectEle.appendChild(optionEle);
	}
	
	setEffortType(effortEle, selectedEffortVal, isSavedVal);
	
	return currentSRs;
}

function isAlreadyEventLoaded(timeSheetEvents, srNumber){
	
	var retVal = false;
	
	if(srNumber && timeSheetEvents && timeSheetEvents.length > 0){
		retVal = true;
		
		for(var int = 0; int < timeSheetEvents.length; int++){
			
			var timeSheet = timeSheetEvents[int];
			
			if(timeSheet){
				var sheetSRNumber = timeSheet['sr_no'];
				
				if(sheetSRNumber && sheetSRNumber == srNumber){
					retVal = true;
					break;
				}else
					retVal = false;
				
			} 
			
		}
		
	}
	
	return retVal;
}

function getAllActiveDates(activeDate){
	
	var activeDates = [];
	var activeDateCount = 2;
	
	var activeDateObj = {}; 
	activeDateObj['key'] = 'current';
	activeDateObj['value'] = activeDate;
	
	activeDates.push(activeDateObj);
	
	for(var int = activeDateCount; int >= 1; int--){
		var activeDateObj = {}; 
		activeDateObj['key'] = 'prior-' + int;
		activeDateObj['value'] = moment(activeDate, 'YYYY-MM-DD').subtract(int, 'days').format('YYYY-MM-DD');
		activeDates.push(activeDateObj);
	}
	
	for(var int = 1; int <= activeDateCount; int++){
		var activeDateObj = {}; 
		activeDateObj['key'] = 'post-' + int;
		activeDateObj['value'] = moment(activeDate, 'YYYY-MM-DD').add(int, 'days').format('YYYY-MM-DD');
		activeDates.push(activeDateObj); 
	} 
	 
	return activeDates;
}  


function loadMonthlyTimeSheets(){
    var reqURL = "web/getTimeSheetDataMonthEmployee.json";
	//var reqURL = "TimeSheet.do?method=getTimeSheetData&key=MONTH_EMPLOYEE&user_id=" + _userId;
	var paramObj = {}; 
	paramObj['YEAR'] = _yMonthly; 
	var jsonString = JSON.stringify(paramObj);
	
	$.ajax({ 
		 type: 'GET',
	 	 dataType: "json",
	  	 url: reqURL,
	  	 data: {"param": jsonString,"timeStamp" : new Date().getTime()},
	 	 success:function(result){ 
	 		$('#ts-year-view').html(_yMonthly);
	 		var timeSheetTable = $('#calendarTimeSheet'); 
	 		$(timeSheetTable).html('');
	 		if(result && result['data']){  
	 			var timeSheetData = result['data'];
	 			populateMonthlyTimeSheets(timeSheetData, timeSheetTable);
			}
	}});
	
}
function loadSRViewData(){
	var reqURL = "web/getTimeSheetDataSREmployee.json";
	//var reqURL = "TimeSheet.do?method=getTimeSheetData&key=SR_EMPLOYEE&user_id=" + _userId;
	var paramObj = {};
	var d = new Date();
	paramObj['SR_NUMBER'] = $('#sr-view-select').val(); 

	var jsonString = JSON.stringify(paramObj);
	
	$.ajax({ 
		 type: 'GET',
	 	 dataType: "json",
	  	 url: reqURL,
	  	 data: {"param": jsonString,"timeStamp" : new Date().getTime()},
	 	 success:function(result){ 
	 		 
	 		var timeSheetTable = $('#SRTimeSheet'); 
			$(timeSheetTable).html('');
			
	 		if(result && result['data']){  
	 			var timeSheetData = result['data'];
	 			populateSRTimeSheets(timeSheetData,timeSheetTable);
			}
	 		
	}});
	
}

function populateMonthlyTimeSheets(timeSheetData, timeSheetTable){
	
	if(timeSheetData){
		
		for(var int = 0; int < timeSheetData.length; int++){
			
			var timeSheetDataObj = timeSheetData[int];
			
			timeSheetDataObj['totalDaysInMonth'] = daysInMonth(timeSheetDataObj.month,timeSheetDataObj.year);
			timeSheetDataObj['month_name'] = moment.months(timeSheetDataObj.month - 1);
			
			var table = $('<table></table>').addClass('table table-bordered timeSheetdtable m-b-10');
			var thead = $('<thead></thead>');
			var tbody = $('<tbody></tbody>');
		    thead.append(tableTheadRender(timeSheetDataObj)); 
		    var data = timeSheetDataObj['data'];
		    
		    for(var i=0;i<data.length; i++){
		    	
		    	tbody.append(tableTbodyRender(data[i],timeSheetDataObj));
		    	
		    }
		 
			table.append(thead);
			table.append(tbody);
		
			$(timeSheetTable).append(table);
		}
	}
	

}
function populateSRTimeSheets(timeSheetData,timeSheetTable){
	
	if(timeSheetData){
		
		for(var j = 0; j < timeSheetData.length; j++){
		
			var h4Year = $('<h4 id="" class="m-b-2 text-center" >'+timeSheetData[j]['key']+'</h4>')
			$(timeSheetTable).append(h4Year);
		
			var timeSheetYearData = timeSheetData[j]['value'];
			
			for(var int = 0; int < timeSheetYearData.length; int++){
				
				var timeSheetDataObj = timeSheetYearData[int];
				
				timeSheetDataObj['totalDaysInMonth'] = daysInMonth(timeSheetDataObj.month,timeSheetDataObj.year);
				timeSheetDataObj['month_name'] = moment.months(timeSheetDataObj.month - 1);
				
				var table = $('<table></table>').addClass('table table-bordered timeSheetdtable m-b-10');
				var thead = $('<thead></thead>');
				var tbody = $('<tbody></tbody>');
			    thead.append(tableTheadRender(timeSheetDataObj)); 
			    var data = timeSheetDataObj['data'];
			    
			    for(var i=0;i<data.length; i++){
			    	
			    	tbody.append(tableTbodyRender(data[i],timeSheetDataObj));
			    	
			    }
			 
				table.append(thead);
				table.append(tbody);
			
				$(timeSheetTable).append(table);
			}
		
		}
		
		
	}
	

}

function tableTheadRender(obj){
	
	var row = $('<tr></tr>');
	row.append('<th class="w60-ipm">'+ obj['month_name'] +'</th>');
	if(obj.month < 10){
		obj.month = "0" + obj.month;
	}
	
	for(i=1; i<32; i++){
		
		var cell = $('<th></th>');
		
		if(obj.totalDaysInMonth >= i){
			
			if(i <= 9){
				i = "0"+i;
			}
			var daysOfWeek = moment(obj.year+''+obj.month+''+ i).format('ddd').slice(0,-2);
			cell.html('<div class="border-bottom">'+ i +'</div><div class="l-h-20">' + daysOfWeek+ '</div>');
		}
		
	    row.append(cell);
	}
	
	row.append('<th>Total</th>');
	
	return row;
}

function tableTbodyRender(obj,paramObj){
	
	var dayAndHrs = obj.daysnHrs;
	var type = obj.type;
	var totalHrs = new Date(0, 0, 0, 0, 0, 0, 0);
	var row = $('<tr></tr>');
	row.append('<td>'+ obj.name +'</td>');
	 
	for(i=1; i <32; i++){
		
		var cell = $('<td></td>'); 
		
		var dayNHrsObj = dayAndHrs[i];
 
		if(dayNHrsObj && dayNHrsObj['effort'] && dayNHrsObj['effort_type']){
			
			var effort = dayNHrsObj['effort'];
			var effortType = dayNHrsObj['effort_type'];
			
			
			cell.html(effort);
			
			if(type == 'TT'){
				
				cell.attr('title','Travel Time')
				cell.addClass('travel-time-color');
				
			}else{
				
				cell.attr('title',effortType)
				cell.addClass(dayNHrsObj['effort_code']+ '-color');
			}
			
			totalHrs = calculateTime(effort, ":", totalHrs);
			
			
			
		} 
		
	    row.append(cell);
	}
	
	row.append('<td>'+ formatHours(totalHrs) + ":" + formatTime(totalHrs.getMinutes()) +'</td>');
	return row;
}



function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}
function isMonthDataSubmitted(){
	
	   var monthStatus = false;	
	   var allEvents = [];
	    allEvents = $('#calendar').fullCalendar('clientEvents');
	    var timesEvent = $.grep(allEvents, function (v) {
	    	if(v.start._d.getMonth() == _mCal && v.status == "S")
	    		monthStatus = true; 
	    });
	    
	    if(monthStatus){
	    	return true;
	    }else{
	    	return false;
	    }
	    
	    
}

function isDateSubmitted(eventDate){
	
	  var allEvents = [];
	    allEvents = $('#calendar').fullCalendar('clientEvents');
	    var timesEvent = $.grep(allEvents, function (v) {
	    	if(v.status == "S")
	    		return +v.start === +eventDate;
	    });
	    return timesEvent.length > 0;
	    
}

function makeSRViewDropdown(data){
	
	var distinctSRMap = {}; 
	
	var srViewDropdownEle = document.getElementById('sr-view-select');
	
	$(srViewDropdownEle).html("");
	
	// No SR as drop down value adding here.
	var optionEle = document.createElement("option"); 
	optionEle.text = "No SR";
	optionEle.value = "0";  
	srViewDropdownEle.appendChild(optionEle); 
	distinctSRMap["0"] = true;
	
	$.each( data, function( key, srList ) {
		
		if(srList){ 
			
			for (var int = 0; int < srList.length; int++) {
				
				var srText = srList[int];
				
				if(srText && srText.indexOf('-') != -1){
					
					var value = srText.split('-')[0];
					var text =  srText.split('-')[1];
					
					if(value && !distinctSRMap[value] ){
						
						if(srViewDropdownEle){
							var optionEle = document.createElement("option");
							
							optionEle.text = text;
							optionEle.value = value; 
							
							srViewDropdownEle.appendChild(optionEle);
							
							distinctSRMap[value] = true;
						}
						 
						
					}
	
				}  
				
			}
			
			
		}
		
	});
	
}


function prevYear(){
	 
	_yMonthly = _yMonthly - 1;
	
	// loading timesheet for previous year here
	loadMonthlyTimeSheets();
}


function nextYear(){
	
	_yMonthly = _yMonthly + 1;
	
	// loading timesheet for next year here
	loadMonthlyTimeSheets();
}


function getEmpId(uiElementId, uiEventElementId) {

	var restURL = "rest/notifications/employeeId?q=";
	jQuery("#" + uiElementId)
			.autocomplete(
					{
						source : function(request, response) {
							jQuery
									.getJSON(
											restURL + request.term,
											{
												"corp_grp_id" : uiEventElementId
											},
											function(data) {

												var empIds = new Array();
												

												if (data) {
													for ( var i=0; i < data.length; i++) {
	
														var empObj = data[i];
														if (empObj) {
															empIds.push(empObj['emp_id']);
															empNames[empObj['emp_id']] = empObj['emp_name']+"~"+empObj['user_id']+"~"+empObj['cur_con_id'];
														}
													}
												}
												response(empIds);
												
											});
						},
						minLength : 3,
						select : function(event, ui) {
							var selectedObj = ui.item;
							var empObj = empNames[selectedObj.value];
							var empName = [empObj.split("~")[0]]
							_empId = selectedObj.value;
							_userId = empObj.split("~")[1];
							jQuery("#" + uiElementId).val(selectedObj.value);								
						
							$('#calendar').fullCalendar('destroy');
							$('#calendarNext').fullCalendar('destroy');
							initiateTimeSheet(_mCal, _yCal);  
							
							$('#selecetedEmpName').html(empName);
							
							var timeSheetContainerEle = document.getElementById('event-popup-container');
							$(timeSheetContainerEle).html('<h6 class="text-center p-t-b-22 gray-color">Please select date to view SR details.</h6>');
							
							
							return false;
							 
							
						},
						open : function() {
							jQuery(this).removeClass("ui-corner-all").addClass(
									"ui-corner-top");
						},
						close : function() {
							jQuery(this).removeClass("ui-corner-top").addClass(
									"ui-corner-all");
						}
					});

	jQuery("#" + uiElementId).autocomplete("option", "delay", 100);
	
}


function manageEffortRules(){
	
	var elements = document.getElementsByName("effort-type");
	
	if(elements){
		
		for(var int = 0; int < elements.length; int++){
			
			var element = elements[int];
			
			if(element && element.id){
				
				var elementId = element.id;
				
				var isReadOnly = true;
				
				setEffortRules(elementId, isReadOnly);
				
			} 
			
		}
		
	}
}


function setEffortRules(elementId, isReadOnly){
	
	var index = elementId.split("-")[2]; 

	var effortType = $('#effort-type-' + index).val();
	
	if(effortType){
		
		var effortElementId = "effort-" + index;
		
		if(effortType >= 2 && effortType <= 5){
			
			if(document.getElementById('effort-' + index)){
				if(!isReadOnly)
					$('#' + effortElementId).val("00:00");
				$('#' + effortElementId).attr("disabled", true); 
			}
			
			if(document.getElementById('travel-time-' + index)){
				if(!isReadOnly)
					$('#travel-time-' + index).val("00:00");
				$('#travel-time-' + index).attr("disabled", true); 
			}
			
		}else if(effortType == 7){
			if(!isReadOnly)
				$('#' + effortElementId).val("00:00");
			$('#' + effortElementId).attr("disabled", true);   
			$('#travel-time-' + index).attr("disabled", false); 
		}else if(effortType == 8){
			if(!isReadOnly)
				$('#' + effortElementId).val("");
			$('#' + effortElementId).attr("disabled", true);   
			$('#travel-time-' + index).attr("disabled", false); 
		}  
		else{
			if(!isReadOnly)
				$('#' + effortElementId).val("");
			$('#' + effortElementId).attr("disabled", false); 
			
			if(!isReadOnly)
				$('#travel-time-' + index).val("");
			$('#travel-time-' + index).attr("disabled", false); 
		}
		if(!isReadOnly)
			calculateTotalValues();
		
	} 
	
}
function showExpList() {
	
	var reqURL = "web/getExpenseNo.json";
	//var reqURL = "TimeSheet.do?method=getExpenseNo&user_id=" + _userId + "&month=" + _mCal;
	showProgress("Processing", "Please wait...");
	
	$.ajax({ 
		 type: 'GET',
	 	 dataType: "json",
	  	 url: reqURL,
	  	 success: function(result){ 
	 		if(result && result['data']){  
	 			closeProgress();
	 			 var expenseNumber=result['data']; 

	 			$("#exp_list_table").html('');
	 			var tableHTML = $('#exp_list_table');
	 			
 			    var thead = $('<thead></thead>').appendTo(tableHTML);
 			    var trHTML = $('<tr></tr>').appendTo(thead);
 			    var thHTML = $('<th></th>').append('S.No').appendTo(trHTML);
 			    var thHTML = $('<th></th>').append('Expenses Number').appendTo(trHTML);	
 			    var thHTML = $('<th></th>').append('Sr Number').appendTo(trHTML);	
 			    var thHTML = $('<th></th>').append('Expense Amount').appendTo(trHTML);	

 			    var tbody = $('<tbody></tbody>').appendTo(tableHTML);

	 			for(var i=0; i < expenseNumber.length;i++){
	 				var trHTML = $('<tr></tr>').appendTo(tbody);
	 				var tdHTML = $('<td></td>').append(i+1).appendTo(trHTML);
	 				var tdHTML = $('<td></td>').append(expenseNumber[i]["expNo"]).appendTo(trHTML);
	 				var tdHTML = $('<td></td>').append(expenseNumber[i]["srNo"]).appendTo(trHTML);
	 				var tdHTML = $('<td></td>').append(expenseNumber[i]["expAmount"]).appendTo(trHTML).append(" ").append(expenseNumber[i]["curCode"]).appendTo(trHTML);


	 			}
	 			
	 			var baseElement = document.getElementById("show_exp_list_dialog");
	 			$(baseElement).dialog({ 
	 				  modal:true,
	 					width: 600,
	 					title:"List of Expense Number",					
	 					closeOnEscape:true,
	 					position: [($(window).width() / 2) - (600 / 2), 150],
	 					open: function(event, ui) { $(".ui-dialog-titlebar-close").show(); },
	 						close: function(event,ui){
	 							$( this ).dialog( "close" );
	 							
	 						}
	 					
	 				});
	 			
	 			
			}
	}});	 
	 
}

function formatTime(value){
	
	if(value.toString().length == 1)
		value = "0" + value;
	
	return value;
}

function formatHours(valueDt){
	
	var retVal = "00";
	
	var baseDt = new Date(0, 0, 0, 0, 0, 0, 0);
	
	if(valueDt){
		retVal = parseInt(Math.abs(valueDt - baseDt) / 36e5);
	}
	
	return formatTime(retVal);
	
}
function removeSegment(index){
	
	$("#SR_panel_"+index).remove();
	
}

