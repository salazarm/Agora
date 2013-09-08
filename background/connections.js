
 var MY_ID_GLOBAL;
var scrapeInfo = function(response) {
		console.log("Scrape Info called");
		var MY_ID = response.id;
		MY_ID_GLOBAL = MY_ID;
		var MY_NAME = response.name;

		var FBUser = Parse.Object.extend("FBUser");
		var user_obj = new FBUser();
		user_obj.set("id_of_user", MY_ID_GLOBAL);
		user_obj.set("name", MY_NAME);
		user_obj.save(null, {
					success: function(user){
						alert('New Object Created with objectId: ' + user.id);
					},
					error: function(user, error){
						alert('Failed to create new object with error code: ' + error.description);
						console.log("USER 1 ERROR : ", error);
					}
		});			

		for(var i=0; i<response.friends.data.length; i++) { 
			if (response.friends && response.friends.data[i] && response.friends.data[i].id){
				var friend=response.friends.data[i].id

				//var friend="100000351540326";


				//quick out if the friend isn't part of the service (ignoring the fact for now that 
				//the friend of friend could still be a part)
				var FBUser = Parse.Object.extend("FBUser");
				var query = new Parse.Query(FBUser);
				query.equalTo("id_of_user", friend);
				console.log('Friend asdfasdfasdf!, ' + friend + '.');
				(function(friend) {
					query.find({
						success:function(result) {
							console.log('Friend !, ' + friend + '.');
							if(result.length != 0){

								console.log(friend);
								console.log(MY_ID_GLOBAL);
								//initialize all of the 1st order connections to 10k
								var Relation = Parse.Object.extend("Relation");
								var relation_obj = new Relation();
								relation_obj.set("id_1", MY_ID_GLOBAL);
								relation_obj.set("id_2", friend);
								relation_obj.set("coef", 10000);
								relation_obj.save(null, {
									success: function(relation_obj){
										alert('New Object Created with objectId: ' + relation_obj.id);
									},
									error: function(gameScore, error){
										alert('Failed to create new object with error code: ' + error.description);
										console.log("RELATION 1 ERROR : ", error);
									}
								});			
							}
						},
						error:function(error){
							console.log('ccccccccccccccccccc' + friend + '.');
						}
					});
				})(friend);	




				//threads for first degree
				var url = encodeURIComponent('SELECT thread_id,message_count FROM thread WHERE viewer_id = me() AND folder_id = 0 ORDER BY message_count DESC LIMIT 5');
				executeAPIRequest("/fql?q="+ url, loopMessages);

				//loop friends of friends that we can access
				executeAPIRequest('/'+friend+'?fields=friends', function(){ 	
					friendsOfFriends.apply(null, [arguments[0], friend])
				});


			} 			
 		}
	}




	function executeAPIRequest(URL, func){
		 $.ajax({
    url: "https://graph.facebook.com" + URL + "&"+sessionStorage.accessToken,
    success: function(result) {
    	func(result);
    }
  });
	}

  
  
  function loopMessages(threads) {
		console.log("Response1" , threads);
		for(var j=0; j<threads.data.length; j++) {
			console.log('thread!!!, ' + threads.data[j].thread_id + " " + threads.data[j].message_count);
			var message_count = threads.data[j].message_count;
			var thread_id = threads.data[j].thread_id;

			(function(message_count) {
				executeAPIRequest("/"+thread_id, function(thread) {	
					console.log("Response" , thread);

					var users_in_convo = thread.to.data.length;
					for(var k=0; k<users_in_convo; k++) {

						//add message number to the value for the friend
						var person2 = thread.to.data[k].id;
						var Relation = Parse.Object.extend("Relation");
						var query = new Parse.Query(Relation);
						query.equalTo("id_1", MY_ID_GLOBAL);
						query.equalTo("id_2", person2);
						(function(message_count, person2, users_in_convo) {
							query.find({
								success:function(results) {
										if(results.length == 0){
											var relation_obj = new Relation();
											relation_obj.set("id_1", MY_ID_GLOBAL);
											relation_obj.set("id_2", person2);
											relation_obj.set("coef", 10000);
											relation_obj.save(null, {
												success: function(relation_obj){
													alert('New Object Created with objectId: ' + relation_obj.id);
												},
												error: function(gameScore, error){
													alert('Failed to create new object with error code: ' + error.description);
												}
											});
										}else{
											var to_update = results[0];
											var coef = to_update.get("coef");
											console.log("Messsssssssssssssssages "+person2  , message_count);
											to_update.set("coef", coef+message_count/users_in_convo);
											to_update.save();
										}
								},
								error:function(error){

								}
							});
						})(message_count, person2, users_in_convo);	
						console.log("add to this "+thread.to.data[k].id+' '+message_count+'.');
					}

				});
			})(message_count);				
		}	
	}  	
  
  
  
	function friendsOfFriends(response2, friend) { 
  	console.log('friendsOfFriends, response2', arguments);   			
		if(response2.friends){
			for(var j=0; j<20; j++) { //response2.friends.data.length
				console.log('Friend of friend!!!, ' + response2.friends.data[j].name + '.');
				var friend2id = response2.friends.data[j].id;

				//short out quickly if they don't have an account


				//initialize all of the 2nd order connections to 1k only if not initialized already		
				var Relation = Parse.Object.extend("Relation");
				var check_query = new Parse.Query(Relation);
				check_query.equalTo("id_1", MY_ID_GLOBAL);
				check_query.equalTo("id_2", friend2id);

  			(function(friend2id){
					check_query.find({
						success: function(results){
							console.log(results.length);
							if(results.length == 0){
								var relation_obj = new Relation();
								relation_obj.set("id_1", MY_ID_GLOBAL);
								relation_obj.set("id_2", friend2id);
								relation_obj.set("intermediate_friend", friend);
								relation_obj.set("coef", 1000);
								relation_obj.save(null, {
									success: function(relation_obj){
										alert('New Object Created with objectId: ' + relation_obj.id);
									},
									error: function(gameScore, error){
										alert('Failed to create new object with error code: ' + error.description);
									}
									});				
							}
						},
						error:function(error){
							console.log("ERROR : " + error.message);
						}
					});
				})(friend2id);



				//get value of 1st order friend, multiply by .1 and add to value of 2nd order friend
				var query2 = new Parse.Query(Relation);
				query2.equalTo("id_1", MY_ID_GLOBAL);
				query2.equalTo("id_2", friend);

				(function(friend2id){
					query2.find({
						success:function(results){
							var order1 = results[0].get("coef")*.1;
							var query3 = new Parse.Query(Relation);
							query3.equalTo("id_1", MY_ID_GLOBAL);
							query3.equalTo("id_2", friend2id);
							(function(order1){
								query3.find({
									success:function(results){
										var final = order1+results[0].get("coef");
										results[0].set("coef", final);
										results[0].save();
									},
									error:function(error){

									}
								});
							})(order1);
						},
						error:function(error){

						}
					});
				})(friend2id);
 					
 							  	
			}
		}

	}	
function get_coefficient(id_1, id_2, callback){
		var Relation = Parse.Object.extend("Relation");
		var user_query = new Parse.Query(Relation)
		user_query.equalTo("id_1", id_1);
		user_query.equalTo("id_2", id_2);
		user_query.find({
			success:function(results){
				var coef = results[0].get("coef");
				if(coef < 1000){
					callback(coef/20);
				}else{
					callback(coef/40+25);
				}
			},
			error:function(error){
				console.log("Error getting coefficient");
			}
		});
	}		

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

	function get_coefficient(id_1, id_2, callback){
		var Relation = Parse.Object.extend("Relation");
		var user_query = new Parse.Query(Relation)
		user_query.equalTo("id_1", id_1);
		user_query.equalTo("id_2", id_2);
		user_query.find({
			success:function(results){
				var coef = results[0].get("coef");
				if(coef < 1000){
					callback(coef/20);
				}else{
					callback(coef/40+25);
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