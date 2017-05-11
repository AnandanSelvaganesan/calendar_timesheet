function saveData(date) {

	if (doBasicValidation()) {
		var dataString = getTimeSheetData();

		if (dataString) {

			var reqURL = "TimeSheet.do?method=saveTimeSheetEntry";

			$.post(reqURL, {
				"TIME_SHEET_DATA" : dataString,
				"timeStamp" : new Date().getTime(),
				"USER_ID" : _userId
			}, function(result) {
				if (result && result['STATUS'] && result['MESSAGE']) {

					// alert(result['MESSAGE']);
					var baseElement = $('#show_alert_dialog')[0];
					var titleMes = 'Alert';
					showAlertDialog(baseElement, titleMes, result['MESSAGE']);
					$('#calendar').fullCalendar('destroy');
					$('#calendarNext').fullCalendar('destroy');
					initiateTimeSheet(_mCal, _yCal);
					_sDate = date;
					_isDataSubmited = true;
				}
			}, "json");
		}
	}

}

function getTimeSheetData() {

	var jsonDataStr;

	var activeDateEle = document.getElementById('time-sheet-date');

	if (activeDateEle) {

		var timeSheetDataObj = {};

		var timeSheetEle = document.getElementById('time-sheet');

		var dataArr = [];

		var activeDate = $(activeDateEle).val();

		var start = new Date(changeSQLDateToScriptDate(activeDate));

		var isValidData = true;

		for (var int = 0; int <= _srCount; int++) {

			var replicateToDateEle = document.getElementById("effort-till-"
					+ int);

			var end = activeDate;

			if (replicateToDateEle
					&& $.trim($(replicateToDateEle).val()).length > 0) {

				end = new Date(changeSQLDateToScriptDate($(replicateToDateEle)
						.val()));

			} else {
				end = new Date(changeSQLDateToScriptDate(activeDate));
			}

			var replicationCounter = 0;

			var dataObj = {}; 

			while (replicationCounter == 0 || start <= end) {

				var activeStartDate = moment(start).format("YYYY-MM-DD");

				if (replicationCounter == 0
						|| (replicationCounter != 0 && dataObj && isSRActive(
								activeStartDate, dataObj))) {

					retObj = _getSRData(activeStartDate, int);
					
					if(retObj && retObj['STATUS'] && retObj['STATUS'] == "Success"){

						dataObj = retObj['DATA'];
						
						if (replicationCounter > 0 && dataObj['SR_NUMBER']) {
	
							var timeSheetObj = getTimeSheetObj(activeStartDate, dataObj); 
							
							if(timeSheetObj && timeSheetObj['STATUS'] && timeSheetObj['STATUS'] == "Success"
								&& timeSheetObj['time_sheet_id'])
								dataObj['TIME_SHEET_ID'] = timeSheetObj['time_sheet_id'];
							else if(timeSheetObj && timeSheetObj['STATUS'] == "Error" && timeSheetObj['MESSAGE']){
								var baseElement = $('#show_alert_dialog')[0];
								var titleMes = 'Alert';
								showAlertDialog(baseElement, titleMes, timeSheetObj['MESSAGE']);
								isValidData = false;
								dataArr = [];
								break; 
							}else if(!timeSheetObj){
								dataObj['TIME_SHEET_ID'] = "";
							}
	
						}
	
						if (!$.isEmptyObject(dataObj)) {
							dataArr.push(dataObj);
						}
						
					}else if (retObj && retObj['STATUS'] && retObj['STATUS'] == "Error" && retObj['MESSAGE']){
						
						var baseElement = $('#show_alert_dialog')[0];
						var titleMes = 'Alert';
						showAlertDialog(baseElement, titleMes, retObj['MESSAGE']);
						isValidData = false;
						dataArr = [];
						break; 
					}

				} else if (start != end) {
					//console.log("SR is not active for " + activeStartDate);
				}

				var newDate = start.setDate(start.getDate() + 1);
				start = new Date(newDate);

				replicationCounter++;

			}

			start = new Date(changeSQLDateToScriptDate(activeDate));

			if (!isValidData)
				break;

		}

		if (isValidData && dataArr && dataArr.length > 0) {
			timeSheetDataObj['data'] = dataArr;
			jsonDataStr = JSON.stringify(timeSheetDataObj);
		}

	}

	return jsonDataStr;

}

