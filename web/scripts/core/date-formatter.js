
function getDateInClientTimeZone(value, isScriptDateFormat){
	
	if(value != null && $.trim(value).length > 0){
		var d = value;
		if(!isScriptDateFormat){
			d = changeSQLDateTimeToScriptDate(value); 
		}
		value = convertDateToLocalDate(d, -330); 
		//value = value.toISOString().slice(0, 19).replace('T', ' ');
		/*value = "" + value.getFullYear() + "-" +
	    ('00' + (value.getMonth()+1)).slice(-2) + '-' +
	    ('00' + value.getDate()).slice(-2) + ' ' + 
	    ('00' + value.getHours()).slice(-2) + ':' + 
	    ('00' + value.getMinutes()).slice(-2) + ':' + 
	    ('00' + value.getSeconds()).slice(-2); */
		//value = moment(value).format('YYYY-MM-DD HH:mm:ss a');
		if(!isScriptDateFormat){
			value = dateFormat(value, "yyyy-mm-dd HH:MM:ss TT");
		}

	}
	
	return value;
	
}

function changeSQLDateToScriptDate(value){
	
	
	if(value && $.trim(value).length > 0){
		var valueArr = value.split("-");
		value = new Date(valueArr[0], parseInt(valueArr[1]) - 1, valueArr[2]);
	}
	
	return value;
	
}


//value format "2011-07-14 11:23:00"
function changeSQLDateTimeToScriptDate(value){
	
	if(value && $.trim(value).length > 0){
		var t = value.split(/[- :]/);

		// Apply each element to the Date function
		value = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]); 
	}
	
	return value;
	 
}

 

function convertDateToLocalDate(date, offset) {
	//console.log(date); 

	
	var newDate = date;
    var clientDate = new Date();

    if(clientDate.getTimezoneOffset() != offset){
    	
    	// create Date object for current location
    	//console.log(date.getTimezoneOffset());
    	utc = date.getTime() + ((offset) * 60000);
        // convert to msec
        // add local time zone offset 
        // get UTC time in msec
        //var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
     
    	
        var utcTimeZone = new Date(utc);
    	//console.log(newDate); 
    	
    	newDate = new Date(utc - (60000*(clientDate.getTimezoneOffset())) );
    }
    
    //newDate = new Date(newDate.getTime() + 330*60000);
    
	//console.log(newDate); 
    // return time as a string
    return newDate;

	
}



function changeDateFormat(inputValue, inputFormat, outputFormat){
	if(inputValue && inputFormat && outputFormat){
		if(inputFormat.indexOf("-") != -1){
			var date = changeSQLDateToScriptDate(inputValue);
			return dateFormat(date, outputFormat);
		}
	}
}

function getDaysBetweenDates(d0, d1) {

	  var msPerDay = 8.64e7;

	  // Copy dates so don't mess them up
	  var x0 = new Date(d0);
	  var x1 = new Date(d1);

	  // Set to noon - avoid DST errors
	  x0.setHours(12,0,0);
	  x1.setHours(12,0,0);

	  // Round to remove daylight saving errors
	  return Math.round( (x1 - x0) / msPerDay );
}


var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

var months = {
	    'January' : '01',
	    'February' : '02',
	    'March' : '03',
	    'April' : '04',
	    'May' : '05',
	    'June' : '06',
	    'July' : '07',
	    'August' : '08',
	    'September' : '09',
	    'October' : '10',
	    'November' : '11',
	    'December' : '12',
	}


function getDateFromFormat(formattedDate){
	
	if(formattedDate){
		formattedDate = formattedDate.trim();
		
		var words = formattedDate.split(" ");
		
		var day = words[0];
	
		var year = words[2];
		
		words = words[1].split(",");
		
		var month = months[words[0]];
		
		var dateString = month + "/" + day + "/" + year; 
			
		return dateString;
	}
	
}