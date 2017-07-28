// CustomEvent polyfill for IE
;(function () {

    if ( typeof window.CustomEvent === "function" ) return false;

    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();  // END: CustomEvent

// Closest selector polyfill for IE
;(function (ElementProto) {
    if (typeof ElementProto.matches !== 'function') {
        ElementProto.matches = ElementProto.msMatchesSelector || ElementProto.mozMatchesSelector || ElementProto.webkitMatchesSelector || function matches(selector) {
                var element = this;
                var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
                var index = 0;

                while (elements[index] && elements[index] !== element) {
                    ++index;
                }

                return Boolean(elements[index]);
            };
    }

    if (typeof ElementProto.closest !== 'function') {
        ElementProto.closest = function closest(selector) {
            var element = this;

            while (element && element.nodeType === 1) {
                if (element.matches(selector)) {
                    return element;
                }

                element = element.parentNode;
            }

            return null;
        };
    }
})(window.Element.prototype); // END: Closest

// NCI Top Bar
;(function( ){
    var NCI_topBar = (function(){

        var iframe = create('iframe',{id:'returnToNCI-frame',height:0,width:'100%',scrolling:'no',style:'position:absolute;visibility:hidden'});
        var sidr = document.getElementById('sidr-0-button') || document.getElementById('sidr-main');
        //var header = sidr.closest("header") || document.getElementById("wrap");
        //TODO: also get 'header' elements that sometime appear first
        var header;
        var iframeDoc;
        var drawer;

        // create new DOM nodes
        function create(name, props) {
            var el = document.createElement(name);
            for (var p in props)
                el[p] = props[p];
            return el;
        }

        // throttle function execution - used for resize event
        function throttle(type, name, obj) {
            obj = obj || window;
            var running = false;
            var func = function() {
                if (running) { return; }
                running = true;
                requestAnimationFrame(function() {
                    obj.dispatchEvent(new CustomEvent(name));
                    running = false;
                });
            };
            obj.addEventListener(type, func);
        }

        // get the height of the drawer
        function getDrawerHeight(){
            return drawer.offsetHeight +'px'
        }

        //use a css transition to slide the body down and show the menu
        function slideBody(delay) {

            delay = typeof delay == 'undefined'? .5 : delay;
            document.body.style.transition = 'transform ' + delay + 's';

            if(document.body.className.match(/returnToNCI-frame--active/)) {
                document.body.style.transform = 'translateY('+ drawer.offsetHeight +'px)';
                document.body.className = document.body.className.replace(" returnToNCI-frame--active","");
            } else {
                var shift = parseInt(iframe.style.height) - 20 + 'px';
                document.body.className += " returnToNCI-frame--active";
                document.body.style.transform = 'translateY('+ shift + ')';
            }
        }

        // use a css transition to slide both the header and the NCI menu down
        // this is specifically for sites that have the sidr menu which manipulates body styles
        function slideHeader(delay) {
            var offset = drawer.offsetHeight + 'px';

            delay = typeof delay == 'undefined'? .5 : delay;
            iframe.style.transition = 'transform ' + delay + 's';

            if(document.body.className.match(/returnToNCI-frame--active/)) {
                header.style.marginTop = drawer.offsetHeight + 10 + 'px';
// 				iframe.style.bottom = offset;
                iframe.style.transform = 'translateY(' + offset + ')';
                document.body.className = document.body.className.replace(" returnToNCI-frame--active","");

            } else {
                offset = parseInt(iframe.style.height) - 20 + 'px';
                header.style.marginTop = parseInt(iframe.style.height) - 10 + 'px';
// 				iframe.style.bottom = offset;
                iframe.style.transform = 'translateY(' + offset + ')';
                document.body.className += " returnToNCI-frame--active";
            }
        }

        //resize the iframe to fit the content within it
        function resizeIframe(delay) {
            delay = typeof delay == 'undefined'? .5 : delay;
            // getting height based on first child for consistency between browsers
            // body.offsetHeight in FF != body.offsetHeight in Chrome
            iframe.style.height = iframeDoc.body.firstChild.offsetHeight + 20 + 'px'; // +20 is to make room for the chevron

            //remove active styles - needed on resize event
            document.body.className = document.body.className.replace(" returnToNCI-frame--active","");
            drawer.className = "";

            // if there is a sidr menu then target the header element, otherwise use body
            if(sidr){
                console.log('sidr present');
                header.style.marginTop = drawer.offsetHeight + 10 + 'px';
                header.style.transition = 'margin-top .5s';

                var offset = drawer.offsetHeight +'px';
// 				iframe.style.bottom = offset;
// 				iframe.style.transition = 'bottom .5s';
                iframe.style.transition = 'transform ' + delay + 's';
                iframe.style.transform = 'translateY(' + offset + ')';

            } else {
                document.body.style.transition = 'transform ' + delay + 's';
                document.body.style.transform = 'translateY('+ drawer.offsetHeight +'px)';

            }
        }

        // catch click events on NCI bar
        function toggleMenu(e){
            // only capture events outside the "National Cancer Institute" link
            if(!/returnToNCI-link--home/.test(e.target.id)) {
                e.preventDefault();
                e.stopPropagation();

                var returnToNCI_link = drawer.querySelector('#returnToNCI-link--home');

                // close the drawer
                if(/active/.test(drawer.className)) {
                    drawer.className = "";
                    returnToNCI_link.href = returnToNCI_link.href.replace('open','closed');
                } else {
                    // open the drawer
                    drawer.className = "active";
                    returnToNCI_link.href = returnToNCI_link.href.replace('closed','open');
                }

                // if there is a sidr menu then slide the header instead of the body
                sidr?slideHeader():slideBody();
            }
        }

        function appendDomain(links){
            for (var i = 0; i < links.length; i++) {
                links[i].href = links[i].href + document.domain;
            }
        }

        function fetchCSS(){
            //check if returnToNCI-bar--parent.css has been included, if not then download it
            if(document.querySelectorAll('link[href*="returnToNCI-bar"')[0]){
                init();
            } else {
                // production path
                var topBarStyles = create('link',{rel:'stylesheet',href:'//static.cancer.gov/returnToNCI-bar/returnToNCI-bar--parent.css'});

                // testing load failure
                // var topBarStyles = create('link',{rel:'stylesheet',href:'//www-red-dev.cancer.gov/fail.css'});

                //dev path
                // var topBarStyles = create('link',{rel:'stylesheet',href:'//www-red-dev.cancer.gov/PublishedContent/Styles/returnToNCI-bar--parent.css',onload:init()});

                // inject style sheet
                document.getElementsByTagName('head')[0].appendChild(topBarStyles);

            }


        }

        // initialize the NCI Top Bar iFrame
        function init() {
            var meta = create('meta',{httpEquiv:"X-UA-Compatible",content:"IE=edge"});
            //'<head><link rel="stylesheet" href="//fonts.googleapis.com/css?family=Noto+Sans" /><link rel="stylesheet" href="//static.cancer.gov/returnToNCI-bar/returnToNCI-bar--child.css" /></head>' +
            var content = '<head><link rel="stylesheet" href="//fonts.googleapis.com/css?family=Noto+Sans" /><link rel="stylesheet" href="//static.cancer.gov/returnToNCI-bar/returnToNCI-bar--child.css" /></head>' +
                '<body><nav id="returnToNCI-nav" style="display:none"><div id="returnToNCI-menu"><ul>'+
                '<li><a target="_parent" href="https://www.cancer.gov/about-cancer?cid=cgovnav_aboutcancer_">About Cancer</a></li>' +
                '<li><a target="_parent" href="https://www.cancer.gov/types?cid=cgov_cancertypes_">Cancer Types</a></li>' +
                '<li><a target="_parent" href="https://www.cancer.gov/research?cid=cgov_research_">Research</a></li>' +
                '<li><a target="_parent" href="https://www.cancer.gov/grants-training?cid=cgov_grantstraining_">Grants &amp; Training</a></li>' +
                '<li><a target="_parent" href="https://www.cancer.gov/news-events?cid=cgov_newsandevents_">News &amp; Events</a></li>' +
                '<li><a target="_parent" href="https://www.cancer.gov/about-nci?cid=cgov_aboutnci_">About NCI</a></li>' +
                '</ul></div><div id="returnToNCI-drawer"><a target="_parent" id="returnToNCI-link--home" href="https://www.cancer.gov?cid=cgovnav_hp_closed_">National Cancer Institute - Cancer.gov</a><a class="chevron" href="#"></a></div></nav>' +
                '</body>';

            // inject meta tag to force compatibility mode to edge in IE
            // this only seems to work if meta is unset. Has no effect when trying to change an existing content attribute.
            if(document.querySelector('meta[http-equiv=X-UA-Compatible]')){
                document.querySelector('meta[http-equiv=X-UA-Compatible]').content = 'IE=edge';
            } else {
                document.getElementsByTagName('head')[0].appendChild(meta);
            }

            // check that css has been loaded before resizing iFrame
            var isCssLoaded = function(){
                if(window.getComputedStyle(iframeDoc.getElementById('returnToNCI-nav')).display!='block'){
                    setTimeout(isCssLoaded,100);
                } else {
                    resizeIframe(0);
                }
            };

            // render the iframe
            var renderIframe = function(){

                document.body.insertBefore(iframe,document.body.firstChild);

                // set shortcut variable
                iframeDoc = iframe.contentWindow.document;

                //inject top bar markup
                iframeDoc.open();
                iframeDoc.write(content);
                iframeDoc.close();

                // set shortcut variable
                drawer = iframeDoc.getElementById("returnToNCI-drawer");
                header = sidr?document.body.querySelector('div:not(.skip-link):not(#skip-link),header'):null;

                iframe.onload = isCssLoaded();


                // hook up click events
                var drawerLinks = iframeDoc.querySelectorAll('#returnToNCI-drawer, #returnToNCI-drawer .chevron');
                for(var i = 0; i < drawerLinks.length; i++) {
                    drawerLinks[i].addEventListener('click', toggleMenu);
                }

                // throttle resize event with a custom event listener
                throttle("resize", "optimizedResize");

                // add resize event to window
                window.addEventListener("optimizedResize", resizeIframe);

                // fix center aligned pages
                if (window.getComputedStyle(iframe.nextElementSibling).float == 'left' || window.getComputedStyle(iframe.nextElementSibling).cssFloat == 'left'){
                    iframe.nextElementSibling.style.float = 'none';
                    iframe.nextElementSibling.style.display = 'inline-block';
                }

                // add domain to links for analytics
                appendDomain(iframeDoc.querySelectorAll('a:not(.chevron)'));
            };

            // inject iframe - doing this on a timeout so that it will be loaded as soon as possible
            var injectIframe = function(){
                if(document.contains(document.body)){
                    renderIframe();
                } else {
                    setTimeout(injectIframe,50);
                }
            };

            injectIframe();

            //TODO: max-width and center aligned pages visualsonline.cancer.gov
        }

        // return public methods and variables
        return {
            init: init,
            fetchCSS: fetchCSS
        };

    })(); // END: NCI top bar module


    // Initialize the NCI top bar
    NCI_topBar.fetchCSS();


})( );