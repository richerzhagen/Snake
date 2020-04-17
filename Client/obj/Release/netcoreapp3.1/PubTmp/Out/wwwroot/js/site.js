// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your Javascript code.

"use strict";



var canvasSize = [1080, 700];
var numOfSnakes = 1;
var startSegments = 15;
var snakesWidth = 10;
//var numOfFruit = 10;
var gameSpeed = 15;
var snakes = [];
var fruits = [];
var snakeColor = [10, 255];
var fruitColor;
var fruitEaten = null;
var numFruitEaten = 0;
var rank = [];

var start = 0;

var snakesDict = {};

var connection = new signalR.HubConnectionBuilder().withUrl("/snakeHub").build();
var user = document.getElementById("userInput").value;

$('button').on('click', function (e) {
    
    var snake = snakesDict[user];
    delete snakesDict[user];
    delete snakesDict[""];
    user = $('#userInput').val();
    //console.log(user);
    snakesDict[user] = snake;
});

//Disable send button until connection is established
//document.getElementById("sendButton").disabled = true;

connection.start().catch(function (e) {

});


//var connection = new signalR.HubConnectionBuilder().withUrl("/snakeHub").build();


//connection.on("ReceiveMessage", function (user, message) {
//    console.log(message);
//});

//connection.start().then(function () {

//});

//document.getElementById("sendButton").addEventListener("click", function (event) {

//});

//socket stuff
//let socket = new WebSocket("ws://localhost:8080");
//let socket = new WebSocket("wss://csharpwebsocketserver.azurewebsites.net:80");
//let socket = new WebSocket("wss://csharpwebsocketserver.azurewebsites.net:443");
//socket.onopen = function (e) {
//    alert("[open] Connection established");
//    alert("Sending to server");
//}

//fruit constructor
function Fruit(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
}
//snake constructor
function Snake(id, x, y, direction, segments, status) {
    this.ID = id;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.segments = segments;
    this.color = color(random(snakeColor[0], snakeColor[1]), random(snakeColor[0], snakeColor[1]), random(snakeColor[0], snakeColor[1]));
    this.status = status;
}

function setup() {
    var canvas = createCanvas(canvasSize[0], canvasSize[1]);
    canvas.parent('sketch-holder');
    frameRate(gameSpeed);
    stroke(255);
    stroke(255);
    strokeWeight(10);

    //create snake
    //for (let i = 0; i < numOfSnakes; i++) {
    var x = [];
    var y = [];
    var startx = floor((canvasSize[0] / 10 / (numOfSnakes + 1)) * (0 + 1)) * 10;
    var starty = floor(canvasSize[1] / 10 - snakesWidth * startSegments) * 10;
    for (let j = 0; j < startSegments; j++) {
        x.push(startx);
        y.push(starty + j * snakesWidth);
    }

    snakesDict[user] = new Snake(0, x, y, "up", startSegments, "alive");
    //}

    ////create fruits
    //for (let i = 0; i < numOfFruit; i++) {
    //    fruits.push(new Fruit());
    //}
}

function draw() {
    background(0);
    if (start == 1) {
        updateSnakeCoordinates();
        for (var key in snakesDict) {
            stroke(color(random(snakeColor[0], snakeColor[1]), random(snakeColor[0], snakeColor[1]), random(snakeColor[0], snakeColor[1])));
            for (let j = 0; j < snakesDict[key].segments - 1; j++) {
                point(snakesDict[key].x[j], snakesDict[key].y[j]);
            }
        }
        fruitColor = color(random(snakeColor[0], snakeColor[1]), random(snakeColor[0], snakeColor[1]), random(snakeColor[0], snakeColor[1]));
        stroke(fruitColor);
        for (let i = 0; i < fruits.length; i++) {
            point(fruits[i].x, fruits[i].y);
        }
        checkGameStatus();
        checkForFruit();
        sendSnake({ snake: snakesDict[user], fruit: fruitEaten });
    }
}

