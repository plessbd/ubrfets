/*
 * replacePdfConents
 * replaces a list of templates in a PDF
 *
 * @ binary ArrayBuffer of PDF
 */

function replacePdfContents(binary /* ArrayBuffer */, replacements){
	var uint8 = new Uint8Array(binary);
	var pdfString = String.fromCharCode.apply(null, uint8);
	var find, replace;
	var replaces = {};
	var defaults = {
		"EmployeeName": "",
		"ReportPeriod": "",
		"PersonNumber": "",
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
	Object.assign(replaces, defaults, replacements);
	replaces.ReportPeriod = moment(replaces.ReportPeriod, "YYYY-MM").format("MMMM YYYY");
	var objectKeys = Object.keys(replaces);
	for (var k = 0; k < objectKeys.length; k++) {
		find = objectKeys[k];
		replace = replaces[find];
		var search = new RegExp("%" + find + "%", "g");
		var i = 0;
		var match;
		while ((match = search.exec(pdfString))) {
			i = 0;
			for(; i < find.length + 2; i++){
				uint8[match.index + i] = replace.charCodeAt(i) || " ".charCodeAt(0);
			}
		}
	}
	var blob = new Blob([binary], {
		type: "application/pdf"
	});

	saveAs(blob, "timesheet-" + replacements.ReportPeriod + ".pdf");
}
