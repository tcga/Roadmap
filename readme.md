# TCGA Scraper

Scraper indexes the files listed in the [TCGA's open access HTTP site](tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/) as RDF.

## Schema

The Schema used to represent resources in the TCGA is available as a [Turtle File](http://purl.org/tcga/core).

As used below, the prefix ``tcga`` represents ``http://purl.org/tcga/core``, while ``tcgaRoot`` represents ``https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/``.

[Class](https://docs.google.com/open?id=0Bzu4cytkv4B8Y1VMVXNOMFhvaGM) and [Instance](https://docs.google.com/open?id=0Bzu4cytkv4B8V3lsc0VzQWE2c28) diagrams of the schema are also available.

### Types

See the [TCGA Data Primer](https://wiki.nci.nih.gov/display/TCGA/TCGA+Data+Primer) and [Code Tables](https://tcga-data.nci.nih.gov/datareports/codeTablesReport.htm?codeTable=center) for details on these types.

* ``tcga:DiseaseStudy``
* ``tcga:CenterType``
* ``tcga:CenterDomain``
* ``tcga:Platform``
* ``tcga:DataType``
* ``tcga:Archive``
* ``tcga:File``

Data Types correspond to the directory structure:

``tcgaRoot:DiseaseStudy/CenterType/CenterDomain/Platform/DataType/Archive/File``

e.g.

``tcgaRoot:gbm/cgcc/mdanderson.org/mda_rppa_core/protein_exp/mdanderson.org_GBM.MDA_RPPA_Core.Level_2.1.0.0/mdanderson.org_GBM.MDA_RPPA_Core.SuperCurve.Level_2.00da2077-778c-418a-9c92-01febd970ed8.txt``

### Properties

Entities of all types may have the following properties.

* ``rdfs:label``
* ``rdf:type``
* ``tcga:url``
* ``tcga:lastModified``
* ``tcga:firstSeen``
* ``tcga:lastSeen``

### Properties Exclusive to ``tcga:file`` Resources

Only entities of type ``tcga:file`` have the following properties.

* ``tcga:diseaseStudy``
* ``tcga:centerType``
* ``tcga:centerDomain``
* ``tcga:platform``
* ``tcga:dataType``
* ``tcga:archive``

## Installation

0. Install NodeJS and NPM.
1. Clone this repository.
2. Set the ROOT_URL and SPARQLURL environment variables.
3. ``node scraper.js``.

#License
Copyright (C) 2012 David E. Robbins

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
