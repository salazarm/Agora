
	function group_search(text){
		var GroupRelation = Parse.Object.extend("GroupRelation");
		var group_query = new Parse.Query(GroupRelation);

		group_query.equalTo("user_id", MY_ID_GLOBAL);
		group_query.contains("name", text);
		group_query.find({
			success:function(results){
				console.log(results);

			},
			error:function(error){

			}
		});

	}

	function search_overall(text){
		group_search(text);
		name_search(text);
		search_listing(text);
	}


	function calculate_trust(){

	}

	function get_coefficient(id_1, id_2){
		var Relation = Parse.Object.extend("Relation");
		var user_query = new Parse.Query(Relation)
		user_query.equalTo("id_1", id_1);
		user_query.equalTo("id_2", id_2);
		user_query.find({
			success:function(results){
				var coef = results[0].get("coef");
				if(coef < 1000){
					return coef/20;
				}else{
					return coef/40+25;
				}
			},
			error:function(error){
				console.log("Error getting coefficient");
			}
		});
	}
	

	function name_search(text){
		var FBUser = Parse.Object.extend("FBUser");
		var user_query = new Parse.Query(FBUser)
		user_query.contains("name", text);

		user_query.find({
			success:function(results){
				console.log(results);
			},
			error:function(error){
			}
		});
	}

	function search_listing(text, callback){
		var split_arr = text.split(' ');
		for(var i = 0; i < split_arr.length; i++){
			var word = split_arr[i];
			var Listing = Parse.Object.extend("Listing");
			var query = new Parse.Query(Listing)
			query.contains("title", word);
			query.find({
				success:function(results) {
					callback(results);
				},
				error:function(error){
								
				}
			});

		}

	}

	function getCommunities(){

		executeAPIRequest("/me?fields=groups", function(response){ 	
					
				var data_array  = response.groups.data;
				for(var i = 0; i < data_array.length; i++){
					var name = data_array[i].name;
					console.log(name);

					var GroupRelation = Parse.Object.extend("GroupRelation");
					var group_obj =  new GroupRelation();
					group_obj.set("user_id", MY_ID_GLOBAL);
					group_obj.set("name", name);
					group_obj.save(null, {
						success: function(relation_obj){
							//alert('New Object Created with objectId: ' + relation_obj.id);
						},
						error: function(gameScore, error){
							alert('Failed to create new object with error code: ' + error.description);
						}
					});

				}



				});

	}