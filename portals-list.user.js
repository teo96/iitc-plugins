// ==UserScript==
// @id             iitc-plugin-portals-list@teo96
// @name           teo96: show list of portals
// @version        0.0.3
// @namespace      https://github.com/breunigs/ingress-intel-total-conversion
// @updateURL      https://raw.github.com/teo96/iitc-plugins/master/portals-list.user.js
// @downloadURL    https://raw.github.com/teo96/iitc-plugins/master/portals-list.user.js
// @description    Display a sortable list of all localized portails with team, level, resonators informations
// @include        https://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// ==/UserScript==

/* whatsnew
* 0.0.3 : sorting ascending/descending and add numbers of portals by faction on top on table
* 0.0.2 : add sorting feature when click on header column
* 0.0.1 : initial release, show list of portals with level, team, resonators and shield information
* Thanks to @vita10gy for his scoreboard plugin : iitc-plugin-scoreboard@vita10gy - https://github.com/breunigs/ingress-intel-total-conversion
* todo : 
* - bug : Fix window position on load, sometimes on the right instead of center
* - Feature : add link to each portal in the table, when click display details in the portal panel ex : <a onclick="window.zoomToAndShowPortal('1c9324e9ae994e43b409df3065009ad9.11', [47.846257, 1.916971]);return false" title="" href="https://ingress.com/intel?latE6=47846257&amp;lngE6=1916971&amp;z=17&amp;pguid=1c9324e9ae994e43b409df3065009ad9.11" class="help" aria-describedby="ui-tooltip-7">cage verte les aulnaies</a>
*/ 

