// Go to top of page on page refresh
$(window).on('beforeunload', function() {
    $(window).scrollTop(0);
});

// Refreshes site when clicking the title
$(function() {
  $("#title").click(function(event) {
    $('#query').val('');    // Clear search bar
    location.reload();      // Reload page
    $('#albumHeader').css({'visibility':'hidden','width':'0','height':'0'});
  });
});

$(function() {  
  $('#searchForm').submit(function(event) {
    event.preventDefault();
    
    let query = $('input').val();    // The typed input text in the search bar
    let context = $('input[name="context"]:checked').val();    // The radio button checked (artist or track)
   
    // Hide titles if they exist
    $('#albumHeader').css({'visibility':'hidden','width':'0','height':'0'});
    // Hide record instructions
    $('#recordInst').css({'visibility':'hidden','width':'0','height':'0'});

    ////////////////################################################################## 
    // $.get('/search?' + $.param({context: context, query: query}), function(data) {
    //   $('input[type="text"]').val('');
    //   $('input').focus();
    //   console.log('here');
    //   document.getElementById('results').innerHTML = data.tracks.items.map(track => {
    //     return `<li><a href="${track.external_urls.spotify}">${track.name}   |   ${track.artists[0].name}</a></li>`;
    //   }).join('\n');
    // });
    //////////////########################################################################
    
    // Searches using artist name
    // @returns the album artwork for the artist
//     $.get('/albums?' + $.param({query: query}), function(data) {      
      
//       // Display album imgs
//       document.getElementById('albumArtwork').innerHTML = data.items.map(function(album) {
//         return '<li><img class="img " src="' + album.images[0].url + '"</img></li>';
//       })

//     });
    
    // Searches using user-inputted text (artist)
    // @returns an html list of the first 10 suggested artists 
    // Assigns the <li value> to be the ID of the artist
    $.get('/artists?' + $.param({query: query}), function(data) {
      
      // Clear the album list if exists
      $('#albumArtwork').empty();
      
      // Get all artist imgs
      var artistImgs = data.artists.items.map(function(artist) {
        if(artist.images != null && artist.images[0] != null) {
          return artist.images[0].url;
        }    
        else {  // Return the no-image .svg
          return "https://cdn.glitch.com/040cbe9d-c006-4772-986c-53e1f29044a6%2FnoImg.svg?v=1575042562883";
        }
      })
      
      // Populate header above artist list with:  "Artist results for: [query]"
      document.getElementById('artistHeader').innerHTML = '<h2>Artist results for: <span style="color:#FF6AD5"><em>' + query + '</em></span></h2>';
      
      // Scroll to the artist header
      SmoothVerticalScrolling(document.getElementById('artistHeader'), 350, "top");

      
      // Populate the list with name of artists and their values = their spotify ID
      document.getElementById('artistList').innerHTML = data.artists.items.map(function(artist, index) {
        return '<div class="artistContainer" value="' + artist.id + '"><a href="#"><img class="artistImg" src="' + artistImgs[index] + '"alt="image of' + artist.name + '"><p class="artistName"><b>' + artist.name + '</b></p></div>';
      }).join('');
      
      // Clear the artist images for the next search
      artistImgs = [];
    });
  });
});

// Executed when user selects an artist from the artist form
// This will generate the album art
$(function() {
  $('body').delegate("#artistList div","click",function(event) {
    event.preventDefault();
    // @param: the id of artist that was stored in "value"
    $.get('/artistAlbums?' + $.param({artist:$(this).attr("value")}), function(data) {
      
      // Make record wrappers exist
     // $('#turnTable').html('<div id="results"></div><div id="vinylContainer"></div><div style="display:inline-block"><div id="recordPlayer" ondrop="drop(event)" ondragover="allowDrop(event)"></div><div style="display: inline-block"><img id="needle" src="https://cdn.glitch.com/040cbe9d-c006-4772-986c-53e1f29044a6%2Fneedle2.svg?v=1575221192482" alt="turntable needle"></div></div>');
      
      // Clear the artist list if exists
      $('#artistList').empty();
      
      // Clear artist results header
      $('#artistHeader').empty();
      
      // Show album p tag
      $('#albumHeader').css({'visibility':'visible','width':'auto','height':'auto'});
      
      // Scroll to top of page
      window.scrollTo(0,0);
      // Scroll to the album header
      SmoothVerticalScrolling(document.getElementById('albumHeader'), 350, "top");

      
      // Get all album imgs
      var albumImgs = data.items.map(function(album) {
        if(album.images != null && album.images[0] != null) {
          return album.images[0].url;
        }    
        else {  // Return the no-image .svg
          return "https://cdn.glitch.com/040cbe9d-c006-4772-986c-53e1f29044a6%2FnoImg.svg?v=1575042562883";
        }
      })
      
      
      // Display the album artwork
      document.getElementById('albumArtwork').innerHTML = data.items.map(function(album, index) {
        
        if(index === 0) {
          return '<div class="container"><div class="section" value="' + album.id + '"><a href="#"><img class="img" src="' + albumImgs[index] + '"alt="' + album.name + '"></div>';
        }
        else if(index % 4 === 0) {
          return '</div><div class="container"><div class="section" value="' + album.id + '"><a href="#"><img class="img" src="' + albumImgs[index] + '"alt="' + album.name +'"></div>';
        }
        else {
          return '<div class="section" value="' + album.id + '"><a href="#"><img class="img" src="' + albumImgs[index] + '"alt="' + album.name +'"></div>';
        }
      }).join('');
    })
  });
});

