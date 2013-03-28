var request = require("request");

var url = process.env.SPARQLURL.slice(0,-7) + "/eval";

var stepSize = 1000;

function runScript (script, callback) {
    request.post({
        url : url,
        body : script,
        headers : {
            "Content-type" : "text/javascript"
        }
    }, callback);
}

function deleteScript (offset) {
    return '' +
        'var lastSeen, subject, subjects, triples;\n' +
        'lastSeen = "<http://purl.org/tcga/core#lastSeen>";\n' +
        'subjects = store.runSparql("select distinct ?s where { ?s ?p ?o . } limit '+stepSize+' offset '+offset+'");\n' +
        'subjects.forEach(function (sub) {\n' +
        '    subject = sub[0];\n' +
        '    triples = store.getTriplesArray(subject, lastSeen);\n' +
        '    triples.sort();\n' +
        '    triples.slice(0,-1).forEach( function (triple) {\n' +
        '        store.deleteTriples(triple.subject, triple.predicate, triple.object);\n' +
        '    });\n' +
        '});\n';
}

var subjects =  'subjects = store.runSparql("select distinct ?s where { ?s ?p ?o . } limit 1000000");' +
                'subjects.count()';

runScript(subjects, function (e, r, b) {
    var numSubjects = 0, numOk = 0;
    function deleteAStep (offset) {
        runScript(deleteScript(offset), function (e, r, b) {
            if (e) console.log("Error deleting at offset", offset, ":", e);
            else if (numOk < numSubjects) {
                numOk += stepSize;
                console.log("Processed", numOk, "of", numSubjects,".");
                deleteAStep(numOk);
            }
        });
    }
    if (e) return console.log("Error getting subjects: ", e);
    else {
        numSubjects = parseInt(b, 10);
        deleteAStep(0);
    }
});
