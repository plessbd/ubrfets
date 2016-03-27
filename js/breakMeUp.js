"use strict";

var formFields = {};
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

fetch('/js/holidays.json').then(function(response){
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
		var acrual = this.getAcrualRates(thisUser, reportDate);

		timesheet["Vacation Charges"] = timesheet["Vacation Charges"] || timesheet["Vacation Dates"].length * 8;
		timesheet["Sick Charges"] = timesheet["Sick Charges"] || timesheet["Sick Dates"].length * 8;
		timesheet["Holiday Charges"] = timesheet["Holiday Charges"] || timesheet["Holiday Dates"].length * 8;
		timesheet["Holiday Earned"] = timesheet["Holiday Earned"] || timesheet["Holiday Earned Dates"].length * 8;
		setPdfField("Vacation Earned", acrual.vacation);
		setPdfField("Sick Earned", acrual.sick);
		setPdfField("Employee Name", thisUser.name);
		setPdfField("Person Number", thisUser.id);
		setPdfField("Report Period", reportDate.format("YYYY-MM"));
		setPdfField("FT Vacation Taken", timesheet["Vacation Dates"].length);
    setPdfField("FT Vacation Dates", timesheet["Vacation Dates"].join(", "));
    setPdfField("FT Sick Taken", timesheet["Sick Dates"].length);
    setPdfField("FT Sick Dates", timesheet["Sick Dates"].join(", "));
    setPdfField("FT Holidays Taken", timesheet["Holiday Dates"].length);
    setPdfField("FT Holidays Dates", timesheet["Holiday Dates"].join(", "));
		setPdfField("Vacation Charges", timesheet["Vacation Charges"]);
    setPdfField("Sick Charges", timesheet["Sick Charges"]);
    setPdfField("Holiday Charges", timesheet["Holiday Charges"]);
		setPdfField("FT Holidays Earned", timesheet["Holiday Earned Dates"].length);
		setPdfField("FT Holidays Earned Dates", timesheet["Holiday Earned Dates"].join(", "));
		setPdfField("Holiday Earned", timesheet["Holiday Earned"]);
		if (thisUser.isFullTime) {
			setPdfField("Full Time", true);
		} else {
			setPdfField("Part Time", true);
		}
	}
};

addUser.addEventListener("click", function(/* ev */) {
	var hireDate;
	var newUser = {
		"name": "",
		"hireDate": {
			"year": 0,
			"month": 0,
			"day": 0
		},
		"id": "",
		"initialSick": 0,
		"initialHoliday": 0,
		"initialVacation": 0,
		"isFullTime": true,
		"timesheets": {}
	};
	if (newUserForm.style.display == "") {

		newUser.name = nameElm.value;
		newUser.id = idElm.value;
		newUser.initialSick = parseFloat(iSickElm.value);
		newUser.initialHoliday = parseFloat(iHolidaElm.value);
		newUser.initialVacation = parseFloat(iVacationElm.value);

		hireDate = moment(hireDateElm.value, "YYYY-MM-DD");

		if(newUser.name !== "" && hireDate.isValid()){

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
	var target = ev.target;
	if (target.value !== "Select") {
		localforage.getItem("timesheets").then(function(data) {
			var thisUser = data[peeps.value],
				thisTimesheet = thisUser.timeSheets[target.value];

			userOperations.setPdfFields(thisUser, target.options[target.selectedIndex].text);
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
	while (len--) {
		peeps.add(new Option(data[len].name, len));
	}
};

reports.addEventListener("change", reportChanges);

localforage.getItem("timesheets").then(function(data){
	if(data === null){
		data = [];
	}
	loadTimesheets(data);
});
peeps.addEventListener("change", function(ev) {
	var curLength = reports.options.length;
	while (curLength--) {
		reports.remove(curLength);
	}
	reports.add(new Option("Select Timesheet", "Select"));
	if (ev.target.value !== "Select") {
		localforage.getItem("timesheets").then(function(data) {
			var usersTimesheets = data[ev.target.value].timeSheets;
			var timeSheetIndexes = Object.keys(usersTimesheets);
			var reportsLen = timeSheetIndexes.length;
			while (reportsLen--) {
				var tsDisplay = timeSheetIndexes[reportsLen];
				reports.add(new Option(tsDisplay, tsDisplay));
			}
		});
	}
});

function saveDatabase() {
	var blob = new Blob([JSON.stringify(Users)], {
		type: "application/json;charset=utf-8"
	});
	saveAs(blob, "timeSheetDatabase.json");
}
