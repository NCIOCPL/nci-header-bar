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

// document.contains polyfill for stupid IE
document.contains = Element.prototype.contains = function contains(node) {
    if (!(0 in arguments)) {
        throw new TypeError('1 argument is required');
    }
    do {
        if (this === node) {
            return true;
        }
    } while (node = node && node.parentNode);

    return false;
};

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

// recursive object merge
var merge = function() {
    var obj = {},
        i = 0,
        il = arguments.length,
        key;
    for (; i < il; i++) {
        for (key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key)) {
                obj[key] = arguments[i][key];
            }
        }
    }
    return obj;
};

// NCI Top Bar
;(function( ){
    var NCI_topBar = (function(){

        var iframe = create('iframe',{id:'returnToNCI-frame',title:'Links to cancer.gov',width:'100%',scrolling:'no',style:'position:absolute;visibility:hidden'});

        var bodyStyle, bodyClass, header, iframeDoc, drawer, nav, noTransform, isFixed, skipNavEl, settings;

        // This is an example of settings that will be set through DTM
        // window.Linkback = {
        //     hasModalPopup: true,
        //     hasSIDR: false,
        //     hasFixedHeader: false
        // };

        var defaults = {
            hasModalPopup: false,
            hasSIDR: false,
            hasFixedHeader: false, //depricated in favor of hasFixedElements
            hasFixedElements: false,
            uxWindow: false,
            returnToNci_cssPath: '//static.cancer.gov/nci-globals/modules/returnToNCI/returnToNCI-bar-v1.0.0.min.css'
            // local CSS path for dev testing: returnToNci_cssPath: '/modules/returnToNCI/returnToNCI-bar.css'
        };

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

        //  take a DOM node and returns an index
        function getNodeIndex( elm ){
            var c = elm.parentNode.children, i = 0;
            for(; i < c.length; i++ )
                if( c[i] == elm ) return i;
        }

        //use a css transition to slide the body down and show the menu
        function slideBody(delay) {

            delay = typeof delay == 'undefined'? .5 : delay;
            bodyStyle.transition = 'transform ' + delay + 's';

            if(bodyClass.match(/returnToNCI-frame--active/)) {
                bodyStyle.transform = 'translateY('+ drawer.offsetHeight +'px)';
                bodyClass = bodyClass.replace(" returnToNCI-frame--active","");
            } else {
                var shift = parseInt(nav.offsetHeight) + 'px';
                bodyClass += " returnToNCI-frame--active";
                bodyStyle.transform = 'translateY('+ shift + ')';
            }
        }

        // use a css transition to slide both the header and the NCI menu down
        // this is specifically for sites that have the sidr menu which manipulates body styles
        function slideHeader(delay) {
            var offset = drawer.offsetHeight + 'px';

            delay = typeof delay == 'undefined'? .5 : delay;
            iframe.style.transition = 'transform ' + delay + 's';

            //TODO: bodyClass is just a variable. It's not updating class attributes

            if(bodyClass.match(/returnToNCI-frame--active/)) {
                // header.style.marginTop = drawer.offsetHeight + 10 + 'px';
                // iframe.style.bottom = offset;
                iframe.style.transform = 'translateY(' + offset + ')';
                bodyClass = bodyClass.replace(" returnToNCI-frame--active","");

            } else {
                offset = parseInt(nav.offsetHeight) + 'px';
                // header.style.marginTop = parseInt(drawer.style.height) - 10 + 'px';
                // iframe.style.bottom = offset;
                iframe.style.transform = 'translateY(' + offset + ')';
                bodyClass += " returnToNCI-frame--active";
            }
        }

        //resize the iframe to fit the content within it
        function resizeIframe(delay) {
            delay = typeof delay == 'undefined'? .5 : delay;
            // getting height based on first child for consistency between browsers
            // body.offsetHeight in FF != body.offsetHeight in Chrome
            // iframe.style.height = iframeDoc.body.firstChild.offsetHeight + 20 + 'px'; // +20 is to make room for the chevron

            //remove active styles - needed on resize event
            bodyClass = bodyClass.replace(" returnToNCI-frame--active","");
            drawer.className = "";

            // if there is a sidr menu then target the header element, otherwise use body
            if(noTransform){
                //console.log('sidr present');
                // header.style.marginTop = drawer.offsetHeight + 10 + 'px';
                //header.style.transition = 'margin-top .5s';

                var offset = drawer.offsetHeight +'px';
				// iframe.style.bottom = offset;
				// iframe.style.transition = 'bottom .5s';
                iframe.style.transition = 'transform ' + delay + 's';
                iframe.style.transform = 'translateY(' + offset + ')';

            } else {
                bodyStyle.transition = 'transform ' + delay + 's';
                bodyStyle.transform = 'translateY('+ drawer.offsetHeight +'px)';

            }
        }

        // catch click events on NCI bar
        function toggleMenu(e){
            // only capture events outside the "National Cancer Institute" link
            if(!/returnToNCI-link--home/.test(e.target.id)) {
                e.preventDefault();
                e.stopPropagation();

                var returnToNCI_link = drawer.querySelector('#returnToNCI-link--home');
                var chevron = returnToNCI_link.nextSibling;

                // close the drawer
                if(/active/.test(drawer.className)) {
                    drawer.className = "";
                    returnToNCI_link.href = returnToNCI_link.href.replace('open','closed');
                    chevron.setAttribute('aria-label','Open Drawer');
                    toggleTabIndex(navLinks, false)
                } else {
                    // open the drawer
                    drawer.className = "active";
                    chevron.setAttribute('aria-label','Close Drawer');
                    returnToNCI_link.href = returnToNCI_link.href.replace('closed','open');
                    toggleTabIndex(navLinks, true)
                }

                // if there is a sidr menu then slide the header instead of the body
                noTransform?slideHeader():slideBody();
            }
        }

        function appendDomain(links){
            for (var i = 0; i < links.length; i++) {
                links[i].href = links[i].href + document.domain;
            }
        }

        function toggleTabIndex(nodeList, isActive) {
            Array.prototype.forEach.call(nodeList, function(link) {
                if (isActive) {
                    link.tabIndex = 0;
                } else {
                    link.tabIndex = -1;
                }
            }) 
        };

        function createBar() {
            // PROD styles
            var barStyles = '<link rel="stylesheet" href="'+ settings.returnToNci_cssPath +'" />';
            // DEV styles
            // var barStyles = '<link rel="stylesheet" href="/modules/returnToNCI/returnToNCI-bar.css" />';

            var linktarget = settings.uxWindow === false ? '_parent' : settings.uxWindow;
            
            var content = '<head><link rel="stylesheet" href="//fonts.googleapis.com/css?family=Noto+Sans" />'+ barStyles +'</head>' +
                '<body><nav id="returnToNCI-nav" style="display:none"><div id="returnToNCI-menu"><ul>'+
                '<li><a target="' + linktarget + '" href="https://www.cancer.gov/about-cancer?cid=cgovnav_aboutcancer_" tabindex="-1">About Cancer</a></li>' +
                '<li><a target="' + linktarget + '" href="https://www.cancer.gov/types?cid=cgov_cancertypes_" tabindex="-1">Cancer Types</a></li>' +
                '<li><a target="' + linktarget + '" href="https://www.cancer.gov/research?cid=cgov_research_" tabindex="-1">Research</a></li>' +
                '<li><a target="' + linktarget + '" href="https://www.cancer.gov/grants-training?cid=cgov_grantstraining_" tabindex="-1">Grants &amp; Training</a></li>' +
                '<li><a target="' + linktarget + '" href="https://www.cancer.gov/news-events?cid=cgov_newsandevents_" tabindex="-1">News &amp; Events</a></li>' +
                '<li><a target="' + linktarget + '" href="https://www.cancer.gov/about-nci?cid=cgov_aboutnci_" tabindex="-1">About NCI</a></li>' +
                '</ul></div><div id="returnToNCI-drawer"><a target="' + linktarget + '" tabindex="1" id="returnToNCI-link--home" href="https://www.cancer.gov?cid=cgovnav_hp_closed_">National Cancer Institute - Cancer.gov</a><a class="chevron" href="#" aria-label="Open Drawer" tabindex="2"></a></div></nav>' +
                '</body>';

            // inject meta tag to force compatibility mode to edge in IE
            // this only seems to work if meta is unset. Has no effect when trying to change an existing content attribute.
            // var metas = document.getElementsByTagName('meta');
            //
            // var metaContent;
            //
            // for (var i=0; i<metas.length; i++) {
            //     if (metas[i].getAttribute("http-equiv") == "X-UA-Compatible") {
            //         metaContent = metas[i].getAttribute("content");
            //     }
            // }
            //
            // if(metaContent){
            //     metaContent.content = 'IE=edge';
            // } else {
            //     metaContent = create('meta',{httpEquiv:"X-UA-Compatible",content:"IE=edge"});
            //     document.getElementsByTagName('head')[0].appendChild(metaContent);
            // }

            return content;



        }


        // initialize the NCI Top Bar iFrame
        function init() {

            var checkTransform = function(){
                // sidr applies transforms to the <body> element
                // fancybox uses fixed elements for the lightbox feature.
                // fixed elements of a transformed parent become relative to the parent instead of the viewport
                //var sitename = document.querySelectorAll('script[src*=sitename]')[0].src.split("sitename=")[1];
                return !!(document.getElementById('sidr-close') || document.head.innerHTML.match(/sidr/g) !== null) || settings.hasModalPopup || settings.hasSIDR || settings.hasFixedHeader || settings.hasFixedElements
            };

            var checkFixed = function(){
                return window.getComputedStyle(document.getElementById('returnToNCI-frame'),null).getPropertyValue("position") == 'fixed'

            };


            var checkSkipNav = function(){
                // collection of known skip nav elements. Look at them all!
                var skipNavs = [
                    "#skip",
                    ".skip",
                    ".skip-link",
                    "#skip-link",
                    ".skip2home",
                    ".skipToContent",
                    ".skipToContentLink",
                    ".skipNavigation",
                    "#skipNav",
                    ".skip_nav",
                    ".hiddenStructure",
                    "#maincontent",
                    ".genSiteSkipToContent",
                    ".hideLink",
                    "[href='#Content']"
                ];
                //check if any of the skip links are the first child of body - if not then move it before inserting the iframe
                // var firstChild = document.querySelectorAll("body > :first-child");

                //console.log("searching for skip nav");
                for (var i = 0, len = skipNavs.length; i < len; i++) {

                    skipNavEl = document.querySelectorAll(skipNavs[i])[0];

                    if(skipNavEl) {
                        //console.log("skip nav found!");
                        break;
                    }
                }


                if(skipNavEl) {
                    // index of 0 indicates skipNavEl is the first child element of it's parent
                    if (skipNavEl.parentNode.tagName !== 'BODY' || getNodeIndex(skipNavEl) !== 0) {
                        // console.log("skip nav is not the first child element");
                        // move the skip nav
                        document.body.insertBefore(skipNavEl,document.body.firstChild);
                    }
                    //else {
                        //console.log("skip nav is positioned properly");
                    //}
                }
            };




            // render the iframe
            var renderIframe = function(){

                // inject iFrame after skip nav if it's present
                if(skipNavEl) {
                    document.body.insertBefore(iframe,skipNavEl.nextSibling);
                } else {
                    document.body.insertBefore(iframe,document.body.firstChild);
                }

                // set shortcut variable
                iframeDoc = iframe.contentWindow.document;
                var content = createBar();


                //inject top bar markup
                iframeDoc.open();
                iframeDoc.write(content);
                iframeDoc.close();

                
                // set shortcut variable
                drawer = iframeDoc.getElementById("returnToNCI-drawer");
                nav = iframeDoc.getElementById("returnToNCI-nav");
                navLinks = iframeDoc.getElementById("returnToNCI-menu").getElementsByTagName("a");
                header = noTransform?document.body.querySelector('div:not(.skip-link):not(#skip-link),header'):null;
                
                
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
                // var nextEl = iframe.nextElementSibling;
                // if (window.getComputedStyle(nextEl).float == 'left' || window.getComputedStyle(nextEl).cssFloat == 'left'){
                //     nextEl.style.float = 'none';
                //     nextEl.style.display = 'inline-block';
                // }

                // add domain to links for analytics
                appendDomain(iframeDoc.querySelectorAll('a:not(.chevron)'));

                if(noTransform) {
                    //set the iframe position
                    header.style.marginTop = header.offsetTop + 24 + 'px';
                    // header.style.marginTop = '24px';
                    iframe.style.transform = 'translateY(24px)';
                }

            };

            // inject iframe - doing this on a timeout so that it will be loaded as soon as possible
            // this is basically document.ready
            var injectIframe = function(){
                if(document.contains(document.body)){
                    // kick out of init if body has .toolbar class - indicates Drupal admin mode
                    if(document.body.classList.contains('toolbar')){
                        return false
                    }
                    // this will work even if window.Linkback is undefined
                    settings = merge(defaults,window.Linkback);
                    // assign variable shortcuts
                    bodyStyle = document.body.style;
                    bodyClass = document.body.className;
                    noTransform = checkTransform();
                    checkSkipNav();
                    renderIframe();
                    isFixed = checkFixed();
                    noTransform = noTransform ? noTransform : isFixed ? true : false;

                } else {
                    setTimeout(injectIframe,50);
                }
            };

            injectIframe();

            //TODO: max-width and center aligned pages visualsonline.cancer.gov
        }

        // return public methods and variables
        return {
            init: init
        };

    })(); // END: NCI top bar module


    // Initialize the NCI top bar
    NCI_topBar.init();


})( );