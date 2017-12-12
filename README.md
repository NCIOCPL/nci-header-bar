# NCI DOC Site Modules
The purpose of this project is to inject modules into DOC sites through Adobe DTM (Dynamic Tag Manager) without requiring code changes by site owners

## Setup
1. Clone this repo to your local machine
2. From terminal, in the directory where you cloned this repo, run `npm install`

## Proxy a site for development work
From terminal run `grunt build-watch --proxyhost={{sitename}}`
Check the [global-config.json](https://github.com/NCIOCPL/nci-header-bar/blob/release-1.0/global-config.json) to see which DOC sites are currently supported

TODO:
* When running proxy, need to be able to handle internal and external redirects
* implement `nci-global.js` which may contain polyfills or other scripts needed by _all_ DOC sites

## Proxy a site for integration testing
This method of proxying does not use the source code, but can use a DTM property for testing.  This can be used to test out a property before sending it to a sites development team.  This can also be used to test new versions of the code before rolling out to existing sites.
1. Open a terminal (Command Line, Git Bash, actual Bash)
2. Run grunt dtm-proxy --dtm-property-id=<PROPERTY_ID> --proxyhost=<HOSTNAME>
Where <PROPERTY_ID> is found by going to a DTM property, selecting Embed, viewing the staging Header Code and pulling out the PROPERTY_ID from the src http://assets.adobedtm.com/<COMPANY_ID>/satelliteLib-<PROPERTY_ID>-staging.js.
<HOSTNAME> is something like www.cancer.gov
