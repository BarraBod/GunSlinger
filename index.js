var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
//var mongo = require('mongodb');
//var mongoose = require("mongoose");

var players = [];
var counter = 0;
var playerReadyCounter = 0;


server.listen(8080, function(){
	console.log("Server is now running...");
});

//mongoose.connect("mongodb://localhose/mongo");

io.on('connection', function(socket){
	console.log("Player Connected!");
	players.push(new player(0, 0, 0));
	
	socket.emit('socketID', { id: socket.id });
	socket.emit('getPlayers', players);

	if(players[0].id == 0){
	players[0].id = socket.id;
	socket.emit("playerID", {playerID: 0});
	}
	else if(players[1].id == 0){
		players[1].id = socket.id;
		socket.emit("playerID", {playerID: 1});
	}
	else{
		console.log("error adding socket id")
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

				var winner = players[0].playerScore < players[1].playerScore? 0: 1; // assume that playerScore will never be the same
 				 players[winner].score++;
 				 if(players[winner].score == 3){
 				 	console.log("player" + players[winner].id + " has won");
 				 }else{
 				 console.log(`Player ${winner} won!`);
 				 socket.broadcast.emit("playerScore", {playerScore: winner});
 				 socket.emit("playerScore", {playerScore: winner});
 				 counter = 0;}
 				}

			
	});

	socket.on("playerReady", function(){
		socket.broadcast.emit("oponentReady");
		console.log(socket.id + " is ready");
		playerReadyCounter++;
		if(playerReadyCounter >= 2){
			randomNumberFunction();
			playerReadyCounter = 0;
		}

	});

function randomNumberFunction(){
 	    var random = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
 	    console.log("number " + random + " generated");
		return random;
 }
 
});

function player(id, playerScore, score){
	this.id = id;
	this.playerScore = playerScore;
	this.score = score;
};




