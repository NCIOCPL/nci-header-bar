(function createLinkbackBar() {
    var linkback = create('iframe', {
        id: 'returnToNCIframe',
        title: 'Link to cancer.gov',
        width: '100%',
        height: '24px',
        scrolling: 'no',
        style: 'border: 0; display: block;'
    });
    var linktarget = "_new";
    var content = '<head>' +
        '<link rel="stylesheet" href="//fonts.googleapis.com/css?family=Noto+Sans" />' +
        '<style>' +
        'body {margin: 0; background: #1c5e86;}' +
        'a {color: white; text-transform: uppercase; text-decoration: none; font-size: 10px; font-family: "Noto Sans", Arial, sans-serif}' +
        'a:hover {text-decoration: underline;}' +
        '#returnToNCInav {height: 100%; display:block; line-height: 48px; text-align: center;}' +
        '</style>' +
        '<body>' +
        '<nav id="returnToNCInav">' +
        '<a target="' + linktarget + '" tabindex="1" id="returnToNCIlink--home" href="https://www.cancer.gov?cid=cgovnav_hp_closed_">National Cancer Institute - Cancer.gov</a>' +
        '</nav>' +
        '</body>';

    //  take a DOM node and returns an index
    function getNodeIndex( elm ){
        var c = elm.parentNode.children, i = 0;
        for(; i < c.length; i++ )
            if( c[i] == elm ) return i;
    }
    
        var checkSkipNav = function () {
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

            if (skipNavEl) {
                //console.log("skip nav found!");
                break;
            }
        }


        if (skipNavEl) {
            // index of 0 indicates skipNavEl is the first child element of it's parent
            if (skipNavEl.parentNode.tagName !== 'BODY' || getNodeIndex(skipNavEl) !== 0) {
                // console.log("skip nav is not the first child element");
                // move the skip nav
                document.body.insertBefore(skipNavEl, document.body.firstChild);
            }
            //else {
            //console.log("skip nav is positioned properly");
            //}
        }
    };

    checkSkipNav();

    // inject iFrame after skip nav if it's present
    if(skipNavEl) {
        document.body.insertBefore(linkback,skipNavEl.nextSibling);
    } else {
        document.body.insertBefore(linkback,document.body.firstChild);
    }
   
    // set shortcut variable
    iframeDoc = linkback.contentWindow.document;

    //inject top bar markup
    iframeDoc.open();
    iframeDoc.write(content);
    iframeDoc.close();

    // create new DOM nodes
    function create(name, props) {
        var el = document.createElement(name);
        for (var p in props)
            el[p] = props[p];
        return el;
    }

})();
