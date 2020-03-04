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
This method of proxying does not use the source code, but can use a DTM property for testing.  This can be used to test out a property before sending it to a site's development team.  This can also be used to test new versions of the code before rolling out to existing sites.
1. Open a terminal (Command Line, Git Bash, actual Bash)
2. Run `grunt dtm-proxy --dtm-property-id=<PROPERTY_ID> --proxyhost=<HOSTNAME>`.  Optionally if you need to strip out the WA_SITENAME_Pageload analytics tag, use `grunt dtm-proxy --dtm-property-id=<PROPERTY_ID> --proxyhost=<HOSTNAME> --remove-analytics`
   * Where <PROPERTY_ID> is found by going to a DTM property, selecting Embed, viewing the staging Header Code and pulling out the PROPERTY_ID from the src http://assets.adobedtm.com/<COMPANY_ID>/satelliteLib-<PROPERTY_ID>-staging.js.
   * Where &lt;HOSTNAME&gt; is something like www.cancer.gov

NOTE:
A rule in DTM specifying a hostname will never fire when proxying.  Replace the hostname with `localhost` during testing until the embed code has been setup and testing can be performed directly using the STAGE library.

## Instructions for Version 2 including Adobe Launch
* Source files are located in /src/modules/returnToNCI
* all files for v2 have v2 in the file name, returnToNCI-bar-v2-cgov.js is the main file. Others have been created as needed. Currently one. for R4R and another one, layered-over-site, being used on Visuals Online for styling reasons
* To do a build, grunt build:prod. This will create minified versions of the files in the dist folder
* The files are then put into Adobe Launch, launch.adobe.com, for deployment to the sites
* Sites have their own Properties in Launch and the minified code for this is put into a Rule in the property. See the property OCPL Pubs Locator -> Rules -> CancerGov LinkbackJS - v2 for an example
* Once a rule is created/modified, it needs to be pubished.
* Click the Add New Library button
* Give the rule a name, set environment to Development
* Click the Add All Changed Resources item
* Hit Save and publish to developmeent
* Use the Adobe Experience Cloud Debugger extension in Chrome
* you can grab the development environment in Launch by clicking the Environments tab and hitting the icon on the Development line, copy the code and you can paste it in the tools tab of the Debugger extension.
* This will allow you to see your rules in Development
* Once approved, complete the publishing process to Stage and then Production

 
