class UserTimesheet{
	database;
	constructor(){
		this.database = fetch("/js/database.json").then(function(response) {
			return response.json();
		});
	}
}
