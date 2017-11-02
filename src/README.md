This is the source for global NCI UX modules.

Directory Contents
* modules - contains one folder per UX module used to hold the associated code and styling for that module.
* `nci-global.scss` - the global NCI stylesheet used by all sites. This should always be added to a web site as `https://static.cancer.gov/nci-global/nci-global.css?site=<sitename>`
* If needed, you can add a `nci-global--<sitename>.scss` file that has the customized styles for `<sitename>`
* FUTURE: `nci-global.js` - the global NCI Javascript file for those sites not using DTM. This should always be added to a web site as `https://static.cancer.gov/nci-global/nci-global.js?site=<sitename>`
* * The JS files will be concatenated together and not module based for performance reasons.  So they should be built accordingly.
* * FUTURE: If needed, you can add a `nci-global--<sitename>.js` file that has the customized modules for `<sitename>`

NOTE: It may be better in the future that we actually deploy the sass partials to the web server, then
use `static.cancer.gov/nci-global/nci-global.css?features=A,B,C` where `_A.scss`, `_B.scss` and `_C.scss` are the partials.

For now, we can use `nci-global--sitename.scss` in order to have the site specific css and it will call in the correct partials.