function getTimeSheetObj(date, dataObj){
	
	var timeSheetObj = null;
	
	var baseDt = new Date(0, 0, 0, 0, 0, 0, 0);
	
	var replicatedDayTime = getDayTotalTime(dataObj['EFFORT'], dataObj['TRAVEL_TIME']);
	
	if(date && replicatedDayTime){ 
		
		var allEvents = [];
		allEvents = $('#calendar').fullCalendar('clientEvents'); 
		var srNo = dataObj['SR_NUMBER'];
		if (allEvents && allEvents.length > 0) { 
			var dayTotalTime = new Date(0, 0, 0, 0, 0, 0, 0);
			dayTotalTime.setHours(dayTotalTime.getHours() + replicatedDayTime.getHours());
			dayTotalTime.setMinutes(dayTotalTime.getMinutes() + replicatedDayTime.getMinutes());

			for (var int = 0; int < allEvents.length; int++) {
				var timesEvent = allEvents[int]; 
				if (timesEvent['time_sheet_id']) {  
					console.log(timesEvent['time_sheet_id']);
					var savedSR = timesEvent['sr_no'];  
					if(savedSR && date == timesEvent.start._i){ 
						var daySRTime = getDayTotalTime(timesEvent['effort'], timesEvent['travel_time']);
						dayTotalTime.setHours(dayTotalTime.getHours() + daySRTime.getHours());
						dayTotalTime.setMinutes(dayTotalTime.getMinutes() + daySRTime.getMinutes());

						var totalHours = parseInt(Math.abs(dayTotalTime - baseDt) / 36e5); 
						
						if(totalHours > 24){ 
							 
							timeSheetObj = {};
							timeSheetObj['STATUS'] = "Error";
							timeSheetObj['MESSAGE'] = "For " + timesEvent.start._i + " date, total time is exceeding from 24 hours." +
									" Kindly check and then try to replicate.";
							break;
						}
						
						if(savedSR == srNo && timesEvent['sr_key'] == "current"){  
							timeSheetObj = timesEvent;  
							timeSheetObj['STATUS'] = "Success";
						}  
					}
				}
			}  
		} 
	}
	
	return timeSheetObj;
	
}

function getDayTotalTime(effortVal, ttTimeVal){
	
	var retDate = new Date(0, 0, 0, 0, 0, 0, 0);
	
	if(effortVal && ttTimeVal){
		
		
		var effortArr = effortVal.split(":"); 
		
		var effortDate = new Date(0, 0, 0, 0, 0, 0, 0); 
		effortDate.setHours(effortArr[0]);
		effortDate.setMinutes(effortArr[1]);
		
		retDate.setHours(retDate.getHours() + effortDate.getHours());
		retDate.setMinutes(retDate.getMinutes() + effortDate.getMinutes());
		
		var ttArr = ttTimeVal.split(":"); 
		
		var ttDate = new Date(0, 0, 0, 0, 0, 0, 0); 
		ttDate.setHours(ttArr[0]);
		ttDate.setMinutes(ttArr[1]);
		
		retDate.setHours(retDate.getHours() + ttDate.getHours());
		retDate.setMinutes(retDate.getMinutes() + ttDate.getMinutes());

	}
	
	return retDate;
	
}

function isSRActive(date, replicatedObj) {

	var retVal = false;

	if (date && replicatedObj && replicatedObj['SR_NUMBER']) {

		if ((date && _activeSR[date] && replicatedObj['SR_NUMBER'] != 0)
				|| (date && replicatedObj['SR_NUMBER'] == 0 && !_activeSR[date])) {

			var srNumber = replicatedObj['SR_NUMBER'];

			if (srNumber != 0) {

				var activeSRs = _activeSR[date];

			} else {
				return true;
			}

			for (var int = 0; int < activeSRs.length; int++) {

				var activeSRObj = activeSRs[int];

				if (srNumber && activeSRObj.indexOf(srNumber + "-") != -1) {
					retVal = true;
					break;
				}

			}

		} else
			retVal = false;

	}

	return retVal;

}

