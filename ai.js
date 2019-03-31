function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }
    return result;
}

var fileText = loadFile("tests.csv");
var fileLines = fileText.split("\n");
for (var i = 0; i < fileLines.length; i++) {
    fileLines[i] = fileLines[i].split(",");
    fileLines[i] = fileLines[i].map(c => parseInt(c));
}

var questionNumber = -1;
var question;
var answer;

function getNewQuestion() {
    questionNumber = (questionNumber + 1) % 6144;
    question = fileLines[questionNumber].slice(1);
    answer = fileLines[questionNumber][0];
}

function largestIndex(array) {
    var currentLargest = array[0];
    var currentIndex = 0;
    for (var i = 1; i < array.length; i++) {
        if (array[i] > currentLargest) {
            currentLargest = array[i];
            currentIndex = i;
        }
    }
    return currentIndex;
}

function removeElementFromArray(array, index) {
    var newArray = [];    
    for (var i = 0; i < array.length; i++) {
        if (i != index) newArray.push(array[i]);
    }
    return newArray;
}

function mutate(inputNetwork, mutationRate = 0.1) {
    network = inputNetwork.clone();
    for (var layer = 1; layer < network.widths.length; layer++) {
        for (var width = 0; width < network.widths[layer]; width++) {
            for (var connection = 0; connection < network.widths[layer - 1]; connection++) {
                if (Math.random() < mutationRate) network.layers[layer][width].mutateStrength(connection);
            }
            if (Math.random() < mutationRate) network.layers[layer][width].bias += Math.random() - 0.5;
        }
    }
    return network;
}

function newNetwork() {
    var network = new Network([100, 5, 5, 1]);
    network.createHiddenLayers();
    network = mutate(network, 0.5);
    return network;
}

var generation = [];
for (var i = 0; i < 200; i++) {
    generation[i] = newNetwork();
}

while (true) {
    var fitness = sizedArray(generation.length);
    for (var t = 0; t < 6144; t++) {
        getNewQuestion();
        for (var i = 0; i < 200; i++) {
            generation[i].createInputLayer(question);
            generation[i].runNetwork();
            if (Math.round(generation[i].outputs[0]) == answer) fitness[i]++;
        }
    }
    var highestFitness = fitness[largestIndex(fitness)];
    console.log([generation[largestIndex(fitness)], 6144 - highestFitness]);
    var best = [];
    for (var i = 0; i < 5; i++) {
        best.push(generation[largestIndex(fitness)].clone());
        fitness = removeElementFromArray(fitness, largestIndex(fitness));
    }
    var generation = best.slice();
    for (var i = 5; i < 200; i++) {
        generation.push(mutate(generation[i % 5], -highestFitness / 3072 + 2));
    }
}

