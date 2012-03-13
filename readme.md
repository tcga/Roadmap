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
