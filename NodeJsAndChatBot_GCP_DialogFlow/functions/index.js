'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const { Suggestions, BasicCard, Button, Image, Table, Permission, LinkOutSuggestion, List, Carousel } = require('actions-on-google');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const Suggestions_Welcome = ["Book Train Ticket", "Rent a car"];
const Suggestions_Locations = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad"];
const Suggestions_CarNames = ["Ford Mondeo", "Honda CRV"];//, "Tata Altroz", "Ciaz", "Tata Nexon"];
const Suggestions_TravelDates = ["Today", "Tomorrow", "3 days after today", "Enter date"];
const Suggestions_CarRentDates = ["Today", "Tomorrow"];
const Suggestions_NoTrainsAvailable = ["Change date", "Change dest (Go to 1)", "Start over (Go to 0)"];
const Suggestions_TrainClasses = ["EC", "1AC", "2AC", "3AC", "Change dest (Go to 1)", "Start over (Go to 0)"];
const Suggestions_PaymentCompleted = ["Payment Completed"];
const validSeatNumber = [1, 2, 3, 4, 5, 6];
const validSeatRow = ['a', 'b', 'c'];
var startTime = "";
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    // console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log("--------------------------------------onRequest--------------------------------------");
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
    console.log("agent.query", agent.query);
    // console.log("agent.contexts", agent.contexts.filter(x => String(x.name).includes('actions_') == false));
    console.log("agent.parameters", agent.parameters);
    console.log("agent.session", agent.session);

    function welcome(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance
        const defaultWelcomeMessage = `Hi, I am your travel planner. You can ask me to book your train ticket(s) and car rental.`;
        conv.ask(defaultWelcomeMessage);
        conv.ask(new Suggestions(Suggestions_Welcome));
        agent.add(conv);
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }
    function isEmpty(val) {
        return val == undefined || val == "" || val == null;
    }
    function guid() {
        function _p8(s) {
            var p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        }
        return _p8() + _p8(true) + _p8(true) + _p8();
    }
    function startTimer() {
        startTime = new Date();
        console.log("startTime", startTime);
    }
    function getTimeLapsedInSeconds(startTime) {
        var currentTime = new Date();
        startTime = new Date(startTime);
        var seconds = (currentTime.getTime() - startTime.getTime()) / 1000;
        // console.log(`Time taken by user to respond`, currentTime, seconds);
        return seconds;
    }
    function bookTrain(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance
        var parameters = agent.parameters;
        var context = agent.context.contexts;
        var queryText = request.body.queryResult.queryText;
        var origin = parameters.Origin;
        var destination = parameters.Destination;
        var sessionVarsContext = context['sessionvars'];
        // var detectedCurrentLocation = sessionVarsContext.parameters.DetectedCurrentLocation;
        var detectedCurrentLocation = getAlreadyDetectedLocation();
        //https://medium.com/voice-tech-podcast/get-current-location-of-a-user-using-helper-intents-in-actions-on-google-19fe9a8ea99f
        if (String(queryText).toLowerCase() == "detect client location") {
            conv.data.requestedPermission = 'DEVICE_PRECISE_LOCATION';
            conv.ask(new Permission({
                context: 'to detect your city location',
                permissions: conv.data.requestedPermission,
            }));
        } else if (queryText == "actions_intent_PERMISSION") {
            var permissionGranted = context["actions_intent_permission"].parameters.PERMISSION == true;
            if (permissionGranted) {
                var _data = context["_actions_on_google"].parameters.data;
                var requestedPermission = isEmpty(_data) == false ? JSON.parse(_data).requestedPermission : "";
                if (requestedPermission === 'DEVICE_PRECISE_LOCATION') {
                    const { coordinates, city } = conv.device.location;
                    // Suggestions_Locations = [city, ...Suggestions_Locations];
                    detectedCurrentLocation = city;
                    // agent.context.set({
                    //     name: 'sessionvars', lifespan: sessionVarsContext.lifespan, parameters: { ...sessionVarsContext.parameters, DetectedCurrentLocation: detectedCurrentLocation }
                    // });
                    conv.add(`You are at ${city} city.`);
                    conv.add(`Please confirm origin of train.`);
                    var loc_origin = [detectedCurrentLocation, ...Suggestions_Locations].filter(loc => loc != destination);
                    conv.ask(new Suggestions(loc_origin));
                }
            } else {
                conv.add('Sorry, permission denied.');
                conv.add(`What is the origin of train?`);
                var loc_origin = isEmpty(detectedCurrentLocation) ? ["Detect client location", ...Suggestions_Locations].filter(loc => loc != destination) : [detectedCurrentLocation, ...Suggestions_Locations].filter(loc => loc != destination);
                conv.ask(new Suggestions([...loc_origin]));
            }
        } else if (isEmpty(origin)) {
            conv.add(`What is the origin of train?`);
            var loc_origin = isEmpty(detectedCurrentLocation) ? ["Detect client location", ...Suggestions_Locations].filter(loc => loc != destination) : [detectedCurrentLocation, ...Suggestions_Locations].filter(loc => loc != destination);
            conv.ask(new Suggestions([...loc_origin]));
        } else if (isEmpty(destination)) {
            askDestination(conv, origin, destination);

        } else {
            askTravelDate(conv);
        }
        agent.add(conv); // Add Actions on Google library responses to your agent's response
    }
    function getAlreadyDetectedLocation() {
        var detectedCurrentLocation = "";
        try {
            detectedCurrentLocation = request.body.originalDetectIntentRequest.payload.device.location.city;
        } catch (error) {
            detectedCurrentLocation = ""
        }
        return detectedCurrentLocation;
    }
    function askDestination(conv, origin, destination) {
        // var sessionVarsContext = conv.contexts.input['sessionvars'];
        // var detectedCurrentLocation = sessionVarsContext.parameters.DetectedCurrentLocation;
        var detectedCurrentLocation = getAlreadyDetectedLocation();
        conv.add(`What's the destination of train?`);
        var loc_destination = isEmpty(detectedCurrentLocation) ? Suggestions_Locations.filter(loc => loc != origin && loc != destination) : [detectedCurrentLocation, ...Suggestions_Locations].filter(loc => loc != origin && loc != destination);
        conv.ask(new Suggestions(loc_destination));
    }
    function askTravelDate(conv) {
        conv.add(`For when do you want to book the train ticket/s?`);
        conv.ask(new Suggestions(Suggestions_TravelDates));
    }
    function bookTrainChangeDestination(agent) {//handle change destination go to 1
        let conv = agent.conv(); // Get Actions on Google library conv instance
        var parameters = agent.parameters;
        var context = agent.context.contexts;
        var origin = context["sessionvars"].parameters.Origin;
        var oldDestination = context["sessionvars"].parameters.Destination;
        askDestination(conv, origin, oldDestination);
        agent.add(conv); // Add Actions on Google library responses to your agent's response
    }
    function bookTrainDestination(agent) {//when user alters destination
        let conv = agent.conv(); // Get Actions on Google library conv instance
        var parameters = agent.parameters;
        var context = agent.context.contexts;
        askTravelDate(conv);
        agent.add(conv); // Add Actions on Google library responses to your agent's response
    }
    function bookTrainTravelDate(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance
        var parameters = agent.parameters;
        var context = agent.context.contexts;
        var parameters = agent.parameters;
        var isTrainAvailable = checkIfTrainAvailable(parameters.TravelDate);
        if (isTrainAvailable) {
            conv.add(`Which class do you want to travel?`);
            conv.ask(new Suggestions(Suggestions_TrainClasses));
        } else {
            conv.add(`No trains are available for tomorrow.`);
            conv.ask(new Suggestions(Suggestions_NoTrainsAvailable));
        }
        agent.add(conv);
    }
    function checkIfTrainAvailable(_travelDate) {
        var hasTrain = true;
        var todaysDate = new Date();
        var temp = new Date();
        var _tomorrowDate = new Date(temp.setDate(temp.getDate() + 1));

        // var travelDate = isEmpty(_travelDate) ? "" : new Date(_travelDate.split('T')[0]);
        // tomorrowDate = new Date(tomorrowDate.toISOString().split('T')[0]);
        // console.log(travelDate, tomorrowDate);
        // if (travelDate.getTime() == tomorrowDate.getTime()) {//if travel date is tomorrow            
        //     hasTrain = false;
        // }
        var travelDate = isEmpty(_travelDate) ? "" : (new Date(_travelDate)).toLocaleDateString();
        var tomorrowDate = _tomorrowDate.toLocaleDateString();
        console.log(travelDate, temp, _tomorrowDate, tomorrowDate);
        if (tomorrowDate == travelDate) {
            hasTrain = false;
        }
        return hasTrain;
    }
    function bookTrainChangeTravelDate(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance
        var parameters = agent.parameters;
        var context = agent.context.contexts;
        askTravelDate(conv)
        agent.add(conv); // Add Actions on Google library responses to your agent's response
    }
    function bookTrainSelectSeatYes(params) {
        let conv = agent.conv(); // Get Actions on Google library conv instance
        var parameters = agent.parameters;
        var context = agent.context.contexts;
        var origin = context["sessionvars"].parameters.Origin;
        var destination = context["sessionvars"].parameters.Destination;
        var travelClass = context["sessionvars"].parameters.TravelClass;
        var msg = `Awesome, please select your seat for train from ${origin} to ${destination} for ${travelClass} class?`;
        askSeatSelection(conv, msg);
        agent.add(conv);
    }
    function askSeatSelection(conv, msg) {
        conv.ask(msg);
        conv.ask(new Table({
            title: '',
            subtitle: msg,
            columns: [],
            rows: [
                { cells: ['A |', '1', '2', '3', '4', '5', '6'] },
                { cells: ['B |', '1', '2', '3', '4', '5', '6'] },
                { cells: ['C |', '1', '2', '3', '4', '5', '6'] },
            ]
        }));
    }
    function bookTrainProvideSeatNumber(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance
        var parameters = agent.parameters;
        var context = agent.context.contexts;
        var seatNumber = parameters.SeatNumber;
        var seatRow = parameters.SeatRow;
        var isValidSeat = validSeatNumber.filter(num => num == seatNumber).length && validSeatRow.filter(row => row == String(seatRow).toLowerCase()).length;
        if (isValidSeat) {
            askForPayment(conv);
        } else {
            var origin = context["sessionvars"].parameters.Origin;
            var destination = context["sessionvars"].parameters.Destination;
            var travelClass = context["sessionvars"].parameters.TravelClass;
            var msg = `You've provided wrong seat, please select your seat for train from ${origin} to ${destination} for ${travelClass} class from available options below.`;
            askSeatSelection(conv, msg);
        }
        agent.add(conv);
    }
    function askForPayment(conv) {
        conv.add(`Please complete payment by clicking here:`);
        conv.ask(new BasicCard({
            text: `Please complete payment by clicking here:`
        }));
        conv.ask(new LinkOutSuggestion({
            name: 'Please complete payment by clicking here:',
            url: 'https://assistant.google.com/',
        }));
        conv.ask(new Suggestions(Suggestions_PaymentCompleted));
    }
    function bookTrainSelectSeatNo(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance
        var parameters = agent.parameters;
        var context = agent.context.contexts;
        askForPayment(conv);
        agent.add(conv);
    }
    function travelPlannerThankYou(agent) {
        var context = agent.context.contexts;
        var sessionVarsContext = context['sessionvars'];
        let conv = agent.conv(); // Get Actions on Google library conv instance
        var _guid = guid();
        conv.add(`Thank you for your payment!! You tickets have been booked and your booking id is ${_guid}. Do you want to rent a car also?`);
        // startTimer();
        agent.context.set({ name: 'sessionvars', lifespan: sessionVarsContext.lifespan, parameters: { ...sessionVarsContext.parameters, TimerStartTimeAfterTrainBooking: new Date() } });
        agent.add(conv);
    }
    function travelPlannerThankYouEnd(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance
        conv.ask(`Have a great journey`);
        conv.ask(new BasicCard({ text: `Have a great  \n journey 😀` }));
        agent.add(conv);
    }
    function rentCarAfterTrainBooking(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance
        var context = agent.context.contexts["sessionvars"];
        var secondLapsed = getTimeLapsedInSeconds(context.parameters.TimerStartTimeAfterTrainBooking);
        console.log(`User took ${secondLapsed} seconds to respond`);
        if (secondLapsed > 20) {//ask for location 
            askRentCarLocation(conv);
            agent.context.set({ name: 'await_rentcarlocation', lifespan: 1, parameters: {} });
        } else {//ask if user wants to continue with train booking details as he responds withing timeperiod
            var travelDate = context.parameters.TravelDate;
            var destination = context.parameters.Destination;
            var msg = `Do you want to rent car at ${destination} for ${(new Date(travelDate)).toDateString()}?`;
            agent.context.set({ name: 'await_rentcardetailsconfirmation', lifespan: 1, parameters: {} });
            conv.add(msg);
        }
        agent.add(conv);
    }
    function askRentCarLocation(conv) {
        conv.add(`Please provide location for your car rental.`);
        conv.ask(new Suggestions(Suggestions_Locations));
    }
    function rentCarAfterTrainBooking_continueWithTrainBookingDetailsYes(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance        
        askCarName(conv, "");
        agent.add(conv);
    }
    function askCarName(conv, _msg) {
        var msg = isEmpty(_msg) == false ? _msg : `Please select from below available cars.`;
        conv.add(msg);
        conv.ask(new Suggestions(Suggestions_CarNames));
    }
    function rentCarAfterTrainBooking_continueWithTrainBookingDetails(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance        
        var parameters = agent.parameters;
        var context = agent.context.contexts["sessionvars"];
        var travelDate = context.parameters.TravelDate;
        var destination = context.parameters.Destination;
        var carName = parameters.CarName;
        var isValidCar = Suggestions_CarNames.filter(car => String(car).toLocaleLowerCase() == String(carName).toLocaleLowerCase()).length;
        if (isValidCar) {
            conv.add(`${carName} booked for ${destination} for ${(new Date(travelDate)).toDateString()}.`);
        } else {
            //to loop through same intent, set context
            agent.context.set({
                name: 'await_rentcarname_withtrainbookingdetails',//await_rentCarName_withTrainBookingDetails
                lifespan: 1, parameters: agent.context.contexts["await_rentcarname_withtrainbookingdetails"].parameters
            });
            var msg = "";//`You have selected unavailable car. Please select from below available cars.`;
            askCarName(conv, msg);
        }
        agent.add(conv);
    }
    function rentCar(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance        
        var parameters = agent.parameters;
        var context = agent.context.contexts["sessionvars"];
        askRentCarLocation(conv);
        agent.add(conv);
    }
    function askRentCarLocation(conv) {
        conv.add(`Please provide location for your car rental.`);
        conv.ask(new Suggestions(Suggestions_Locations));
    }
    function rentCarLocation(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance        
        var parameters = agent.parameters;
        var context = agent.context.contexts["sessionvars"];
        conv.add(`For when do you want to rent car?`);
        conv.ask(new Suggestions(Suggestions_CarRentDates));
        agent.add(conv);
    }
    function rentCarDate(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance
        askCarName(conv, "");
        agent.add(conv);
    }
    function rentCarName(agent) {//called when train booking details not taken into consideration 
        let conv = agent.conv(); // Get Actions on Google library conv instance        
        var parameters = agent.parameters;
        var context = agent.context.contexts["sessionvars"];
        var travelDate = context.parameters.RentCarDate;
        var destination = context.parameters.RentCarLocation;
        var carName = parameters.CarName;
        var isValidCar = Suggestions_CarNames.filter(car => String(car).toLocaleLowerCase() == String(carName).toLocaleLowerCase()).length;
        if (isValidCar) {
            conv.add(`${carName} booked for ${destination} for ${(new Date(travelDate)).toDateString()}.`);
        } else {
            //to loop through same intent, set context
            agent.context.set({ name: 'await_rentcarname', lifespan: 1, parameters: agent.context.contexts["await_rentcarname"].parameters });
            var msg = "";//`You have selected unavailable car. Please select from below available cars.`;
            askCarName(conv, msg);
        }
        agent.add(conv);
    }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    //START > TRAIN BOOKING
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('travel.planner.startOver', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('book.train.start.generic', bookTrain);
    intentMap.set('book.train.providesDestination.change', bookTrainChangeDestination);
    intentMap.set('book.train.providesDestination', bookTrainDestination);
    intentMap.set('book.train.providesTravelDate', bookTrainTravelDate);
    intentMap.set('book.train.providesTravelDate.change', bookTrainChangeTravelDate);
    intentMap.set('book.train.seatSelectionYes', bookTrainSelectSeatYes);
    intentMap.set('book.train.providesSeatNumber', bookTrainProvideSeatNumber);
    intentMap.set('book.train.seatSelectionNo', bookTrainSelectSeatNo);
    intentMap.set('travel.planner.thankYou', travelPlannerThankYou);
    intentMap.set('travel.planner.thankYou.rentCarNo', travelPlannerThankYouEnd);
    //END > TRAIN BOOKING

    //START > RENT A CAR AFTER TRAIN BOOKING
    intentMap.set('travel.planner.thankYou.rentCarYes', rentCarAfterTrainBooking);
    intentMap.set('rent.car.continueWithTrainBookingDetailsYes', rentCarAfterTrainBooking_continueWithTrainBookingDetailsYes);
    intentMap.set('rent.car.providesCarName.continueWithTrainBookingDetails', rentCarAfterTrainBooking_continueWithTrainBookingDetails);
    intentMap.set('rent.car.providesCarName.validate.withTrainBookingDetails', rentCarAfterTrainBooking_continueWithTrainBookingDetails);
    //END > RENT A CAR AFTER TRAIN BOOKING

    //START > RENT A CAR
    intentMap.set('rent.car.start.generic', rentCar);
    intentMap.set('rent.car.continueWithTrainBookingDetailsNo', rentCar);
    intentMap.set('rent.car.providesLocation', rentCarLocation);
    intentMap.set('rent.car.providesDate', rentCarDate);
    intentMap.set('rent.car.providesCarName', rentCarName);
    intentMap.set('rent.car.providesCarName.validate', rentCarName);
    //END > RENT A CAR

    agent.handleRequest(intentMap);
});