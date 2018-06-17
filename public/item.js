//the food list
var food_pickup = [];

// search through food list to find the food object
function finditembyid (id) {
	
	for (var i = 0; i < food_pickup.length; i++) {

		if (food_pickup[i].id == id) {
			return food_pickup[i]; 
		}
	}
	
	return false; 
}