function _getSRData(activeDate, index) {

	var retObj = {};
	
	var dataObj = {};

	var isValidTimeSheet = false;

	var isTimeEntered = true;
	
	var isEffortEntered = true;

	var isTravelEntered = true;
	
	var srKeyEle = document.getElementById('sr-key-' + index);
	
	if (document.getElementById('sr-number-' + index)) {
		var id = 'sr-number-' + index;
		dataObj['SR_NUMBER'] = $("#" + id + " option:selected").val();
		isValidTimeSheet = true;
	}

	if (isValidTimeSheet && srKeyEle) {
		
		var srKey = $(srKeyEle).val();
		

		if (document.getElementById('time-sheet-id-' + index)) {
			dataObj['TIME_SHEET_ID'] = $('#time-sheet-id-' + index).val();
		}
		
		if (document.getElementById('sr-key-' + index)) {
			dataObj['SR_KEY'] = $('#sr-key-' + index).val();
		}

		if (activeDate) {

			dataObj['START_DATE'] = activeDate;

			if (dataObj['START_DATE']) {
				dataObj['END_DATE'] = dataObj['START_DATE'];
			}

		}

		if (document.getElementById('effort-type-' + index)) {
			var id = 'effort-type-' + index;
			dataObj['EFFORT_TYPE_ID'] = $("#" + id + " option:selected").val();
			if (dataObj['EFFORT_TYPE_ID'] == 1){
				isTimeEntered = false;
				if(dataObj['SR_KEY'] == "current" || dataObj['SR_KEY'] == "add")
					isEffortEntered = false;
			}else if(dataObj['EFFORT_TYPE_ID'] == 8)
				isTravelEntered = false;
			else if(dataObj['EFFORT_TYPE_ID'] == 19){
				isEffortEntered = false;
			}
		}

		var effort = "00:00";
		if (document.getElementById('effort-' + index)) {
			if ($('#effort-' + index).val()
					&& $('#effort-' + index).val() != "00:00") {
				effort = $('#effort-' + index).val();
				isTimeEntered = true;
				isEffortEntered = true;
			}

		}

		dataObj['EFFORT'] = effort;

		var travelTime = "00:00";
		if (document.getElementById('travel-time-' + index)) {
			if ($('#travel-time-' + index).val()
					&& $('#travel-time-' + index).val() != "00:00") {
				travelTime = $('#travel-time-' + index).val();
				isTimeEntered = true;
				isTravelEntered = true;
			}
		}

		dataObj['TRAVEL_TIME'] = travelTime;

		var overTime = "00:00";
		if (document.getElementById('over-time-' + index)) {
			if ($('#over-time-' + index).val()
					&& $('#over-time-' + index).val() != "00:00") {
				overTime = $('#over-time-' + index).val();
				isTimeEntered = true;
			}
		}

		dataObj['OVER_TIME'] = overTime;

		if (document.getElementById('remarks-' + index)) {
			dataObj['REMARKS'] = $('#remarks-' + index).val();

		}

		dataObj['STATUS'] = "P";

	}

	if (isTimeEntered && isTravelEntered && isEffortEntered){
		retObj['DATA'] = dataObj;
		retObj['STATUS'] = "Success";
	}else if(!isEffortEntered && (dataObj['EFFORT_TYPE_ID'] == "19" || dataObj['EFFORT_TYPE_ID'] == "1")){
		var effortTypeEle = document.getElementById('effort-type-' + index); 
		retObj['DATA'] = null;
		retObj['STATUS'] = "Error";
		if(effortTypeEle)
			retObj['MESSAGE'] = "Please give some effort for " + $(effortTypeEle).find('option:selected').text();

	}
	else{
		retObj['STATUS'] = "Error";
		retObj['DATA'] = null;
	}
	
	return retObj;
}