// Executed when user clicks on an album artwork 
// Will then make all other albums dissappear and start playing a random preview url from the album
$(function() {
  $('body').delegate('#albumArtwork div',"click", function(event) {
    event.preventDefault();
    event.stopImmediatePropagation();    // This stops the event from firing twice / was screwing up the params for below

    // Grab the artwork
    $.get('/albumArtwork?' + $.param({albumId:$(this).attr("value")}), function(data) {
      
      // Show record instructions
      $('#recordInst').css({'visibility':'visible','width':'auto','height':'auto'});
      
      // Delete everything in vinylContainer
      $('#recordPlayer').empty();
      
      // Move needle to origin
      $('#needle').css('-webkit-animation', 'needleReverse 1s forwards');
      
      // Create vinyl img by border radiusing the album art & adding a black border
      document.getElementById('vinylContainer').innerHTML = '<img value="' + data.id +'" ondragstart="drag(event)" id="vinyl" src="' + data.images[0].url +'"alt="A vinyl record" draggable="true"/>';
    })
    
      // Make turn-table/needle visible
      $('#recordPlayer').css('visibility','visible');
      $('#needle').css('visibility','visible');
    
      // Make buttons visible
      $('.buttonWrapper').css({'visibility':'visible','width':'auto','height':'auto'});
      $('#artistBtn').css({'visibility':'visible','width':'auto','height':'auto'});
    
    // Add spotify play button
    // @param: the album id 
    document.getElementById('results').innerHTML = '<div class="invisFrame"><iframe class="player" src="https://open.spotify.com/embed/album/' + $(this).attr('value') +'" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe></div>';
    $('#results').css({'visibility':'hidden','width':'0','height':'0'});
   
    // Scroll to the vinyl/record player at bottom
    SmoothVerticalScrolling(document.getElementById('recordInst'), 350, "top");

    
    
    // STOP vinyl crackling sounds on loop
    $("#vinylSounds")[0].pause();
    
    // // Safety so sound still stops if timer isnt up
    setTimeout(function() {
      $("#vinylSounds")[0].pause();
    },500);
    
    //@param: the id of the album clicked
//     $.get('/tracks?' + $.param({album:$(this).attr("value")}), function(data) {
      
//       // Get array of track URIS since previews urls dont work with client credentials
//       var trackUris = data.items.map(function(track) {
//         return track.uri;
//       });

//       // Choose a random track and format it 
//        var randomUri = trackUris[Math.floor(Math.random() * trackUris.length)]; 
//       randomUri = randomUri.replace(/:/g,'/');
//       randomUri = randomUri.replace(/spotify/g, "");
//       // Play the song preview url
//       document.getElementById('results').innerHTML = '<div class="invisFrame"> <a href="#"><iframe class="player" src="https://open.spotify.com/embed' + randomUri +' frameborder="0" allowtransparency="true" allow="encrypted-media"><a href="#"></iframe></div>'
//     })
  });
});

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(data));
  
  turnOnTurntable();
}

// Handle artistBtn event
// Focus on input field with smooth scroll
$(function() {
  $('#artistBtn').click(function(event) {
    event.preventDefault();
    // Scroll to the header
    // window.scroll({
    //   top: 0,
    //   left: 0,
    //   behavior: 'smooth' 
    // });
    SmoothVerticalScrolling(document.getElementById('title'), 325, "top");
  })
});

// Handles button to move record automatically
$(function() {
  $('#moveRecordBtn').click(function(event) {
    event.preventDefault();
    
    // Append the vinyl to the record player
    $('#vinyl').appendTo('#recordPlayer');
     turnOnTurntable();
  })
})

// Handles all animations/sounds when record is placed on turntable
function turnOnTurntable() {
  // Play vinyl crackling sounds on loop, synchronized with needle animation
  $("#vinylSounds")[0].volume = .7;
 setTimeout(function(){
    $("#vinylSounds")[0].play();
  }, 400);
  
  // Start rotating vinyl
  $("#vinyl").css('-webkit-animation', 'rotate 3s linear infinite');
  
  // Rotate needle
  $("#needle").css('-webkit-animation', 'rotateNeedle .5s forwards');
  
  // Make play button visible
  $('#results').css({'visibility':'visible','width':'auto','height':'auto'});
}

function SmoothVerticalScrolling(e, time, where) {
    var eTop = e.getBoundingClientRect().top;
    var eAmt = eTop / 100;
    var curTime = 0;
    while (curTime <= time) {
        window.setTimeout(SVS_B, curTime, eAmt, where);
        curTime += time / 100;
    }
}

function SVS_B(eAmt, where) {
    if(where == "center" || where == "")
        window.scrollBy(0, eAmt / 2);
    if (where == "top")
        window.scrollBy(0, eAmt);
}