function updateSnakeCoordinates() {
    for (var key in snakesDict) {
        for (let j = 0; j < snakesDict[key].segments - 1; j++) {
            snakesDict[key].x[j] = snakesDict[key].x[j + 1];
            snakesDict[key].y[j] = snakesDict[key].y[j + 1];
        }
        //move head
        switch (snakesDict[key].direction) {
            case 'right':
                snakesDict[key].x[snakesDict[key].segments - 1] = snakesDict[key].x[snakesDict[key].segments - 2] + snakesWidth;
                snakesDict[key].y[snakesDict[key].segments - 1] = snakesDict[key].y[snakesDict[key].segments - 2];
                break;
            case 'up':
                snakesDict[key].x[snakesDict[key].segments - 1] = snakesDict[key].x[snakesDict[key].segments - 2];
                snakesDict[key].y[snakesDict[key].segments - 1] = snakesDict[key].y[snakesDict[key].segments - 2] - snakesWidth;
                break;
            case 'left':
                snakesDict[key].x[snakesDict[key].segments - 1] = snakesDict[key].x[snakesDict[key].segments - 2] - snakesWidth;
                snakesDict[key].y[snakesDict[key].segments - 1] = snakesDict[key].y[snakesDict[key].segments - 2];
                break;
            case 'down':
                snakesDict[key].x[snakesDict[key].segments - 1] = snakesDict[key].x[snakesDict[key].segments - 2];
                snakesDict[key].y[snakesDict[key].segments - 1] = snakesDict[key].y[snakesDict[key].segments - 2] + snakesWidth;
                break;
        }

        if (snakesDict[key].x[snakesDict[key].segments - 1] > canvasSize[0]) {
            snakesDict[key].x[snakesDict[key].segments - 1] = 0;
        }
        if (snakesDict[key].x[snakesDict[key].segments - 1] < 0) {
            snakesDict[key].x[snakesDict[key].segments - 1] = canvasSize[0];
        }
        if (snakesDict[key].y[snakesDict[key].segments - 1] > canvasSize[1]) {
            snakesDict[key].y[snakesDict[key].segments - 1] = 0;
        }
        if (snakesDict[key].y[snakesDict[key].segments - 1] < 0) {
            snakesDict[key].y[snakesDict[key].segments - 1] = canvasSize[1];
        }
    }
}

function checkGameStatus() {
    //head crash
    var deadIndex = [];
    //for (var key in snakesDict) {
    //    for (var keyy in snakesDict) {
    //        if (keyy != key) {
    //            if (snakesDict[key].x[snakesDict[key].segments - 1] === snakesDict[keyy].x[snakesDict[keyy].segments - 1] && snakesDict[key].y[snakesDict[key].segments - 1] === snakesDict[keyy].y[snakesDict[keyy].segments - 1]) {
    //                deadIndex.push(i);
    //                deadIndex.push(j);
    //            }
    //        }
    //    }
    //}

    //for (let i = 0; i < snakes.length; i++) {
    //    for (let j = i + 1; j < snakes.length; j++) {
    //        if (snakes[i].x[snakes[i].segments - 1] === snakes[j].x[snakes[j].segments - 1] && snakes[i].y[snakes[i].segments - 1] === snakes[j].y[snakes[j].segments - 1]) {
    //            deadIndex.push(i);
    //            deadIndex.push(j);
    //        }
    //    }
    //}

    //snake body crash
    //loop1:
    var snakeHeadX = snakesDict[user].x[snakesDict[user].x.length - 1];
    var snakeHeadY = snakesDict[user].y[snakesDict[user].y.length - 1];
    for (var key in snakesDict) {
        var snake = snakesDict[key];
        for (let k = 0; k < snake.x.length - 1; k++) {
            if (snake.x[k] === snakeHeadX && snake.y[k] === snakeHeadY) {
                snakesDict[user].status = "dead";
                start = 0;
            }
        }
    }


    //for (let i = 0; i < snakes.length; i++) {
    //    //if (deadIndex.has(i)) {
    //    //    continue;
    //    //}
    //    const snakeHeadX = snakes[i].x[snakes[i].x.length - 1];
    //    const snakeHeadY = snakes[i].y[snakes[i].y.length - 1];
    //    for (let j = 0; j < snakes.length; j++) {
    //        snake = snakes[j];
    //        for (let k = 0; k < snake.x.length - 1; k++) {
    //            if (snake.x[k] === snakeHeadX && snake.y[k] === snakeHeadY) {
    //                deadIndex.push(i);
    //                continue loop1;
    //            }
    //        }
    //    }
    //}

    //ranks
    //var deadSnakes = [];
    //for (let i = 0; i < deadIndex.length; i++) {
    //    deadSnakes.push(snakes[deadIndex[i]]);
    //}
    //rank.push({ key: rank.length, value: deadSnakes });
    ////cleanup
    //for (let i = 0; i < deadIndex.length; i++) {
    //    delete snakes[deadIndex[i]];
    //}

    //snakes = snakes.filter(function (x) { return x !== undefined; });
    //if (snakes.length <= 1) {
    //    start = 0;
    //    gameSpeed == 15;
    //}
}

