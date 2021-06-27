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

// Function to populate dropdown variable menus:
// 'column name in data': 'display value for frontend of visualization'
var colName_to_displayVal = {
  'Wired 25 (BN)': 'wired25_3_2020_bn',
  'Wired 100 (BN)': 'wired100_3_2020_bn',
  //'averagembps_bn': 'Average Speed (BN)',
  //'fastestaveragembps_bn': 'Fastest Average Speed (BN)',
  //'lowestpricedterrestrialbroadbandplan_bn': 'Lowest Priced Terrestrial Plan (BN)',
  'Broadband Usage (MS)': 'broadbandusage_ms',
  'Average Throughput (ML)': 'avg_meanthroughputmbps_ml',
  'Number of Speed Tests (ML)': 'speedtests_ml',
  'Average Weighted Download Speed (Ook)': 'avgwt_downloadspeed_ook',
  'Average Weighted Upload Speed (Ook)': 'avgwt_uploadspeed_ook',
  'Number of Speed Tests (Ook)': 'Number of Speed Tests (Ook)speedtests_ook',
  'Number of Internet Providers (FCC)': 'numproviders_fcc',
  'Average Fraction Coverage (FCC)': 'avg_fractioncoverage_fcc',
  'Average Weighted Maximum Advertised Download Speed (FCC)': 'avgwt_maxaddown_fcc',
  'Average Weighted Maximum Upload Download Speed (FCC)': 'avgwt_maxadup_fcc',
  'Broadband Score': 'dummy_score_for_testing'
}

// Populate the variable selection dropdowns on the frontend:
$.each(colName_to_displayVal, function(key, value) {
  $('.dropdown-menu').append(`
    <li><a class="dropdown-item" data-value=${value} href="#">${key}</a></li>
    `)
})


// Function to determine when the sidenav is open and what it is populated with
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

// variables to hold the user's selection of variables to display:
var first_var = 'Broadband Score';
var second_var = 'Broadband Score';

// this function will update the variable selections on the first dropdown menu for variable selection:
$("#first-dropdown li a").click(function() {
  first_var = $(this).text() //$(this).data('value') - this is a string AND it is updating the global first_var variable BUT still throwing error when we show the layer... `'${$(this).data('value')}'`
  console.log('local first_var:', first_var)
  console.log(jQuery.type(first_var))
  $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
  // $(this).parents(".dropdown").find('.btn').val($(this).data('value')); // "allows you to have different display text and data value for each element - from SO"

  // show fill layer for first variable
  map.setLayoutProperty('scores_layer', 'visibility','none');
  map.setLayoutProperty('first_selected_layer', 'visibility','visible');
  map.setPaintProperty('first_selected_layer', 'fill-color', [
    'step',
    ['get', colName_to_displayVal[first_var]],
    sequential_colors[0],
    25, sequential_colors[1],
    100, sequential_colors[2],
    200, sequential_colors[3],
    230, sequential_colors[4],
  ])
  map.setPaintProperty('second_selected_layer', 'fill-extrusion-color', [
    'step',
    ['get', colName_to_displayVal[first_var]],
    sequential_colors[0],
    25, sequential_colors[1],
    100, sequential_colors[2],
    200, sequential_colors[3],
    230, sequential_colors[4],
  ]);
});

// this function will update the variable selections on the second dropdown menu for variable selection:
$("#second-dropdown li a").click(function() {
  second_var = $(this).text() //$(this).data('value') - this is a string AND it is updating the global first_var variable BUT still throwing error when we show the layer... `'${$(this).data('value')}'`
  console.log('global first_var:', first_var)
  console.log(jQuery.type(first_var))
  //console.log(`${first_var}`)
  $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
  // $(this).parents(".dropdown").find('.btn').val($(this).data('value')); // "allows you to have different display text and data value for each element - from SO"

  map.setLayoutProperty('scores_layer', 'visibility','none');
  map.setLayoutProperty('second_selected_layer', 'visibility','visible');
  map.setPaintProperty('second_selected_layer', 'fill-extrusion-color', [
    'step',
    ['get', colName_to_displayVal[first_var]],
    sequential_colors[0],
    25, sequential_colors[1],
    100, sequential_colors[2],
    200, sequential_colors[3],
    230, sequential_colors[4],
  ]);
  map.setPaintProperty('second_selected_layer', 'fill-extrusion-height', [
    'step',
    ['get', colName_to_displayVal[second_var]],
    5000,
    25, 10000,
    60, 20000,
    120, 30000,
    180, 40000
  ]);
  //map.setPaintProperty('first_selected_layer', 'fill-outline-color', '#0000ffff')
});

