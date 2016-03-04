var Users = [{
    "name": "Employee Name",
    "Start Date": "08/2015",
    id: "38012345",
    "isFullTime": true,
    "timeSheets":[{
        "created": "timestamp",
        "Report Period": {
            "Month": 1,
            "Year": 2015
        },
        "Vacation Taken": 0,
        "Vacation Dates": "",
        "Sick Taken": 0,
        "Sick Dates": "",
        "Holidays Taken": 0,
        "Holidays Dates": "",
        "Holidays Earned": 0,
        "Holidays Earned Dates": "",
        /*
            Brought Forward: Previous reporting or 0 (allow for starting ammount)
            Vacation Earned: Calculated Based on When Hired
            SubTotal: Brought Forward + Earned
            Vacation Charges: Vacation Taken,
            Sick Charges: Sick Taken,
            Holiday Charges: Holidays Taken,
            Vacation Carried Forward: 44,
            Sick Carried Forward: 45,
            Holiday Carried Forward: 46
        */
    },
    {
        "created": "timestamp",
        "Report Period": {
            "Month": 2,
            "Year": 2016
        },
        "Vacation Taken": 0,
        "Vacation Dates": "",
        "Sick Taken": 0,
        "Sick Dates": "",
        "Holidays Taken": 0,
        "Holidays Dates": "",
        "Holidays Earned": 0,
        "Holidays Earned Dates": "",
        /*
            Brought Forward: Previous reporting or 0 (allow for starting ammount)
            Vacation Earned: Calculated Based on When Hired
            SubTotal: Brought Forward + Earned
            Vacation Charges: Vacation Taken,
            Sick Charges: Sick Taken,
            Holiday Charges: Holidays Taken,
            Vacation Carried Forward: 44,
            Sick Carried Forward: 45,
            Holiday Carried Forward: 46
        */
    }]
}];