function checkForFruit() {
    //var user = document.getElementById("userInput").value;
    const snakeHeadX = snakesDict[user].x[snakesDict[user].x.length - 1];
    const snakeHeadY = snakesDict[user].y[snakesDict[user].y.length - 1];

    for (var i = 0; i < fruits.length; i++) {
        if (snakeHeadX == fruits[i].x && snakeHeadY == fruits[i].y) {
            fruitEaten = fruits[i].id;
            snakesDict[user].x.unshift(snakesDict[user].x[0]);
            snakesDict[user].y.unshift(snakesDict[user].y[0]);
            snakesDict[user].segments++;
            $("#score").text(snakesDict[user].segments)
        }
    }

    //for (var key in snakesDict) {
    //    snake = snakesDict[key];
    //    for (let k = 0; k < fruits.length; k++) {
    //        if (snake.x[snake.segments - 1] == fruits[k].x && snake.y[snake.segments - 1] == fruits[k].y) {
    //            snakesDict[key].x.unshift(snakesDict[key].x[0]);
    //            snakesDict[key].y.unshift(snakesDict[key].y[0]);
    //            snakesDict[key].segments++;
    //            snakesDict[key].color = fruitColor;
    //            fruitEaten(k);
    //        }
    //    }
    //}

    //for (let i = 0; i < snakes.length; i++) {
    //    snake = snakes[i];
    //    for (let k = 0; k < fruits.length; k++) {
    //        if (snake.x[snake.segments - 1] == fruits[k].x && snake.y[snake.segments - 1] == fruits[k].y) {
    //            snakes[i].x.unshift(snakes[i].x[0]);
    //            snakes[i].y.unshift(snakes[i].y[0]);
    //            snakes[i].segments++;
    //            snakes[i].color = fruitColor;
    //            fruitEaten(k);
    //        }
    //    }
    //}
}

function fruitEaten(fruitIndex) {
    numFruitEaten++;
    fruits[fruitIndex].relocate();
    if (numFruitEaten % 2 == 0) {
        gameSpeed++;
        frameRate(gameSpeed);
    }
}

