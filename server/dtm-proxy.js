#!/usr/bin/env node
const debug = require('debug')('expressapp');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const winston = require('winston');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs  = require('express-handlebars');
const proxy = require('http-proxy-middleware');
const querystring = require('querystring');
const globalConfig = require('../global-config.json');

const zlib = require('zlib');

var app = express();

//This should be something like www.cancer.gov, dctd.cancer.gov, etc.
var proxyEnv = process.env.PROXY_ENV;
var useHttps = process.env.PROXY_HTTPS === 'true';

//The property and company IDs for DTM
var dtm_property_id = process.env.DTM_PROPERTY_ID;
var dtm_company_id = process.env.DTM_COMPANY_ID;

var dtm_script_tag = `//assets.adobedtm.com/${dtm_company_id}/satelliteLib-${dtm_property_id}-staging.js`;
const dtmFooter = '<script type="text/javascript">_satellite.pageBottom();</script>';

const dtmRegEx = /src=\"(\/\/assets.adobedtm.com\/[abcdef0123456789]+\/satelliteLib-[abcdef0123456789]+(-staging)?\.js)\"/i;
const contentTypeRegEx = /.*text\/html.*/i;
const headTagRegEx = /^.*<head[^>]*>/im;
//The HTML spec, https://www.w3.org/TR/html5/syntax.html#end-tags, says that body cose must match the following
//...we will see if that is the case
const bodyCloseTagRegEx = /<\/body\s*>/i;

//Analytics removal
var removeAnalytics = process.env.REMOVE_ANALYTICS === 'true';
const waScriptRegEx = /(<script type="text\/javascript" src="(https:)?\/\/static.cancer.gov\/webanalytics\/WA_(.*)_PageLoad.js[^"]*"><\/script>)/i;


//We will use handlebars to deal with certain types of templating
//mainly error pages.  THIS SHOULD NOT BE USED FOR WEBSITE CONTENT!!!
//Node is not used for hosting web pages, and as such is not available
//to do templating.  If you need handlebars on the website, then you
//can use the client side version
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    layoutsDir: 'server/views/layouts/',
    partialsDir: ['server/views/partials/']
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// Don't know hwat these next 4 app.use statements are for...
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());

/** Proxy expects http requests to specify a bare host name; however to request from an https site,
 * it requires the URL to begin with https://
 */
var scheme = '';
if(useHttps)
    scheme = 'https://';

//NOTE: This only proxies an external site, so it will never serve up static content.
//this is different than the development server.js

/** Proxy Content that is not found on the server to www-blue-dev.cancer.gov **/
app.use(
    '*', //Match any paths
    //Setup the proxy to replace
    proxy({
        target: scheme + proxyEnv,
        changeOrigin: true,
        onProxyRes: function(proxyRes, req, res) {

            if (proxyRes.statusCode == 302 || proxyRes.statusCode == 301) {
                console.log("Got a redirect in GET");
                //TODO: check protocol for internal redirect
                //TODO: response for external redirects
                //TODO: Figure out how to read the response and rewrite the location!
                //proxyRes.headers['location'] = "/" + siteConfig.startPage;
            } else {

                //https://github.com/chimurai/http-proxy-middleware/issues/97
                if (
                    proxyRes.headers &&
                    proxyRes.headers['content-type'] &&
                    proxyRes.headers['content-type'].match('text/html')
                ) {
                    winston.info(`Rewriting Proxy Response -- tis HTML ${req.path}`);

                    const end = res.end;
                    const writeHead = res.writeHead;
                    const write = res.write;

                    let writeHeadArgs;
                    let body;
                    let buffer = new Buffer('');

                    // Concat and unzip proxy response
                    proxyRes
                        .on('data', (chunk) => {
                            buffer = Buffer.concat([buffer, chunk]);
                        })
                        .on('end', () => {
                            //Should probably account for deflate...
                            if (proxyRes.headers && proxyRes.headers['content-encoding'] == 'gzip') {
                                body = zlib.gunzipSync(buffer).toString('utf8');
                            } else {
                                body = buffer.toString('utf8');
                            }
                        });

                    // Defer write and writeHead
                    res.write = () => {
                    };
                    res.writeHead = (...args) => {
                        writeHeadArgs = args;
                    };

                    // Update user response at the end
                    res.end = () => {
                        const output = injectDTM(body); // some function to manipulate body

                        res.setHeader('content-length', output.length);
                        res.removeHeader('content-encoding');
                        writeHead.apply(res, writeHeadArgs);

                        write.apply(res, [output]);

                        end.apply(res, [""]);
                    };
                }
            }
        }
    })
);


/************************************************************
 * Error Handlers
 ************************************************************/
// catch unmapped items make a 404 error
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//Development error handler will show stack traces
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});

/************************************************
 * Start listening on a port
 ************************************************/
app.set('port', process.env.PORT || 3000);
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // ignore certicate verification (i.e. Allow self-signed certs)

var server = app.listen(app.get('port'), function() {
    console.log('proxying "' + proxyEnv + '" at "localhost:' + server.address().port + '".');
});


/**
 * Function to inject the Return to NCI code into the head and body?
 *
 * @param {any} body
 * @returns
 */
function injectDTM(body) {    
    let modified = body;

    var existingDTMMatches = modified.match(dtmRegEx);

    if (existingDTMMatches) {
        winston.info(`Site Has Existing DTM -- ${existingDTMMatches[1]}`);
        modified = modified.replace(dtmRegEx, `src="${dtm_script_tag}"`);
    } else {
        winston.info(`Site Has No DTM`);

        //find the opening head tag
        let headTagMatch = modified.match(headTagRegEx);
        if (headTagMatch) {
            winston.info(`Found Head Tag`);
            //console.log(headTagMatch);
            //what is length of match
            //what is start position of match
            //insert our tag at the start.
            //TODO: Add some guards here for the length and stuff...
            let headMatchLength = headTagMatch[0].length;
            let headPreceedingText = modified.substring(0, headTagMatch.index + headMatchLength);
            let headFollowingText = modified.substring(headTagMatch.index + headMatchLength, modified.length);


            modified = `${headPreceedingText}<script src="${dtm_script_tag}"></script>${headFollowingText}`;

            //Match the </body>.
            let bodyMatch = modified.match(bodyCloseTagRegEx);
            if (bodyMatch) {
                winston.info(`Found Closing Body Tag`);

                let bodyMatchLength = bodyMatch[0].length;
                let bodyPreceedingText = modified.substring(0, bodyMatch.index);
                let bodyFollowingText = modified.substring(bodyMatch.index, modified.length);

                //Inject closing script for DTM
                modified = `${bodyPreceedingText}${dtmFooter}${bodyFollowingText}`;
                    
            } else {
                winston.error(`!!!NO CLOSE BODY TAG!!!`);
                throw new Error("No Head Tag Found");                    
            }

        } else {
            winston.error(`!!!NO HEAD TAG!!!`);
            throw new Error("No Head Tag Found");
        }

    }

    //Strip out analytics?
    if (removeAnalytics) {
        let waMatch = modified.match(waScriptRegEx);

        if (waMatch) {
            winston.info("Removing Web Analytics");
            let waMatchLength = waMatch[0].length;
            let waPreceedingText = modified.substring(0, waMatch.index);
            let waFollowingText = modified.substring(waMatch.index + waMatchLength, modified.length);
            modified = waPreceedingText + waFollowingText;
        } else {
            winston.warn("There is no analytics tag to remove")
        }
    }

    return modified;
}