function isAllDaysPunched() {

	var date = new Date($('#calendar').fullCalendar('getDate'));
	var month = date.getMonth();
	var year = date.getFullYear();
	if (isAllMonthPunched(month, year)) {

		var baseElement = $('#show_alert_dialog')[0];
		var titleMes = 'Alert';
		var message = "<div class='fontBold'>Are you sure to submit timesheet?";
		message += "<div>Note: <span class='red font12'>Submission of Timesheet will auto create Inspection allowance for the month per SR (if any)</span></div></div>";

		showConfirmDailog(baseElement, titleMes, message);
	}
}
function submitTimeSheet() {

	var date = new Date($('#calendar').fullCalendar('getDate'));
	var month = date.getMonth();
	var year = date.getFullYear();

	var reqURL = "TimeSheet.do?method=submitTimeSheet&user_id=" + _userId
			+ "&cur_con_id=" + _currId;

	showProgress("Processing", "Please wait...");

	$.post(reqURL, {
		"month" : month,
		"timeStamp" : new Date().getTime()
	}, function(result) {
		closeProgress();
		if (result && result['STATUS'] && result['MESSAGE']) {

			// alert(result['MESSAGE']);
			var baseElement = $('#show_alert_dialog')[0];
			var titleMes = 'Alert';
			
			var message = "<p style = 'text-align: left'> <b>" + result['MESSAGE'];
			if(result['expenseNos']){
				
				message += " Please find the below expenses which has been auto created by tool. </b><br><br>"
				
				var expenseNoArr = result['expenseNos'].split(",");
				
				for(var int = 0; int < expenseNoArr.length; int++){
					 
					var expenseNo = expenseNoArr[int];
					if(expenseNo)
						message += "" + (int + 1) + ". " + expenseNo + " <br>";
				}
				
				message += "</p>"; 
				
			}
			
			showAlertDialog(baseElement, titleMes, message);
			$('#calendar').fullCalendar('destroy');
			$('#calendarNext').fullCalendar('destroy');
			initiateTimeSheet(_mCal, _yCal);
			_sDate = date;
			_isDataSubmited = true;

		}
	}, "json");

}

function isAllMonthPunched(monthNo, year) {

	var retVal = true;

	var lastdate = new Date(year, monthNo + 1, 0);

	var monthDate = new Date(year, monthNo, 1);

	int = 0;

	while (monthDate <= lastdate) {

		monthDate.setHours(monthDate.getHours() + 5);
		monthDate.setMinutes(monthDate.getMinutes() + 30);

		if (!isDateHasEvent(monthDate)) {
			retVal = false;
			// alert("For " + moment(monthDate).format('dddd, MMM DD, YYYY') +
			// ", timesheet has not been punched. Please punch it and then do
			// the final submission.");
			var message = "For "
					+ moment(monthDate).format('dddd, MMM DD, YYYY')
					+ ", timesheet has not been punched. Please punch it and then do the final submission.";
			var baseElement = $('#show_alert_dialog')[0];
			var titleMes = 'Alert';
			showAlertDialog(baseElement, titleMes, message);

			break;
		}

		monthDate = new Date(year, monthNo, ++int);

	}

	return retVal;
}

function isDateHasEvent(date) {
	var retVal = false;
	var allEvents = [];
	allEvents = $('#calendar').fullCalendar('clientEvents');
	var timesEvents = $.grep(allEvents, function(v) {
		
		if(v.start._i){
			return v.start._i === moment(date).format("YYYY-MM-DD");
		}else
			return +v.start === +date;
		
		
	});

	if (timesEvents && timesEvents.length > 0) {
		retVal = true;
		var srEffortMap = {};
		for (var int = 0; int < timesEvents.length; int++) {
			var timesEvent = timesEvents[int];
			if (!timesEvent['time_sheet_id']) {
				if (!srEffortMap[timesEvent['sr_no']])
					srEffortMap[timesEvent['sr_no']] = "Not Available";
			} else if (srEffortMap[timesEvent['sr_no']]) {
				delete srEffortMap[timesEvent['sr_no']];
			} else if (!srEffortMap[timesEvent['sr_no']]) {
				srEffortMap[timesEvent['sr_no']] = "Available";
			}
		}

		if (!$.isEmptyObject(srEffortMap)) {

			$.each(srEffortMap, function(key, value) {
				if (value == "Not Available")
					retVal = false;
			});

		}
	}

	return retVal;
}