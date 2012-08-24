'use strict';
/*jshint globalstrict:true browser:true*/
/*global google:false TCGA:false $:false  d3:false*/

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
      'fontSize' : '16',
      'vAxis' : {
        'logScale' : true,
        'gridlines' : { 'count' : 7 },
        'title' : '# of Files'
      },
      'hAxis' : {
        'title' : 'Month'
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

    var diseases, platforms, diseaseNodes = {}, platformNodes = {}, links = [], w, h, m, r;
    var nodeMouseover, linkMouseover, mouseout;

    response.results.bindings.forEach(function (binding) {
      var dnode, pnode, disease, platform;

      disease = binding.disease.value;
      platform = binding.platform.value;

      if (diseaseNodes[disease]) {
        dnode = diseaseNodes[disease];
      } else {
        dnode = { 'type' : 'disease', 'name' : disease };
        diseaseNodes[disease] = dnode;
      }
      if (platformNodes[platform]) {
        pnode = platformNodes[platform];
      } else {
        pnode = { 'type' : 'platform', 'name' : platform };
        platformNodes[platform] = pnode;
      }

      links.push({ disease : dnode, platform : pnode });
    });

    w = 600;
    h = 470;
    m = 20;
    r = 5;

    diseases = Object.keys(diseaseNodes);
    platforms = Object.keys(platformNodes).sort();

    diseaseNodes = diseases.map(function (disease) { return diseaseNodes[disease]; });
    platformNodes = platforms.map(function (platform) { return platformNodes[platform]; });

    var svg = d3.select("#DiseasePlatforms").append("svg")
        .attr("width", w)
        .attr("height", h);

    var dScale = d3.scale.ordinal().domain(diseases).rangePoints([m, h-m]);
    var pScale = d3.scale.ordinal().domain(platforms).rangePoints([m, h-m]);

    var linkLayer = svg.append('g');

    var linkLine = function (d) {
      var line, points = [];
      line = d3.svg.line();
      points.push([w/5, dScale(d.disease.name)]);
      points.push([3*w/5, pScale(d.platform.name)]);
      return line(points);
    };

    var linkLines = linkLayer.selectAll('link')
        .data(links)
      .enter().append('path')
        .attr('class', 'link')
        .attr('d', linkLine);

    var diseaseRow = svg.append('g')
        .attr('transform', 'translate('+ w/5 +', 0)');

    var diseaseCircles = diseaseRow.selectAll('.disease')
        .data(diseaseNodes)
      .enter().append('circle')
        .attr('class', 'disease')
        .attr('r', r)
        .attr('cy', function (d) { return dScale(d.name); });

    var diseaseLabels = diseaseRow.selectAll('.nodeLabel')
        .data(diseaseNodes)
      .enter().append('text')
        .text(function(d){return d.name;})
        .attr('y', function (d) {return dScale(d.name) + r;})
        .attr('x', -10)
        .attr('class', 'nodeLabel')
        .attr('text-anchor', 'end');

    var platformRow = svg.append('g')
        .attr('transform', 'translate('+ 3*w/5 +', 0)');

    var platformCircles = platformRow.selectAll('.platform')
        .data(platformNodes)
      .enter().append('circle')
        .attr('class', 'platform')
        .attr('r', r)
        .attr('cy', function (d) {return pScale(d.name); });

    var platformLabels = platformRow.selectAll('.nodeLabel')
        .data(platformNodes)
      .enter().append('text')
        .text(function(d){return d.name;})
        .attr('y', function (d) {return pScale(d.name) + r;})
        .attr('x', 10)
        .attr('class', 'nodeLabel');

    nodeMouseover = function (d) {
      d3.select(this).classed('active', true);
      svg.selectAll(".link").classed("active", function (p) { return p.disease === d || p.platform === d;});
    };

    linkMouseover = function (d) {
      svg.selectAll(".link").classed("active", function (p) { return p === d;});
    };

    mouseout = function (d) {
      svg.selectAll(".active").classed("active", false);
    };

    platformLabels.on('mouseover', nodeMouseover)
      .on('mouseout', mouseout);

    platformCircles.on('mouseover', nodeMouseover)
      .on('mouseout', mouseout);

    diseaseLabels.on('mouseover', nodeMouseover)
      .on('mouseout', mouseout);

    diseaseCircles.on('mouseover', nodeMouseover)
      .on('mouseout', mouseout);

    linkLines.on('mouseover', linkMouseover)
        .on('mouseout', mouseout);


  });

};

// Load the Google Visualization API
google.load('visualization', '1.0', {'packages':['corechart']});

// Setup callbacks or directly call graphing functions.
google.setOnLoadCallback(FileCountChart);
DiseasePlatformsChart();