function keyPressed() {
    var snake = snakesDict[user];
    switch (keyCode) {
        case 65:            // p1
            if (snake.direction !== 'right') {
                snake.direction = 'left';
            }
            break;
        case 68:
            if (snake.direction !== 'left') {
                snake.direction = 'right';
            }
            break;
        case 87:
            if (snake.direction !== 'down') {
                snake.direction = 'up';
            }
            break;
        case 83:
            if (snake.direction !== 'up') {
                snake.direction = 'down';
            }
            break;
        case 100:            // p2
            if (snake.direction !== 'right') {
                snake.direction = 'left';
            }
            break;
        case 102:
            if (snake.direction !== 'left') {
                snake.direction = 'right';
            }
            break;
        case 104:
            if (snake.direction !== 'down') {
                snake.direction = 'up';
            }
            break;
        case 101:
            if (snake.direction !== 'up') {
                snake.direction = 'down';
            }
            break;
        case 71:            // p3
            if (snake.direction !== 'right') {
                snake.direction = 'left';
            }
            break;
        case 74:
            if (snake.direction !== 'left') {
                snake.direction = 'right';
            }
            break;
        case 89:
            if (snake.direction !== 'down') {
                snake.direction = 'up';
            }
            break;
        case 72:
            if (snake.direction !== 'up') {
                snake.direction = 'down';
            }
            break;
        case 76:            // p4
            if (snake.direction !== 'right') {
                snake.direction = 'left';
            }
            break;
        case 222:
            if (snake.direction !== 'left') {
                snake.direction = 'right';
            }
            break;
        case 80:
            if (snake.direction !== 'down') {
                snake.direction = 'up';
            }
            break;
        case 186:
            if (snake.direction !== 'up') {
                snake.direction = 'down';
            }
            break;
        //case 49:            // game control
        //    if (fr > 5) {
        //        gameSpeed--;
        //        frameRate(gameSpeed);
        //    }
        //    break;
        //case 50:
        //    gameSpeed++;
        //    frameRate(gameSpeed);
        //    break;
        case 32:
            start = 1;
            var x = [];
            var y = [];
            var startx = floor((canvasSize[0] / 10 / (numOfSnakes + 1)) * (0 + 1)) * 10;
            var starty = floor(canvasSize[1] / 10 - snakesWidth * startSegments) * 10;
            for (let j = 0; j < startSegments; j++) {
                x.push(startx);
                y.push(starty + j * snakesWidth);
            }
            snakesDict[user] = new Snake(0, x, y, "up", startSegments, "alive");
            break;
    }
}

//function findSnake(snakeID) {
//    return snakes.find(snake => snake.ID == snakeID);
//}

function sendSnake(model) {

    //send snake to server
    //socket.send(JSON.stringify({
    //    Snake: {
    //        id: model.snake.ID,
    //        x: model.snake.x,
    //        y: model.snake.y,
    //        direction: model.snake.direction,
    //        segments: model.snake.segments,
    //        status: model.snake.status
    //    },
    //    Fruit: fruitEaten
    //}));

    //connection.on("ReceiveMessage", function (user, message) {

    //});
    connection.invoke("SendMessage", user, JSON.stringify({
        User: user,
        Snake: {
            id: model.snake.ID,
            x: model.snake.x,
            y: model.snake.y,
            direction: model.snake.direction,
            segments: model.snake.segments,
            status: model.snake.status
        },
        Fruit: fruitEaten
    }));

    if (model.snake.status == "dead") {
        delete snakesDict[user];
    }
    fruitEaten = null;
    //receive snakes from server
    // socket.onmessage = function (e) {
    
    connection.on("ReceiveMessage", function (u, e) {

        var data = JSON.parse(e);
        //console.log(user);
        //console.log(data);
        //for (var key in snakesDict) {
        //    if (key != 0) {
                
        //    }
        //}

        //for (var key in data.Snakes) {

        if (user != u) {
            //delete snakesDict[u];
            snakesDict[u] = new Snake(data.Snakes[u].id, data.Snakes[u].x, data.Snakes[u].y, data.Snakes[u].direction, data.Snakes[u].segments, data.Snakes[u].status);

        }
         //}

        score = "<tr><th>Player</th><th>Score</th></tr>";
        for (var key in snakesDict) {
            if (key == 0) {
                score += "<tr><td>You</td><td>" + snakesDict[key].segments + "</td></tr>"
            }
            else {
                score += "<tr><td>" + key + "</td><td>" + snakesDict[key].segments + "</td></tr>"

            }
        }
        //create fruits
        fruits = [];
        for (var key in data.Fruits) {
            fruits.push(new Fruit(data.Fruits[key].id, data.Fruits[key].x, data.Fruits[key].y));
        }

        $("#score")[0].innerHTML = score;
    });

    //$.ajax({
    //    url: "/Game/SendSnake",
    //    data: {
    //        Snake: {
    //            id: snake.id,
    //            x: snake.x,
    //            y: snake.y,
    //            direction: snake.direction,
    //            segments: snake.segments
    //        }
    //    },
    //    success: function (result) {
    //        console.log(result);
    //    }
    //})



}