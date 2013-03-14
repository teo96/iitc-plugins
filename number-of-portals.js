// ==UserScript==
// @id             iitc-plugin-number-of-portals@teo96
// @name           teo96: add the number of portals, links & fields under the portal panel
// @version        0.0.1
// @namespace      https://github.com/breunigs/ingress-intel-total-conversion
// @updateURL      
// @downloadURL    
// @description    display number of portals, links & fields
// @include        https://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// ==/UserScript==

function wrapper() {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};


// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.displayNumPLF = function() {};

window.plugin.displayNumPLF.setupCallback = function() {
  // add a new div to the bottom of the sidebar and style it

    $('#sidebar').append('<div id="number_PLF"></div>');
  $('#number_PLF').css({'color':'#ffce00', 'font-size':'90%', 'padding':'4px 2px'});

  // do an initial calc for sidebar sizing purposes
  window.plugin.displayNumPLF.onPositionMove();

  // make the value update when the map data updates
  var handleDataResponseOrig = window.handleDataResponse;
  window.handleDataResponse = function(data, textStatus, jqXHR) {
    handleDataResponseOrig(data, textStatus, jqXHR);
    window.plugin.displayNumPLF.onPositionMove();
  }
}

window.plugin.displayNumPLF.onPositionMove = function() {
  $('#number_PLF').html('Number of loaded elements:<table><tr>' 
    + '<td>Portals:</td><td style="text-align:right">' + Object.keys(portals).length + '</td>' 
    + '<td>Links:</td><td style="text-align:right">' + Object.keys(links).length + '</td>'
    + '<td>Fields:</td><td style="text-align:right">' + Object.keys(fields).length + '</td>'
    + '</tr></table>');
}

var setup =  function() {
  window.plugin.displayNumPLF.setupCallback();
}

// PLUGIN END //////////////////////////////////////////////////////////

if(window.iitcLoaded && typeof setup === 'function') {
  setup();
} else {
  if(window.bootPlugins)
    window.bootPlugins.push(setup);
  else
    window.bootPlugins = [setup];
}
} // wrapper end
// inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')();'));
(document.body || document.head || document.documentElement).appendChild(script);
