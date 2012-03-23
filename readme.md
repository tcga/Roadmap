#TCGApps

Currently this is a catchall for infant TCGA Apps, designed to be compatible with the TCGA Toolbox Chrome app.

#Using SPARQL to query the TCGA structure

1. Within the TCGA Toolbox App, load the following module by URL: ``https://raw.github.com/drobbins/TCGApps/master/tcgapp.js``
2. In the console, run ``TCGA.Scraper.scrape()``. This will take 2-5min depending on your connection.
3. Use ``TCGA.Scraper.store.execute(...)`` to run SPARQL queries, where the following relationships are available:
    * ``tcga:<uuid> tcga:parent tcga:<uuid>`` (points from a child directory to its parent)
    * ``tcga:<uuid> tcga:type tcga:<type>`` (where type is one of the types below)
    * ``tcga:<uuid> tcga:ftp-name <literal name>`` (the literal name of the object)
    * ``tcga:<uuid> tcga:url <literal url>`` (the literal url of the object)
    * See ``sample_query.sparql`` for a query discovering all data-types associated with MDAnderson

## Data Types

* tcga:disease-study
* tcga:center-type
* tcga:center-domain
* tcga:platform
* tcga:data-type
* tcga:archive
* tcga:file

Data Types correspond to the directory structure:

``../disease-study/center-type/center-domain/platform/data-type/archive/file``

e.g.

``.../gbm/cgcc/mdanderson.org/mda_rppa_core/protein_exp/mdanderson.org_GBM.MDA_RPPA_Core.Level_2.1.0.0/mdanderson.org_GBM.MDA_RPPA_Core.SuperCurve.Level_2.00da2077-778c-418a-9c92-01febd970ed8.txt``

#License
Copyright (C) 2012 David E. Robbins

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