// variables to hold and edit our color schemes
var sequential_colors = ['#8A8AFF','#5C5CFF','#2E2EFF','#0000FF','#0000A3']; //blue
var diverging_colors = ['#d7191c','#fdae61','#ffffbf','#a6d96a','#1a9641'] //red --> green

// Function to add styling for hovered census tract
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
        ['get', 'avgwt_downloadspeed_ook'],
        sequential_colors[0],
        25, sequential_colors[1],
        100, sequential_colors[2],
        200, sequential_colors[3],
        230, sequential_colors[4],
      ],
      'fill-extrusion-height': [
        'step',
        ['get', 'avgwt_uploadspeed_ook'],
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

// Function to add layers based on CARTO tiles:
async function addCartoLayer() {
  const tileSourceURLs = await getTileSources();

  map.addLayer(
    {
      id: 'scores_layer',
      type: 'fill',
      source: {
        type: 'vector',
        tiles: tileSourceURLs
      },
      'source-layer': 'layer0',
      layout: {
        'visibility': 'visible'
      },
      paint: {
        'fill-color': [
          'step',
          ['get', 'dummy_score_for_testing'],
          diverging_colors[0],
          2, diverging_colors[1],
          3, diverging_colors[2],
          4, diverging_colors[3],
          5, diverging_colors[4],
        ],
        'fill-opacity': 0.7,
        'fill-outline-color': 'black'
      }
    }
  );

  map.addLayer(
    {
      id: 'first_selected_layer',
      type: 'fill',
      source: {
        type: 'vector',
        tiles: tileSourceURLs
      },
      'source-layer': 'layer0',
      layout: {
        'visibility': 'none'
      },
      paint: {
        'fill-color': [
          'step',
          ['get', colName_to_displayVal[first_var]],
          sequential_colors[0],
          25, sequential_colors[1],
          100, sequential_colors[2],
          200, sequential_colors[3],
          230, sequential_colors[4],
        ],
        'fill-opacity': 1
      }
    }
  );

  map.addLayer(
    {
      id: 'second_selected_layer',
      type: 'fill-extrusion',
      source: {
        type: 'vector',
        tiles: tileSourceURLs
      },
      'source-layer': 'layer0',
      layout: {
        'visibility': 'none'
      },
      paint: {
        'fill-extrusion-color': [
          'step',
          ['get', first_var],
          sequential_colors[0],
          25, sequential_colors[1],
          100, sequential_colors[2],
          200, sequential_colors[3],
          230, sequential_colors[4],
        ],
        'fill-extrusion-height': [
          'step',
          ['get', 'avgwt_uploadspeed_ook'],
          5000,
          25, 10000,
          60, 20000,
          120, 30000,
          180, 40000
        ],
        'fill-extrusion-opacity': 1
      }
    }
  );

}

// Function to get tiles from CARTO source
async function getTileSources() {
  const mapConfig = JSON.stringify({
    version: '1.3.1',
    buffersize: {mvt: 1},
    layers: [
      {
        type: 'mapnik',
        options: {
          sql: 'SELECT the_geom_webmercator, censustract, wired25_3_2020_bn, wired100_3_2020_bn, broadbandusage_ms, avg_meanthroughputmbps_ml, speedtests_ml, avgwt_downloadspeed_ook, avgwt_uploadspeed_ook, speedtests_ook, numproviders_fcc, avg_fractioncoverage_fcc, avgwt_maxaddown_fcc, avgwt_maxadup_fcc, dummy_score_for_testing FROM masterdataset_speedtestdata_dummyscores',
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
      layers: ['second_selected_layer'],
  });

  // Check whether features exist
  if (features.length > 0) {
    map.getCanvas().style.cursor = 'pointer'; //change cursor to pointer if hovering over a circle/feature

    var hoveredFeature = features[0];
    //Extract necessary variables:
    var tract_id = hoveredFeature.properties.censustract;
    var tests = hoveredFeature.properties.tests;
    var upload_sp = hoveredFeature.properties.avgwt_uploadspeed_ook;
    var download_sp = hoveredFeature.properties.avgwt_downloadspeed_ook

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
        'avgwt_uploadspeed_ook': upload_sp,
        'avgwt_downloadspeed_ook': download_sp
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
