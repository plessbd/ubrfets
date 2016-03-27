var getReport = function() {
	var calendarbody = document.getElementById("calendarbody");
	if (!calendarbody) {
		return null;
	}

	var i, len;
	var result = {
		"holiday": [],
		"vacation": [],
		"sick": []
	};
	var dayTypes = Object.keys(result);

	len = dayTypes.length;
	for (i = 0; i < len; ++i) {
		Array.prototype.forEach.call(calendarbody.getElementsByClassName(dayTypes[i]), function(el) {
			result[dayTypes[i]].push(el.textContent);
		});
	}

	return result;
};

/**
 * @return string the locale-specific short name of the day of the week
 *         (0 == Sunday in en-GB)
 */
function dayToLocaleString(day) {
	// The 6th of March 2016 happens to be a Sunday.
	var date = new Date(2016, 2, 6);
	date.setDate(date.getDate() + day);

	return date.toLocaleDateString(navigator.language, {
		weekday: "short"
	});
}

/**
 * build an html-table-based month calendar
 * @param target {string} the id of the DOM element to which to set the html
 * @param referenceDate {Date} A date object whose month will be displayed.
 */
function simpleMonthCalendar(target, referenceDate) {

	var date = new Date(referenceDate.getFullYear(), referenceDate.getMonth());
	var cssClass, currDay, i;

	var calendarTable = "<table class='calendar'><thead><tr class='heading_month'><th colspan='7'>" +
		referenceDate.toLocaleDateString(navigator.language, {
			month: "short",
			year: "numeric"
		}) +
		"</th></tr><tr class='heading_day'>";

	for (i = 0; i < 7; ++i) {
		calendarTable += "<th>" + dayToLocaleString(i) + "</th>";
	}

	calendarTable += "</thead><tbody id=\"calendarbody\"><tr>" + "<td></td>".repeat(date.getDay());

	var refMonth = referenceDate.getMonth();
	for (; date.getMonth() === refMonth; date.setDate(date.getDate() + 1)) {
		currDay = date.getDay();
		cssClass = (currDay === 0 || currDay === 6) ? "weekend" : "workday";
		calendarTable += "<td class='" + cssClass + "'>" + date.getDate() + "</td>";

		if (currDay === 6) {
			calendarTable += "</tr><tr>";
		}
	}
	calendarTable += "<td></td>".repeat(7 - date.getDay()) + "</tr></tbody></table>";

	document.getElementById(target).innerHTML = calendarTable;
}

function showLastMonth() {
	var d = new Date();
	d.setMonth(d.getMonth() - 1);
	var lastMonth = d;
	simpleMonthCalendar("calendar", lastMonth);

	var calendarbody = document.getElementById("calendarbody");

	calendarbody.addEventListener("click", function(evt) {

		var eventTarget = evt.originalTarget || evt.target;
		var dayType = eventTarget.classList[0];

		if (!dayType || dayType === "weekend") {
			return;
		}

		eventTarget.classList.remove(dayType);

		switch (dayType) {
			case "workday":
				eventTarget.classList.add("holiday");
				break;
			case "holiday":
				eventTarget.classList.add("vacation");
				break;
			case "vacation":
				eventTarget.classList.add("sick");
				break;
			case "sick":
				eventTarget.classList.add("workday");
				break;
			default:
				// Sadness
				break;
		}
		var report = getReport();
		for (var dtype in report) {
			if (report.hasOwnProperty(dtype)) {
				document.getElementById("report-" + dtype).value = report[dtype].join(", ");
			}
		}
	});
}

var newTimesheet = document.getElementById("newtimesheet");
newTimesheet.addEventListener("click", function(/*evt*/) {
	var calendar = document.getElementById("calendar");

	switch(newTimesheet.textContent){
		case "New Timesheet":
			calendar.style.display = "";
			showLastMonth();
			newTimesheet.textContent = "View New Timesheet";
			break;
		case "View New Timesheet":
			calendar.style.display = "none";

			var report = getReport();
			userOperations.getCurrentUser().then(function(user){
				//TODO: Get the real report Date from the calendar...
				var earnedHolidays = [];
				var reportDateParts = "2016-02".split("-");
				if(observedHolidays[reportDateParts[0]] && observedHolidays[reportDateParts[0]][reportDateParts[1]]){
					earnedHolidays = observedHolidays[reportDateParts[0]][reportDateParts[1]];
				}
				userOperations.setPdfFields(user, moment("2016-02", "YYYY-MM"), {
					"Holiday Earned Dates": earnedHolidays,
					"Vacation Dates": report.vacation,
					"Sick Dates": report.sick,
					"Holiday Dates": report.holiday
				});
				renderTimesheet();
			});
			newTimesheet.textContent = "Save Timesheet";
			break;
		case "Save Timesheet":
			newTimesheet.textContent = "New Timesheet";
			userOperations.getCurrentUser().then(function(user){
				user.timesheets[getPdfFieldValue["Report Date"]] = {
					"Vacation Dates": getPdfFieldValue[""].split(', '),
					"Sick Dates": getPdfFieldValue[""].split(', '),
					"Holiday Dates": getPdfFieldValue[""].split(', '),
				}
			});
			break;
	}

});
document.getElementById("getreport").addEventListener("click", function(/*evt*/) {
	var report = getReport();
	var calendar = document.getElementById("calendar");

	if (report) {
		calendar.innerHTML = "<pre>" + JSON.stringify(report, null, 4) + "</pre>";
	}
});
