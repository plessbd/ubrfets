"use strict";

var formFields = {
	"EmployeeName": "",
	"ReportPeriod": "",
	"PersonNumber": "",
	"EmpTypeFT": "",
	"EmpTypePT": "",
	"MonF": "",
	"MonT": "",
	"TueF": "",
	"TueT": "",
	"WedF": "",
	"WedT": "",
	"ThuF": "",
	"ThuT": "",
	"FriF": "",
	"FriT": "",
	"VacaNumFT": "",
	"VacaDatesFT": "",
	"VacaNumPT": "",
	"VacaDatesPT": "",
	"SickNumFT": "",
	"SickDatesFT": "",
	"SickNumPT": "",
	"SickDatesPT": "",
	"HolidayNumFT": "",
	"HolidayDatesFT": "",
	"HolidayNumPT": "",
	"HolidayDatesPT": "",
	"EarnedHolidayNumFT": "",
	"EarnedHolidayDatesFT": "",
	"EarnedHolidayNumPT": "",
	"EarnedHolidayDatesPT": "",
	"VacaPrevBal": "",
	"SickPrevBal": "",
	"HolidayPrevBal": "",
	"VacaEarned": "",
	"SickEarned": "",
	"HolidayEarned": "",
	"EmployeeSignYear": "",
	"EmployeeSignMonth": "",
	"EmployeeSignDay": "",
	"VacaSub": "",
	"SickSub": "",
	"HolidaySub": "",
	"VacaCharged": "",
	"SickCharged": "",
	"HolidayCharged": "",
	"DirectorSignYear": "",
	"DirectorSignMonth": "",
	"DirectorSignDay": "",
	"VacaBalance": "",
	"SickBalance": "",
	"HolidayBalance": ""
};

var peeps = document.getElementById("person");
var reports = document.getElementById("reports");

var addUser = document.getElementById("add-user");
var newUserForm = document.getElementById("new-user");
var nameElm = document.getElementById("full-name");
var idElm = document.getElementById("emp-num");
var iSickElm = document.getElementById("initial-sick");
var iHolidaElm = document.getElementById("initial-holidy");
var iVacationElm = document.getElementById("initial-vacation");
var hireDateElm = document.getElementById("hire-date");

localforage.getItem("timesheets").then(function(data){
	if (data === null){
		localforage.setItem("timesheets", []);
		return [];
	}
	return data;
});
var observedHolidays;

