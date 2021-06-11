var map = new mapboxgl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    center: [-75.5912853, 43.0384658], // starting position [lng, lat]
    zoom: 6, // starting zoom
    pitch: 40
});

// Add navigation control:
map.addControl(new mapboxgl.NavigationControl({
  showCompass: false,
  showZoom: true
}));

function openNav() {
  // Set the width of the side navigation to be viewable at 250px and move the sidenav buttons over 250px:
  document.getElementById("sidenav-menu").style.width = "250px";
  document.getElementById("sidenav-buttons").style.left = "250px";
  // Depending on which sidenav button was clicked, populate the menu with the relevant text
  $('.sidenav-button').click(function() {
    $('.sidenav-button').removeClass('sidenav-button-active'); //remove styling from any previously selected button
    var button_id = $(this).attr('id') //pull out the id name of the clicked sidenav button
    var menu_text = $(`#${button_id}-text`).html(); //get the menu text and styling for the clicked button
    $(".sidenav-menu-text").html(menu_text); //populate the sidenav menu with the appropriate html
    // style the clicked button:
    $(`#${button_id}`).addClass('sidenav-button-active');
  });
}

// Function to close the side navigaion
// Set the width of the side navigation to 0 and the left margin of the page content to 0
function closeNav() {
  document.getElementById("sidenav-menu").style.width = "0";
  document.getElementById("sidenav-buttons").style.left = "0px";
  $('.sidenav-button').removeClass('sidenav-button-active');
}

var avg_d_colors = ['#8A8AFF','#5C5CFF','#2E2EFF','#0000FF','#0000A3']; //blue

map.on('style.load', function() {

  openNav(); //load welcome message on load

  // add an empty data source, which we will use to highlight the census tract that the user is hovering over
  map.addSource('highlight-tract-source', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  // add a layer for the hovered station
  map.addLayer({
    id: 'highlight-tract-layer',
    type: 'fill-extrusion',
    source: 'highlight-tract-source',
    paint: {
      'fill-extrusion-color': [
        'step',
        ['get', 'avg_d_mbps_wt'],
        avg_d_colors[0],
        25, avg_d_colors[1],
        100, avg_d_colors[2],
        200, avg_d_colors[3],
        230, avg_d_colors[4],
      ],
      'fill-extrusion-height': [
        'step',
        ['get', 'avg_u_mbps_wt'],
        5000,
        25, 10000,
        60, 20000,
        120, 30000,
        180, 40000
      ],
      'fill-extrusion-opacity': 1
    }
  });

})

const REQUEST_GET_MAX_URL_LENGTH = 2048;

addCartoLayer();

async function addCartoLayer() {
  const tileSourceURLs = await getTileSources();
  map.addLayer(
    {
      id: 'ookla_censustract_geom_v3',
      type: 'fill-extrusion',
      source: {
        type: 'vector',
        tiles: tileSourceURLs
      },
      'source-layer': 'layer0',
      paint: {
        'fill-extrusion-color': [
          'step',
          ['get', 'avg_d_mbps_wt'],
          avg_d_colors[0],
          25, avg_d_colors[1],
          100, avg_d_colors[2],
          200, avg_d_colors[3],
          230, avg_d_colors[4],
        ],
        'fill-extrusion-height': [
          'step',
          ['get', 'avg_u_mbps_wt'],
          5000,
          25, 10000,
          60, 20000,
          120, 30000,
          180, 40000
        ],
        'fill-extrusion-opacity': 0.7
      }
    }
  );
}

async function getTileSources() {
  const mapConfig = JSON.stringify({
    version: '1.3.1',
    buffersize: {mvt: 1},
    layers: [
      {
        type: 'mapnik',
        options: {
          sql: 'SELECT the_geom_webmercator, geoid10, avg_d_mbps_wt, avg_u_mbps_wt, tests FROM ookla_censustract_geom_v3',
          vector_extent: 4096,
          bufferSize: 1,
          version: '1.3.1'
        }
      }
    ]
  });
  const url = `https://usignite-intern.carto.com/api/v1/map?apikey=93ca9b2ca98129188e337d41aee1e0faad970acd`;
  const getUrl = `${url}&config=${encodeURIComponent(mapConfig)}`;
  let request;

  if (getUrl.length < REQUEST_GET_MAX_URL_LENGTH) {
    request = new Request(getUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });

  } else {
    request = new Request(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: mapConfig
    });
  }

  const response = await fetch(request);
  return (await response.json()).metadata.tilejson.vector.tiles
}


// Create a popup, but don't add it to the map yet. This will be the hover popup
var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});


// Function to query rendered features for the census tract the user is hovering over, highlight that tract, then populate popup with that tract's info
map.on('mousemove', function(e) {
  //query for the features under the mouse:
  var features = map.queryRenderedFeatures(e.point, {
      layers: ['ookla_censustract_geom_v3'],
  });

  // Check whether features exist
  if (features.length > 0) {
    map.getCanvas().style.cursor = 'pointer'; //change cursor to pointer if hovering over a circle/feature

    var hoveredFeature = features[0];
    //Extract necessary variables:
    var tract_id = hoveredFeature.properties.geoid10;
    var tests = hoveredFeature.properties.tests;
    var upload_sp = hoveredFeature.properties.avg_u_mbps_wt;
    var download_sp = hoveredFeature.properties.avg_d_mbps_wt

    window['popupContent'] = `
      <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">Census Tract ${tract_id}</div>
      <div style = "font-family:sans-serif; font-size:11px; font-weight:600">Download Speed: ${download_sp}</div>
      <div style = "font-family:sans-serif; font-size:11px; font-weight:600">Upload Speed: ${upload_sp}</div>
      <div style = "font-family:sans-serif; font-size:10px; font-weight:400">(based on ${tests} tests)</div>
    `;

    //fix the position of the popup as the position of the circle:
    popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
    //create and populate a feature with the properties of the hoveredFeature necessary for data-driven styling of the highlight layer
    var hoveredFeature_data = {
      'type': 'Feature',
      'geometry': hoveredFeature.geometry,
      'properties': {
        'avg_u_mbps_wt': upload_sp,
        'avg_d_mbps_wt': download_sp
      },
    };
    // set this circle's geometry and properties as the data for the highlight source
    map.getSource('highlight-tract-source').setData(hoveredFeature_data);

    } else { //if len(features) <1
      // remove the Popup, change back to default cursor and clear data from the highlight data source
      popup.remove();
      map.getCanvas().style.cursor = '';
      map.getSource('highlight-tract-source').setData({
        'type': 'FeatureCollection',
        'features': []
      })
    }
});
