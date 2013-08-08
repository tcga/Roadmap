(function() {
  var addFileAssociations, namer, typer, types, urler;

  types = {
    9: "DiseaseStudy",
    diseaseStudy: "DiseaseStudy",
    10: "CenterType",
    11: "CenterDomain",
    12: "Platform",
    13: "DataType",
    14: "Archive",
    archive: "Archive",
    15: "File",
    file: "File"
  };

  typer = function(tokens, href) {
    var type;
    type = types[tokens.length];
    if (href.match(/^.*\.[^\/]+$/)) {
      type = types.file;
    }
    if (href.match(/\.tar\.gz($|\.md5$)/)) {
      type = types.archive;
    }
    return type;
  };

  namer = function(href) {
    var name;
    return name = (href.slice(-1)) === "/" ? href.slice(0, -1) : href;
  };

  urler = function(parentUrl, name, type) {
    var url;
    url = parentUrl + name;
    if (!(type === types.file || name.match(/\.tar\.gz($|\.md5$)/))) {
      url = url + "/";
    }
    return url;
  };

  addFileAssociations = function(doc, tokens) {
    doc.diseaseStudy = tokens[8];
    doc.centerType = tokens[9];
    doc.centerDomain = tokens[10];
    doc.platform = tokens[11];
    doc.dataType = tokens[12];
    return doc.archive = tokens[13];
  };

  module.exports = function(parentUrl, line) {
    var doc, href, name, tokens, type, url;
    tokens = parentUrl.split("/");
    href = (line.match(/href="(.*)"/))[1];
    type = typer(tokens, href);
    name = namer(href);
    url = urler(parentUrl, name, type);
    doc = {
      url: url,
      type: type,
      name: name,
      lastModified: line.slice(-10)
    };
    if (type === types.file) {
      addFileAssociations(doc, tokens);
    }
    return doc != null ? doc : {};
  };

}).call(this);

/*
//@ sourceMappingURL=docer.js.map
*/