fetch("/js/holidays.json").then(function(response){
	return response.json();
}).then(function(json) {
	observedHolidays = json;
});
var userOperations = {
	getCurrentUser: function(){
		return localforage.getItem("timesheets").then(function(data){
			return data[peeps.value];
		});
	},
	saveCurrentUser: function(user){
		localforage.getItem("timesheets").then(function(data){
			data[peeps.value] = user;
			localforage.setItem("timesheets", data);
			loadTimesheets(data);
		});
	},
	getAcrualRates: function(thisUser, reportDate){
		var hireArray = thisUser.hireDate,
			hireMonth = hireArray.month,
			numMonths;

		// If the employee worked more than half the hire month we want to count it as a month towards their acruals
		if (Math.floor(new Date(2015, hireMonth, 0).getDate() / 2) <= hireArray.day) {
			hireMonth = hireMonth + 1;
		}

		var hireDate = moment(thisUser.hireDate);

		numMonths = reportDate.diff(hireDate, "months");
		var acrual = {
			vacation: 1.83,
			sick: 1.75
		};
		if (numMonths < 24) {
			acrual.vacation = 1.33;
			acrual.sick = 1.25;
		}
		else if (numMonths < 36) {
			acrual.vacation = 1.42;
			acrual.sick = 1.33;
		}
		else if (numMonths < 72) {
			acrual.vacation = 1.58;
			acrual.sick = 1.5;
		} else if (numMonths < 84) {
			acrual.vacation = 1.75;
			acrual.sick = 1.66;
		}
		return acrual;
	},
	setPdfFields: function(thisUser, reportDate, timesheet){
		//TODO Turn into its own function
		if(!timesheet.hasOwnProperty("VacaEarned") || !timesheet.hasOwnProperty("SickEarned")){
			var acrual = this.getAcrualRates(thisUser, reportDate);
			timesheet.VacaEarned = timesheet.VacaEarned || acrual.vacation;
			timesheet.SickEarned = timesheet.SickEarned || acrual.sick;
		}

		if(!timesheet.hasOwnProperty("VacaPrevBal") || !timesheet.hasOwnProperty("SickPrevBal") || !timesheet.hasOwnProperty("HolidayPrevBal")){
			var prevMonth = moment(reportDate).subtract(1, "month");
			if(thisUser.timesheets.hasOwnProperty(prevMonth)){
				timesheet.VacaPrevBal = thisUser.timesheets[prevMonth].VacaPrevBal || 0;
				timesheet.SickPrevBal = thisUser.timesheets[prevMonth].SickPrevBal || 0;
				timesheet.HolidayPrevBal = thisUser.timesheets[prevMonth].HolidayPrevBal || 0;
			}
			else {
				timesheet.VacaPrevBal = thisUser.initialVacation || 0;
				timesheet.SickPrevBal = thisUser.initialSick || 0;
				timesheet.HolidayPrevBal = thisUser.initialHoliday || 0;
			}
		}

		timesheet.HolidayEarned = timesheet.HolidayEarned || timesheet.EarnedHolidayDates.length;

		timesheet.VacaSub = timesheet.VacaSub || (timesheet.VacaPrevBal + timesheet.VacaEarned);
		timesheet.SickSub = timesheet.SickSub || (timesheet.SickPrevBal + timesheet.SickEarned);
		timesheet.HolidaySub = timesheet.HolidaySub || (timesheet.HolidayPrevBal + timesheet.HolidayEarned);

		timesheet.VacaCharged = timesheet.VacaCharged || timesheet.VacaDates.length || 0;
		timesheet.SickCharged = timesheet.SickCharged || timesheet.SickDates.length || 0;
		timesheet.HolidayCharged = timesheet.HolidayCharged || timesheet.HolidayDates.length || 0;

		timesheet.VacaBalance = timesheet.VacaBalance || (timesheet.VacaSub - timesheet.VacaCharged);
		timesheet.SickBalance = timesheet.SickBalance || (timesheet.SickSub - timesheet.SickCharged);
		timesheet.HolidayBalance = timesheet.HolidayBalance || (timesheet.HolidaySub - timesheet.HolidayCharged);

		timesheet.EarnedHolidayDates = timesheet.EarnedHolidayDates || [];

		formFields.EmployeeName = thisUser.EmployeeName;
		formFields.ReportPeriod = reportDate.format("YYYY-MM");
		formFields.PersonNumber = thisUser.PersonNumber;

		if (thisUser.isFullTime) {
			formFields.EmpTypeFT = true;
			if(timesheet.VacaDates){
				formFields.VacaNumFT = timesheet.VacaDates.length || 0;
				formFields.VacaDatesFT = timesheet.VacaDates.join(", ") || "";
			}
			else {
				formFields.VacaNumFT = 0;
				formFields.VacaDatesFT = "";
			}
			if(timesheet.SickDates){
				formFields.SickNumFT = timesheet.SickDates.length || 0;
				formFields.SickDatesFT = timesheet.SickDates.join(", ") || "";
			}
			else {
				formFields.SickNumFT = 0;
				formFields.SickDatesFT = "";
			}
			if(timesheet.HolidayDates){
				formFields.HolidayNumFT = timesheet.HolidayDates.length || 0;
				formFields.HolidayDatesFT = timesheet.HolidayDates.join(", ") || "";
			}
			else {
				formFields.HolidayNumFT = 0;
				formFields.HolidayDatesFT = "";
			}
			if(timesheet.EarnedHolidayDates){
				formFields.EarnedHolidayNumFT = timesheet.EarnedHolidayDates.length || 0;
				formFields.EarnedHolidayDatesFT = timesheet.EarnedHolidayDates.join(", ") || "";
			}
			else {
				formFields.EarnedHolidayNumFT = 0;
				formFields.EarnedHolidayDatesFT = "";
			}
		} else {
			formFields.EmpTypePT = true;
			formFields.VacaNumPT = timesheet.VacaDates.length || 0;
			formFields.VacaDatesPT = timesheet.VacaDates.join(", ") || "";
			formFields.SickNumPT = timesheet.SickDates.length;
			formFields.SickDatesPT = timesheet.SickDates.join(", ");
			formFields.HolidayNumPT = timesheet.HolidayDates.length;
			formFields.HolidayDatesPT = timesheet.HolidayDates.join(", ");
		}

		var timeSheetKeys = Object.keys(timesheet);
		var keyLen = timeSheetKeys.length;
		var timeKey;
		while(keyLen--){
			timeKey = timeSheetKeys[keyLen];
			if(formFields.hasOwnProperty(timeKey)) {
				formFields[timeKey] = timesheet[timeKey];
			}
		}
		formFields.HolidayEarned = timesheet.EarnedHolidayDates.length || 0;
	}
};

