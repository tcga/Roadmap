'use strict';
/*jshint globalstrict:true browser:true*/
/*global google:false TCGA:false*/

var FileCountChart, DiseasePlatformsChart;

FileCountChart = function () {

  var query;

  query = [
      'prefix tcga:<http://purl.org/tcga/core#>',
      'select ?date (count (?file) as ?files) {',
      '  ?file tcga:lastModified ?date .       ',
      '} group by ?date order by ?date         '
  ].join(" ");

  TCGA.find(query, function (err, response) {

    if (err) throw err;

    var data, sum, options, chart;

    data = new google.visualization.DataTable();
    data.addColumn('date', 'Date');
    data.addColumn('number', 'Total Files');
    sum = 0;

    response.results.bindings.forEach(function (binding) {
      sum = sum + parseInt(binding.files.value, 10);
      data.addRow([new Date(binding.date.value), sum]);
    });

    options = {
      'width' : '600',
      'height' : '370',
      'vAxis' : {
        'logScale' : true,
        'gridlines' : { 'count' : 7 }
      }
    };

    chart = new google.visualization.LineChart(document.getElementById('FileCount'));
    chart.draw(data, options);

  });

};

DiseasePlatformsChart = function () {

  var query;

  query = [
      'prefix tcga:<http://purl.org/tcga/core#>',
      'select distinct ?platform ?disease      ',
      'where {                                 ',
      '  ?file tcga:platform ?platformId .     ',
      '  ?platformId rdfs:label ?platform .    ',
      '  ?file tcga:diseaseStudy ?diseaseId .  ',
      '  ?diseaseId rdfs:label ?disease .      ',
      '} order by ?disease                     '
  ].join(" ");

  TCGA.find(query, function (err, response) {

    if (err) throw err;

    $("#DiseasePlatforms").empty();

    var diseases = {}, platforms = {}, links = [], w, h, m, r;

    w = 600;
    h = 470;
    m = 20;
    r = 5;

    response.results.bindings.forEach(function (binding) {
      diseases[binding.disease.value] = true;
      platforms[binding.platform.value] = true;
      links.push({
        'disease' : binding.disease.value,
        'platform' : binding.platform.value
      });
    });

    diseases = Object.keys(diseases);
    platforms = Object.keys(platforms).sort();

    var svg = d3.select("#DiseasePlatforms").append("svg")
        .attr("width", w)
        .attr("height", h);

    var dScale = d3.scale.ordinal().domain(diseases).rangePoints([m, h-m]);
    var pScale = d3.scale.ordinal().domain(platforms).rangePoints([m, h-m]);

    var linkLayer = svg.append('g');

    var linkLine = d3.svg.diagonal()
        .source( function (d) { return { x : w/5, y : dScale(d.disease) }})
        .target( function (d) { return { x : 3*w/5, y : pScale(d.platform) }});

    var linkLines = linkLayer.selectAll('link')
        .data(links)
      .enter().append('path')
        .attr('class', 'link')
        .attr('d', linkLine)

    var diseaseRow = svg.append('g')
        .attr('transform', 'translate('+ w/5 +', 0)');

    var diseaseCircles = diseaseRow.selectAll('.disease')
        .data(diseases)
      .enter().append('circle')
        .attr('class', 'disease')
        .attr('r', r)
        .attr('cy', dScale)

    var diseaseLabels = diseaseRow.selectAll('.nodeLabel')
        .data(diseases)
      .enter().append('text')
        .text(function(d){return d;})
        .attr('y', function (d) {return dScale(d) + r;})
        .attr('x', -10)
        .attr('class', 'nodeLabel')
        .attr('text-anchor', 'end');

    var platformRow = svg.append('g')
        .attr('transform', 'translate('+ 3*w/5 +', 0)');

    var platformCircles = platformRow.selectAll('.platform')
        .data(platforms)
      .enter().append('circle')
        .attr('class', 'platform')
        .attr('r', r)
        .attr('cy', pScale);

    var platformLabels = platformRow.selectAll('.nodeLabel')
        .data(platforms)
      .enter().append('text')
        .text(function(d){return d;})
        .attr('y', function (d) {return pScale(d) + r;})
        .attr('x', 10)
        .attr('class', 'nodeLabel');

  });
};

// Load the Google Visualization API
google.load('visualization', '1.0', {'packages':['corechart']});

// Setup callbacks or directly call graphing functions.
google.setOnLoadCallback(FileCountChart);
DiseasePlatformsChart();
