
function doBasicValidation() {
	
	// checking some basic validations here
	
	var retVal = true;
	
	
	//checking for effort should be less or equal to 24 hours in a day
	var startDt = new Date(0, 0, 0, 0, 0, 0, 0);

	var totalDt = new Date(0, 0, 0, 0, 0, 0, 0);
	
	if ($('#total-effort').text()) {
		totalDt = calculateTime($('#total-effort').text(), ":", totalDt);
	}

	if ($('#total-travel-time').text()) {
		totalDt = calculateTime($('#total-travel-time').text(), ":", totalDt);
	}

	var totalHours = Math.abs(totalDt - startDt) / 36e5;
	
	if (totalHours && totalHours > 24) {  
		
		var baseElement = $('#show_alert_dialog')[0];
		var titleMes = 'Alert';
		showAlertDialog(baseElement, titleMes,
				"Total time cannot exceed 24 hours.");
		retVal = false; 

	}
	
	//checking for duplicate efforts 
	var resultObj = checkDuplicateEfforts();
	
	if(resultObj && resultObj['STATUS'] && resultObj['STATUS'] == "Error"){
		var baseElement = $('#show_alert_dialog')[0];
		var titleMes = 'Alert';
		showAlertDialog(baseElement, titleMes, resultObj['MESSAGE']);
		retVal = false;
	}
	

	return retVal;

}

function checkDuplicateEfforts(){
	
	var retObj = {};
	var uniqueEffortMap = {};
	
	for (var int = 0; int <= _srCount; int++) {
		
		var effortTypeEle = document.getElementById('effort-type-' + int);
		var srNumberEle = document.getElementById('sr-number-' + int);
		var effortEle = document.getElementById('effort-' + int);
		var travelTimeEle = document.getElementById('travel-time-' + int);

		if(effortTypeEle && srNumberEle && effortEle && travelTimeEle){
			
			var effortType = $(effortTypeEle).val();
			var srNumber = $(srNumberEle).val();
			var effort = $(effortEle).val();
			var travelTime = $(travelTimeEle).val();
			if(effortType && srNumber && (effort || travelTime)){
				var effortKey = effortType + "-" + srNumber;
				if(!uniqueEffortMap[effortKey]){
					uniqueEffortMap[effortKey] = $(effortTypeEle).find('option:selected').text() + " - " + $(srNumberEle).find('option:selected').text();
					retObj['STATUS'] = "Success"; 
				}else{
					
					var keyIssue = "travel time";
					if(effort) 
						keyIssue = "effort";
					var message = uniqueEffortMap[effortKey] + " this has duplicate " + keyIssue + ". Please give only unique " + keyIssue +".";
					retObj['STATUS'] = "Error";
					retObj['MESSAGE'] = message;
					break;
				}
					
			}
			
		}
		
	}
	
	return retObj;
	
}