addUser.addEventListener("click", function(/* ev */) {
	var hireDate;
	var newUser = {
		"EmployeeName": "",
		"hireDate": {
			"year": 0,
			"month": 0,
			"day": 0
		},
		"PersonNumber": "",
		"initialSick": 0,
		"initialHoliday": 0,
		"initialVacation": 0,
		"isFullTime": true,
		"timesheets": {}
	};
	if (newUserForm.style.display == "") {

		newUser.EmployeeName = nameElm.value;
		newUser.PersonNumber = idElm.value;
		newUser.initialSick = parseFloat(iSickElm.value);
		newUser.initialHoliday = parseFloat(iHolidaElm.value);
		newUser.initialVacation = parseFloat(iVacationElm.value);

		hireDate = moment(hireDateElm.value, "YYYY-MM-DD");

		if(newUser.PersonNumber !== "" && hireDate.isValid()){

			addUser.textContent = "Add New User";
			newUserForm.style.display = "none";

			idElm.value = "";
			iSickElm.value = "";
			iHolidaElm.value = "";
			iVacationElm.value = "";
			hireDateElm.value = "";

			newUser.hireDate.year = hireDate.year();
			newUser.hireDate.month = hireDate.month();
			newUser.hireDate.day = hireDate.day();
			localforage.getItem("timesheets").then(function(data){
				data.push(newUser);
				loadTimesheets(data);
				localforage.setItem("timesheets", data);
			});
		}
	} else {
		newUserForm.style.display = "";
		addUser.textContent = "Save User";
	}
});

var reportChanges = function(ev){
	var target;
	if(ev){
		target = ev.target;
	}
	else {
		target = reports;
	}
	if (target.value !== "Select") {
		localforage.getItem("timesheets").then(function(data) {
			var thisUser = data[peeps.value],
				thisTimesheet = thisUser.timesheets[target.value];
			userOperations.setPdfFields(thisUser, moment(target.options[target.selectedIndex].text, "YYYY-MM"), thisTimesheet);
			renderTimesheet();
		});
	}
};

var loadTimesheets = function(data){
	var curLength = peeps.options.length;
	while (curLength--) {
		peeps.remove(curLength);
	}
	var len = data.length;
	peeps.add(new Option("Select", "Select"));
	while (len--) {
		peeps.add(new Option(data[len].EmployeeName, len));
	}
};

reports.addEventListener("change", reportChanges);

localforage.getItem("timesheets").then(function(data){
	if(data === null){
		data = [];
	}
	loadTimesheets(data);
});
var peepsChange = function(ev) {
	var target;
	if(ev){
		target = ev.target;
	}
	else {
		target = peeps;
	}
	var curLength = reports.options.length;
	while (curLength--) {
		reports.remove(curLength);
	}
	reports.add(new Option("Select Timesheet", "Select"));
	if (target.value !== "Select") {
		localforage.getItem("timesheets").then(function(data) {
			var usersTimesheets = data[target.value].timesheets;
			var timeSheetIndexes = Object.keys(usersTimesheets);
			var reportsLen = timeSheetIndexes.length;
			while (reportsLen--) {
				var tsDisplay = timeSheetIndexes[reportsLen];
				reports.add(new Option(tsDisplay, tsDisplay));
			}
		});
	}
};

peeps.addEventListener("change", peepsChange);
