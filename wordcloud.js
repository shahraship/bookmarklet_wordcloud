/*
Author: Raship Shah (shahraship@gmail.com)
File: wordcloud.js
Description: Bookmarklet code to generate word cloud on any webpage
*/

//Load jquery if it doesn't already exists*/
if (!($ = window.jQuery)) {
    script = document.createElement( 'script' );
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js'; 
    script.onload=createWordCloud;
    document.body.appendChild(script);
} else {
    createWordCloud();
}

/*
init function that creates and displays the word cloud
*/
function createWordCloud() {
    
    //global variables accessible to all the functions
    var wordMap = {},
        $c = $('<canvas width="499" height="499" />'),
        $testc = $('<canvas width="499" height="499" />'),
        cntx = $c[0].getContext('2d'),
        testCntx = $testc[0].getContext('2d'),
        OFFSET = 8,
        w = 499,
        h = 499,
        fontstyle = 'bold italic',
        fontfamily = 'Amaranth';
    
    //get words recursively from the entire body content and calculate their weight
    function getwords($ele){
        $ele.contents().each(function(){
            if ($(this).children().length > 0 ) {
                getwords($(this))
            } else if ($.trim($(this).text())!="") {
                var words = $.trim($(this).text()).split(/\W+/);
                $.each(words, function (i, word) {
                    if ($.trim(word).length > 3) {
                        if (wordMap[word]) {
                            wordMap[word] += 1;
                        } else {
                            wordMap[word] = 1;
                        }
                    }
                });
            }
        });
    }
    
    //create canvas placeholder to show the word cloud in
    function createPlaceHolder() {
        $wordcloud = $('<div id="wordcloud" />');
        $wordcloud.css({position: 'absolute', top: '50px', left: '50px', border: '1px solid #000', width: '500px', height: '500px', backgroundColor: '#fff'});
        $closeIcon = $('<div id="wordcloud_close">&#x274c;</div>');
        $closeIcon.css({position: 'absolute', right: '-10px', top: '-10px', width: '20px', height: '20px', color: '#fff', backgroundColor: '#000'});
        $closeIcon.on('click', function () {
            $wordcloud.remove();
        });
        $testc.hide();
        $wordcloud.append($c);
        $wordcloud.append($testc);
        $wordcloud.append($closeIcon);
        $('body').append($wordcloud);
    }
    
    //helper function to create font style string
    function getFont(style, size, name) {
        return (style + ' ' + size + 'px ' + name);
    }

    //helper function to return the width and height of the word
    function measureText(text, font, size, context) {
        context.font = font;
        var metrics = context.measureText(text);
        return {
            width: metrics.width + 2 * OFFSET,
            height: Math.round(size * 1.5)
        };
    }
    
    //helper function to check if there is going to be collision
    function testCollision(pixels) {
        var i;
        for (i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] > 128) {
                return true;
            }
        }
        return false;
    }
    
    //helper function to put text on the canvas
    function putText(text, font, x, y, context) {
        context.font = font;
        context.textBaseline = 'top';
        context.fillStyle = 'rgba(255, 0, 0, 0.5)';
        context.fillText(text, x, y);
    }
    
    createPlaceHolder();
    getwords($('body'));
    
    $.each(wordMap, function(word, weight) {
        var col = true;
        var max = 10;
        var size = weight + 12;
        var font = getFont(fontstyle, size, fontfamily);
        var measure = measureText(word, font, size, cntx);
        
        while (col && (max-- > 0)) {

            var x = Math.round(Math.random() * (w - measure.width - OFFSET)) + 2 * OFFSET;
            var y = Math.round(Math.random() * (h - measure.height));

            var bx = x - OFFSET;
            bx = (bx < 0) ? 0 : bx;
            var by = y;
            var bw = measure.width;
            var bh = measure.height;

            testCntx.drawImage(cntx.canvas, bx, by, bw, bh, bx, by, bw, bh);
            putText(word, font, x, y, cntx);

            var img = cntx.getImageData(bx, by, bw, bh);
            col = testCollision(img.data);

            if (col) {
                cntx.clearRect(bx, by, bw, bh);
                cntx.drawImage(testCntx.canvas, bx, by, bw, bh, bx, by, bw, bh);
                size = Math.max(Math.round(size * 0.85), 10);
                font = getFont(fontstyle, size, fontfamily);
                measure = measureText(word, font, size, cntx);
            }

            testCntx.clearRect(bx, by, bw, bh);
        }
    });
    
}