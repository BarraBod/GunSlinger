
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var players = [];
var counter = 0;

server.listen(8080, function(){
	console.log("Server is now running...");
});

io.on('connection', function(socket){
	console.log("Player Connected!");
	players.push(new player(0, 0));
	socket.emit('socketID', { id: socket.id });
	socket.emit('getPlayers', players);

	if(players[0].id == 0){
	players[0].id = socket.id;
	}
	else if(players[1].id == 0){
		players[1].id = socket.id;
	}
	else{
		console.log("error adding socket id")
	}

	if(players.length == 2){
		randomNumberFunction();
	}

 function randomNumberFunction(){
 	    var random = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
		return random;
 }


	socket.broadcast.emit('newPlayer', { id: socket.id });
	socket.on('disconnect', function(){
		console.log("Player Disconnected");
		socket.broadcast.emit('playerDisconnected', { id: socket.id });

		for(var i = 0; i <= players.length; i++){
				players.splice(i, 1);
		}

	});

	socket.on("getRandomNumber", function(){
		
			if(socket.id == players[0].id){
			var random = randomNumberFunction();
			socket.emit("randomNumber", {rand: random});
		    socket.broadcast.emit("randomNumber", {rand: random});
		}
	});



	socket.on("playerTime", function(data){
		counter++;
	
		if(socket.id == players[0].id){
					players[0].playerScore = data.playerTimes;
					socket.broadcast.emit("playerTime", {playerTimes: data.playerTimes});
		}else if(socket.id == players[1].id){
				players[1].playerScore = data.playerTimes;
					socket.broadcast.emit("playerTime", {playerTimes: data.playerTimes});
		}else{
			console.log("Error adding score");
		}

	

			if(counter >= 2){


	            if(players[0].playerScore > players[1].playerScore && players[0].id == socket.id){
	           	 loser();
				 counter = 0;
				 }
	              else if(players[0].playerScore < players[1].playerScore && players[0].id == socket.id){
	              winner();
	              counter = 0;
	               }
	              else if(players[1].playerScore > players[0].playerScore && players[1].id == socket.id){
	              loser();
	              counter = 0;
	               }
	              else if(players[1].playerScore < players[0].playerScore && players[1].id == socket.id){
	              winner();
	              counter = 0;
	              }
	              else{
	              console.log("Error emitting score");
	                }

				}

			function winner(){
			  socket.broadcast.emit("playerScore", {playerScore: "loser"});
			  socket.emit("playerScore", {playerScore: "winner"});
			}

			function loser(){
			 socket.broadcast.emit("playerScore", {playerScore: "winner"});
			 socket.emit("playerScore", {playerScore: "loser"});
			}

	});


});

function player(id, playerScore){
	this.id = id;
	this.playerScore = playerScore;
};



