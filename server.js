// init project
var express = require('express');
var app = express();
var fetch = require('node-fetch');

// init Spotify API wrapper
var SpotifyWebApi = require('spotify-web-api-node');

// Set up credentials
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET,
});

// Apply credentials using client grant
spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  }, function(err) {
    console.log('Something went wrong when retrieving an access token', err.message);
  });

// Retrieve an access token.
function getToken() {
    spotifyApi.clientCredentialsGrant().then(
        function (data) {
            console.log('The access token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            spotifyApi.setAccessToken(data.body['access_token']);
        },
        function (err) {
            console.log('Something went wrong when retrieving an access token', err);
        }
    );
}
// Used to re-retrieve an access token every hour
setInterval(getToken, 1000 * 60 * 60);

app.use(express.static('public'));

// This will send the html file to be served/displayed
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


// app.get("/search", function (request, response) {
//   let query = request.query.query;
//   let type = request.query.context;
    
//     // Piece together the endpoint by adding th type (artist/track) to the searched name
//     query = type + ':' + query;
//   }
//   spotifyApi.searchTracks(query)
//   .then(function(data) {
//     response.send(data.body);
//   }, function(err) {
//     console.log(err)
//   });
// });
///////////////////////////////////////////////////////////////////////////

// This func concats the 2 other functions into a nested call
// ### UNNEEDED
// app.get('/albums', function (request, response) {
//   let query = request.query.query + "*";    // User inputted artist

//   spotifyApi.searchArtists(query, {limit: 1})
//   .then(function(data) {
//     return data.body.artists.items.map(function(i) {
//       return i.id;
//     })
//   })
//     .then(function(artistIds) {
//     return spotifyApi.getArtistAlbums(artistIds);
//   })
//     .then(function(data) {
//     response.send(data.body);
//   })
//   .catch(function(error) {
//     console.error(error);
//   });
// });


// Searches for artists
// @returns first 10 artists
// @param: the user inputted text
app.get('/artists', function(request, response) {
  let query = request.query.query + "*";
  
  setTimeout(function(){
    spotifyApi.searchArtists(query, {limit: 10})
    .then(function(data) {
      response.send(data.body);
    }, function(err) {
      console.log(err)
    }); 
  }, 100);
});

// Retrieves an artist's albums
// @returns [album objects]
// @param: the id of the artist
app.get('/artistAlbums', function(request, response) {
  let artist = request.query.artist;
  
  setTimeout(function(){
    spotifyApi.getArtistAlbums(artist, {market: 'US'})
    .then(function(data) {
      console.log(data.body);
      response.send(data.body);
    }, function(err) {
      console.log(err)
    });
  }, 100);
});

// Retrieves the album artwork from an album ID
// @return: data about the album
// @param: the ID of the album clicked
app.get('/albumArtwork', function(request, response) {
  let albumId = request.query.albumId;
  spotifyApi.getAlbum(albumId)
  .then(function(data) {
    response.send(data.body);
  }, function(err) {
    console.log(err)
  });
});

// #### Replaced with just retrieving all album tracks
// Retrieves all tracks from an album
// @returns [track objects]
// @param: the id of the album
// app.get('/tracks', function(request, response) {
//   let album = request.query.album;
//   spotifyApi.getAlbumTracks(album, {market: 'US'}) 
//   .then(function(data) {
//     console.log(data.body);
//     response.send(data.body);
//   }, function(err) {
//     console.log(err)
//   });
// });
//////////////////////////////////////////////////////////////////////////////
// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
