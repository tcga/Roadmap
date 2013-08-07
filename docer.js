(function() {
  var types;

  types = {
    10: "DiseaseStudy",
    diseaseStudy: "DiseaseStudy",
    11: "CenterType",
    12: "CenterDomain",
    13: "Platform",
    14: "DataType",
    15: "Archive",
    archive: "Archive",
    16: "File",
    file: "File"
  };

  module.exports = function(url, line) {
    var doc, name, tokens, type;
    tokens = url.split("/");
    type = (url.slice(-1)) === "/" ? types[tokens.length] : types.file;
    name = type !== types.file ? tokens[tokens.length - 2] : tokens[tokens.length - 1];
    doc = {
      url: url,
      type: type,
      name: name,
      lastModified: line.slice(-10)
    };
    if (type === types.file) {
      doc.diseaseStudy = tokens[8];
      doc.centerType = tokens[9];
      doc.centerDomain = tokens[10];
      doc.platform = tokens[11];
      doc.dataType = tokens[12];
      doc.archive = tokens[13];
    }
    return doc;
  };

}).call(this);
