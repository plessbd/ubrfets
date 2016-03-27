var nameToId = {
    "Employee Name": 1,
    "Report Period": 2,
    "Person Number": 3,
    "Full Time": 4,
    "Part Time": 5,
    "Monday From": 6,
    "Monday To": 7,
    "Tuesday From": 8,
    "Tuesday To": 9,
    "Wednesday From": 10,
    "Wednesday To": 11,
    "Thursday From": 12,
    "Thursday To": 13,
    "Friday From": 14,
    "Friday To": 15,
    "FT Vacation Taken": 16,
    "FT Vacation Dates": 17,
    "FT Sick Taken": 20,
    "FT Sick Dates": 21,
    "FT Holidays Taken": 24,
    "FT Holidays Dates": 25,
    "FT Holidays Earned": 28,
    "FT Holidays Earned Dates": 29,
    "PT Vacation Taken": 18,
    "PT Vacation Dates": 19,
    "PT Sick Taken": 22,
    "PT Sick Dates": 23,
    "PT Holidays Taken": 26,
    "PT Holidays Dates": 27,
    "PT Holidays Earned": 30,
    "PT Holidays Earned Dates": 31,
    "Vacation Brought Forward": 32,
    "Sick Brought Forward": 33,
    "Holiday Brought Forward": 34,
    "Vacation Earned": 35,
    "Sick Earned": 36,
    "Holiday Earned": 37,
    "Vacation Sub-Total": 38,
    "Sick Sub-Total": 39,
    "Holiday Sub-Total": 40,
    "Vacation Charges": 41,
    "Sick Charges": 42,
    "Holiday Charges": 43,
    "Vacation Carried Forward": 44,
    "Sick Carried Forward": 45,
    "Holiday Carried Forward": 46
};

var setPdfField = function setPdfField(field, value){
	formFields[nameToId[field]] = value;
};

var getPdfFieldValue = function(field){
	return formFields[nameToId[field]];
};
