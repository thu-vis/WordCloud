$(function () {
    //var data = [{ word: "Hello", weight: 20 }, { word: "World", weight: 10 }, { word: "Normally", weight: 25 }, { word: "You", weight: 15 }, { word: "Want", weight: 30 }, { word: "More", weight: 12 }, { word: "Words", weight: 8 }, { word: "But", weight: 18 }, { word: "Who", weight: 22 }, { word: "Cares", weight: 27 }];
    $("#text-content-text").val("Hello,20\nWorld,10\nTry,25\nNormally,25\nYou,15\nWant,30\nMore,30\nWords,18\nWho,23");
    var upbtn = document.getElementById("update-button");

    //Split data
    upbtn.onclick = function () {
        var content = $("#text-content-text").val();
        var pairSep = /[ \n]/;
        var sep = ",";
        var words = new Array();
        var minFontSize = 5;
        var maxFontSize = 30;
        //alert("clicked");

        var pair = content.split(pairSep);
        for (var i = 0; i < pair.length; i++) {
            if (pair[i] !== "") {
                var p = pair[i].split(sep);
                words.push({
                    word: p[0],
                    weight: +p[1]
                });
            }
        }

        WordCloudLayout.select("word-cloud")
            .text(words)
            .attr("width", $("#word-cloud").width())
            .attr("height", $("#word-cloud").height())
            .attr("num", words.length)
            .attr("minFontSize", minFontSize)
            .attr("maxFontSize", maxFontSize)
            .show();

        $( "#slider-range-min" ).slider({
            range: "min",
            value: pair.length,
            min: 1,
            max: pair.length,
            slide: function( event, ui ) {
                $( "#amount" ).val( ui.value );
                
                WordCloudLayout.select("word-cloud")
                    .text(words)
                    .attr("width", $("#word-cloud").width())
                    .attr("height", $("#word-cloud").height())
                    .attr("num", ui.value)
                    .attr("minFontSize", minFontSize)
                    .attr("maxFontSize", maxFontSize)
                    .show();
            }
        });
        $( "#amount" ).val($( "#slider-range-min" ).slider( "value" ) );

        return false;
    };
    upbtn.onclick();
});