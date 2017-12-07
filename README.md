# NCI DOC Site Modules
The purpose of this project is to inject modules into DOC sites through Adobe DTM (Dynamic Tag Manager) without requiring code changes by site owners

## Setup
1. Clone this repo to your local machine
2. From terminal, in the directory where you cloned this repo, run `npm install`

## Proxy a site
From terminal run `grunt build-watch --proxyhost={{sitename}}`
Check the [global-config.json](https://github.com/NCIOCPL/nci-header-bar/blob/release-1.0/global-config.json) to see which DOC sites are currently supported

TODO:
* When running proxy, need to be able to handle internal and external redirects
* implement `nci-global.js` which may contain polyfills or other scripts needed by _all_ DOC sites