function wrapper() {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.portalslist = function() {};
    
window.plugin.portalslist.listPortals = []; // structure : name, team, level, resonators = Array, Shields = Array, APgain
window.plugin.portalslist.sortOrder=-1;    
window.plugin.portalslist.enlP = 0;
window.plugin.portalslist.resP = 0;

//fill the listPortals array with portals avalaible on the map (by level filtered portals will not appear in the table)
window.plugin.portalslist.getPortals = function(){
    
    var retval=false;
    window.plugin.portalslist.listPortals = [];
    //get portals informations from IITC
    $.each(window.portals, function(i, portal) {
        retval=true;
        var d = portal.options.details;   
        var name =  d.portalV2.descriptiveText.TITLE;
        var team = portal.options.team;
        switch (team){
            case 1 :
                window.plugin.portalslist.resP++;
                break;
            case 2 :
                window.plugin.portalslist.enlP++;
                break;
        }
        var level = getPortalLevel(d).toFixed(2);
    
    
        //var player = portal.options.details.captured.capturingPlayerId;
        //get resonators informations
        var resonators = []; // my local resonator array : reso level, reso deployed by, distance to portal, energy total, max 
         
        $.each(portal.options.details.resonatorArray.resonators, function(ind, reso) {
          if(reso) {  
            resonators[ind] = [reso.level, window.getPlayerName(reso.ownerGuid), reso.distanceToPortal, reso.energyTotal, RESO_NRG[reso.level]];
          } else { resonators[ind] = [0,'',0,0,0]; }
        }); 
        // Sort resonators array by resonator level
        resonators.sort(function (a, b) {return b[0] - a[0]});
                       
         //get shield informations 
           var shields = [];
         $.each(d.portalV2.linkedModArray, function(ind, mod) {
           if (mod) 
              shields[ind] = mod.rarity.capitalize().replace('_', ' ');
           else
              shields[ind] = ''; 
        });
        
        var APgain= getAttackApGain(d).totalAp;
        var thisPortal = {'name':name,'team':team,'level':level,'resonators':resonators,'shields':shields,'APgain':APgain};
        window.plugin.portalslist.listPortals.push(thisPortal);

    });
    return retval;
  }
    
window.plugin.portalslist.displayPL = function() {   
    var html = '';
    window.plugin.portalslist.sortOrder=-1;
    window.plugin.portalslist.enlP = 0;
    window.plugin.portalslist.resP = 0;

    if (window.plugin.portalslist.getPortals()) {
       html += window.plugin.portalslist.portalTable('level', window.plugin.portalslist.sortOrder);
    } else {
    	html = '<table><tr><td>Nothing to Show !</td></tr></table>';
    };
    alert('<div id="portalslist">' + html + '</div>');
    $(".ui-dialog").addClass('ui-dialog-portalslist');
  
    // Setup sorting
    $(document).on('click', '#portalslist table th', function() {    	
        $('#portalslist').html(window.plugin.portalslist.portalTable($(this).data('sort'),window.plugin.portalslist.sortOrder));
  	});
    
 }
    
window.plugin.portalslist.portalTable = function(sortBy, sortOrder) {
    // sortOrder <0 ==> desc, >0 ==> asc, i use sortOrder * -1 to change the state
    
    var portals=window.plugin.portalslist.listPortals;
    console.log('********************** SortBy = ' + sortBy + ', SortOrder = ' + sortOrder);
    //tri du tableau window.plugin.portalslist.listPortals
    window.plugin.portalslist.listPortals.sort(function(a, b) {
        var retVal = 0;
        
        if (sortOrder < 0) {
            switch (sortBy) {
                case 'names':
                    retVal = a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
                    break;
                case 'r1':
                    retVal = b.resonators[0][0] - a.resonators[0][0];
                    break;
                case 'r2':
                    retVal = b.resonators[1][0] - a.resonators[1][0];
                    break;
                case 'r3':
                    retVal = b.resonators[2][0] - a.resonators[2][0];
                    break;
                case 'r4':
                    retVal = b.resonators[3][0] - a.resonators[3][0];
                    break;
                case 'r5':
                    retVal = b.resonators[4][0] - a.resonators[4][0];
                    break;
                case 'r6':
                    retVal = b.resonators[5][0] - a.resonators[5][0];
                    break;
                case 'r7':
                    retVal = b.resonators[6][0] - a.resonators[6][0];
                    break;
                case 'r8':
                    retVal = b.resonators[7][0] - a.resonators[7][0];
                    break;
                case 's1':
                    retVal = a.shields[0].toLowerCase() > b.shields[0].toLowerCase() ? -1 : 1;
                    break;
                case 's2':
                    retVal = a.shields[1].toLowerCase() > b.shields[1].toLowerCase() ? -1 : 1;
                    break;
                case 's3':
                    retVal = a.shields[2].toLowerCase() > b.shields[2].toLowerCase() ? -1 : 1;
                    break;
                case 's4':
                    retVal = a.shields[3].toLowerCase() > b.shields[3].toLowerCase() ? -1 : 1;
                    break;
                default:
                    retVal = b[sortBy] - a[sortBy];    
                    break;
            } 
        }
        else
        {
            switch (sortBy) {
                case 'names':
                    retVal = a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1;
                    break;
                case 'r1':
                    retVal = a.resonators[0][0] - b.resonators[0][0];
                    break;
                case 'r2':
                    retVal = a.resonators[1][0] - b.resonators[1][0];
                    break;
                case 'r3':
                    retVal = a.resonators[2][0] - b.resonators[2][0];
                    break;
                case 'r4':
                    retVal = a.resonators[3][0] - b.resonators[3][0];
                    break;
                case 'r5':
                    retVal = a.resonators[4][0] - b.resonators[4][0];
                    break;
                case 'r6':
                    retVal = a.resonators[5][0] - b.resonators[5][0];
                    break;
                case 'r7':
                    retVal = a.resonators[6][0] - b.resonators[6][0];
                    break;
                case 'r8':
                    retVal = a.resonators[7][0] - b.resonators[7][0];
                    break;
                case 's1':
                    retVal = a.shields[0].toLowerCase() < b.shields[0].toLowerCase() ? -1 : 1;
                    break;
                case 's2':
                    retVal = a.shields[1].toLowerCase() < b.shields[1].toLowerCase() ? -1 : 1;
                    break;
                case 's3':
                    retVal = a.shields[2].toLowerCase() < b.shields[2].toLowerCase() ? -1 : 1;
                    break;
                case 's4':
                    retVal = a.shields[3].toLowerCase() < b.shields[3].toLowerCase() ? -1 : 1;
                    break;
                default:
                    retVal = a[sortBy] - b[sortBy];    
                    break;
            }
        }
        return retVal;
    });  
    
    var sort = window.plugin.portalslist.portalTableSort;
    var html = window.plugin.portalslist.stats();
    html += '<table>'
    + '<tr><th ' + sort('names', sortBy, -1) + '>Portal</th>' 
    + '<th ' + sort('level', sortBy, -1) + '>Level</th>'
    + '<th ' + sort('team', sortBy, -1) + '>Team</th>'
    + '<th ' + sort('r1', sortBy, -1) + '>R1</th>'
    + '<th ' + sort('r2', sortBy, -1) + '>R2</th>'
    + '<th ' + sort('r3', sortBy, -1) + '>R3</th>'
    + '<th ' + sort('r4', sortBy, -1) + '>R4</th>'
    + '<th ' + sort('r5', sortBy, -1) + '>R5</th>'
    + '<th ' + sort('r6', sortBy, -1) + '>R6</th>'
    + '<th ' + sort('r7', sortBy, -1) + '>R7</th>'
    + '<th ' + sort('r8', sortBy, -1) + '>R8</th>'
    + '<th ' + sort('s1', sortBy, -1) + '>Shield 1</th>'
    + '<th ' + sort('s2', sortBy, -1) + '>Shield 2</th>'
    + '<th ' + sort('s3', sortBy, -1) + '>Shield 3</th>'
    + '<th ' + sort('s4', sortBy, -1) + '>Shield 4</th>'
    + '<th ' + sort('APgain', sortBy, -1) + '>AP Gain</th></tr>';
    
    
    $.each(portals, function(ind, portal) {
        html += '<tr class="' + (portal.team === 1 ? 'res' : (portal.team === 2 ? 'enl' : 'neutral')) + '">'
        + '<td>' + portal.name + '</td>'
        + '<td class="L' + Math.floor(portal.level) +'">' + portal.level + '</td>'
        + '<td style="text-align:center;">' + portal.team + '</td>'
        + '<td class="L' + portal.resonators[0][0] +'">' + portal.resonators[0][0] + '</td>'
        + '<td class="L' + portal.resonators[1][0] +'">' + portal.resonators[1][0] + '</td>'
        + '<td class="L' + portal.resonators[2][0] +'">' + portal.resonators[2][0] + '</td>'
        + '<td class="L' + portal.resonators[3][0] +'">' + portal.resonators[3][0] + '</td>'
        + '<td class="L' + portal.resonators[4][0] +'">' + portal.resonators[4][0] + '</td>'
        + '<td class="L' + portal.resonators[5][0] +'">' + portal.resonators[5][0] + '</td>'
        + '<td class="L' + portal.resonators[6][0] +'">' + portal.resonators[6][0] + '</td>'
        + '<td class="L' + portal.resonators[7][0] +'">' + portal.resonators[7][0] + '</td>'
        + '<td>' + portal.shields[0] + '</td>'
        + '<td>' + portal.shields[1] + '</td>'
        + '<td>' + portal.shields[2] + '</td>'
        + '<td>' + portal.shields[3] + '</td>'
        + '<td>' + portal.APgain + '</td>';
        
        html+= '</tr>';
    });
    html+='</table>';
    window.plugin.portalslist.sortOrder = window.plugin.portalslist.sortOrder*-1;
    return html;
}

window.plugin.portalslist.stats = function(sortBy) {
    var html = '<table><tr>'
    + '<td>Total Portals : </td><td style="text-align:center">' + window.plugin.portalslist.listPortals.length + '</td>'
    + '<td>Resistant Portals : </td><td style=" background-color: #005684; text-align:center">' + window.plugin.portalslist.resP + '</td>' 
    + '<td>Enlightened Portals : </td><td style=" background-color: #017f01; text-align:center">' + window.plugin.portalslist.enlP + '</td>'  
    + '</tr></table>';
    return html;
}


// A little helper functon so the above isn't so messy
window.plugin.portalslist.portalTableSort = function(name, by) {
  var retVal = 'data-sort="' + name + '"';
  if(name === by) {
    retVal += ' class="sorted"';
  }
  return retVal;
};

var setup =  function() {
  $('body').append('<div id="portalslist" style="display:none;"></div>');
  $('#toolbox').append('<a onclick="window.plugin.portalslist.displayPL()">Portals List</a>');
  $('head').append('<style>' + 
    '.ui-dialog-portalslist {position: absolute !important; top: 30px !important; left: 30px !important;max-width:800px !important; width:733px !important;}' + //
    '#portalslist table {margin-top:5px;	border-collapse: collapse; empty-cells: show; width:100%; clear: both;}' +
    '#portalslist table td, #portalslist table th {border-bottom: 1px solid #0b314e; padding:3px; color:white; background-color:#1b415e}' +
    '#portalslist table tr.res td {  background-color: #005684; }' +
    '#portalslist table tr.enl td {  background-color: #017f01; }' +
    '#portalslist table tr.neutral td {  background-color: #000000; }' +
    '#portalslist table th { text-align:center;}' +
    '#portalslist table td { text-align: center;}' +
    '#portalslist table td.L0 { background-color: #000000 !important;}' +
    '#portalslist table td.L1 { background-color: #FECE5A !important;}' +
	'#portalslist table td.L2 { background-color: #FFA630 !important;}' +
	'#portalslist table td.L3 { background-color: #FF7315 !important;}' +
	'#portalslist table td.L4 { background-color: #E40000 !important;}' +
	'#portalslist table td.L5 { background-color: #FD2992 !important;}' +
	'#portalslist table td.L6 { background-color: #EB26CD !important;}' +
    '#portalslist table td.L7 { background-color: #C124E0 !important;}' +
	'#portalslist table td.L8 { background-color: #9627F4 !important;}' + 
    '#portalslist table td:nth-child(1) { text-align: left;}' +
    '#portalslist table th { cursor:pointer; text-align: right;}' +
    '#portalslist table th:nth-child(1) { text-align: left;}' +
    '#portalslist table th.sorted { color:#FFCE00; }' +
    '#portalslist .disclaimer { margin-top:10px; font-size:10px; }' +
    '</style>');
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
