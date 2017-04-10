/* 
URL Shortener Microservice
Raymond Rizzo
*/

var express = require('express');
var app = express();
var shortenArray = [];
var fs = require('fs');
var mongo = require('mongodb').MongoClient;
var mongoURL = process.env.MONGOLAB_URI;

console.log(process.env.MONGOLAB_URI);

app.get('/new/*', function(httpRequest, httpResponse){
	// Test for valid URL (in an admittedly archaic way).
	var testMe = httpRequest.url.substring(5, httpRequest.originalUrl.length).match(/(https|http):\/\/[a-zA-Z0-9\-\.]+\.(com|org|net|mil|edu|COM|ORG|NET|MIL|EDU)$/);
	if(testMe){
		// If URL is valid.
		var newUrl = httpRequest.url.substring(5, httpRequest.originalUrl.length);
		// Search database for existing record.
		mongo.connect(mongoURL , function(error, database){
		    if(error){
		            throw error;
		    } else {
		      database.collection('url-shortener').find({ original_url: newUrl }, { _id: 0 }).toArray(function(error, documents){
		            if(error){
		                throw error;
		    } else {
		        if(documents[0] === undefined){
		        	// If the record does not exist
		        	console.log('record does not exist');
		        	var newRecord = {
					    'original_url': newUrl,
					    // Add validation to ensure this is unique at some point.
					    'short_url': Math.random().toString(36).substring(18)
					};
					console.log('new record to create:');
					console.log(newRecord);
		        	database.collection('url-shortener').insert(newRecord, function(error, data){
						if(error){
						  throw error;
						} else {
							console.log(JSON.stringify(newRecord));
							var correctedOutput = {
							    'original_url': newRecord.original_url,
							    // Add validation to ensure this is unique at some point.
							    'short_url': newRecord.short_url
							};
							httpResponse.end(JSON.stringify(correctedOutput));
							database.close();
						}
					});
		        } else {
		        	//If the record exists
		        	httpResponse.writeHead(200, { "Content-Type": "application/json" });
					httpResponse.end(JSON.stringify(documents[0]));
					database.close();
		        }
		    }
		        });
		    }
		});
	} else {
		// If URL is not valid.
		var errorObject = { 'error': 'Invalid URL entered, for more information see /about', 'received': httpRequest.url.substring(5, httpRequest.originalUrl.length), 'expected': '(https|http):\/\/[a-zA-Z0-9\-\.]+\.(com|org|net|mil|edu|COM|ORG|NET|MIL|EDU)$' };
		httpResponse.writeHead(200, { "Content-Type": "application/json" });
		httpResponse.end(JSON.stringify(errorObject));
	}
});

app.get('/about/', function(httpRequest, httpResponse){
	httpResponse.sendFile(__dirname + '/about.html');
});

app.get('/*', function(httpRequest, httpResponse){
	var shortUrl = httpRequest.originalUrl.substring(1,httpRequest.originalUrl.length);
	mongo.connect(mongoURL , function(error, database){
    if(error){
            throw error;
    } else {
      database.collection('url-shortener').find({ short_url: shortUrl }, { _id: 0 }).toArray(function(error, documents){
            if(error){
                throw error;
    } else {
        if(documents[0] === undefined){
        	var errorObject = { 'error': 'Invalid URL entered, for more information see /about', 'received': shortUrl, 'expected': 'Valid shortened URL' };
			httpResponse.writeHead(200, { "Content-Type": "application/json" });
			httpResponse.end(JSON.stringify(errorObject));
        	database.close();
        } else {
        	console.log(documents[0]);
        	httpResponse.redirect(documents[0].original_url);
        	database.close();
        }
    }
        });
        
        ;
    }
});
	
});





/*
I had finished writing this before realizing that I was supposed to use MongoDB...


app.get('/new/*', function(httpRequest, httpResponse){
	// Test for valid URL (in an admittedly archaic way).
	var testMe = httpRequest.url.substring(5, httpRequest.originalUrl.length).match(/(https|http):\/\/[a-zA-Z0-9\-\.]+\.(com|org|net|mil|edu|COM|ORG|NET|MIL|EDU)$/);
	console.log(testMe);
	if(testMe){
		// If URL is valid.
		var newUrl = httpRequest.url.substring(5, httpRequest.originalUrl.length);
		var shortIndex = shortenArray.findIndex(function(obj) { return obj['original_url'] === newUrl; });
		if(shortIndex == -1){
			// If the URL is not shortened yet.
			var newShortUrl;
			var shortUrlIndex = 0;
			while(shortUrlIndex  >= 0){
				newShortUrl = Math.random().toString(36).substring(18);
				shortUrlIndex = shortenArray.findIndex(function(obj) { return obj['short_url'] === newShortUrl; });
			}
			shortenArray.push({ 'original_url': newUrl, 'short_url': newShortUrl });
			shortIndex = shortenArray.findIndex(function(obj) { return obj['original_url'] === newUrl; })
		}
		httpResponse.writeHead(200, { "Content-Type": "application/json" });
		httpResponse.end(JSON.stringify(shortenArray[shortIndex]));
	} else {
		// If URL is not valid.
		var errorObject = { 'error': 'Invalid URL entered, for more information see /about', 'received': httpRequest.url.substring(5, httpRequest.originalUrl.length), 'expected': '(https|http):\/\/[a-zA-Z0-9\-\.]+\.(com|org|net|mil|edu|COM|ORG|NET|MIL|EDU)$' };
		httpResponse.writeHead(200, { "Content-Type": "application/json" });
		httpResponse.end(JSON.stringify(errorObject));
	}
});

app.get('/about/', function(httpRequest, httpResponse){
	httpResponse.sendFile(__dirname + '/about.html');
});

app.get('/*', function(httpRequest, httpResponse){
	var shortUrl = httpRequest.originalUrl.substring(1,httpRequest.originalUrl.length);
	shortUrlIndex = shortenArray.findIndex(function(obj) { return obj['short_url'] === shortUrl; });
	if(shortUrlIndex  >= 0){
		httpResponse.redirect(shortenArray[shortUrlIndex].original_url);
	} else {
		// If URL is not valid.
		var errorObject = { 'error': 'Invalid URL entered, for more information see /about', 'received': shortUrl, 'expected': 'Valid shortened URL' };
		httpResponse.writeHead(200, { "Content-Type": "application/json" });
		httpResponse.end(JSON.stringify(errorObject));
	}
	
});
*/
app.listen(process.env.PORT);
