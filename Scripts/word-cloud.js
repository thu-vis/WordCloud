//var data = [{ point: { X: 374.5, Y: 163 }, word: "Hello", size: 30 }, { point: { X: 374.5, Y: 193 }, word: "World", size: 30 }];

var wordCloud = function (words) {
    //set the font name
    var wordCloudFontName = "Times New Roman";//Georgia, Microsoft YaHei

    //set the font scale
    var weightScale = d3.scalePow()
        .exponent(0.3)
        .domain(d3.extent(words, function (word) { return word.weight }))
        .range([12, 30]);

    for (var i = 0; i < words.length; i++) {
        words[i].word = "___" + words[i].word;
        words[i].word = words[i].word.replace("&", "");
        words[i].size = parseInt(weightScale(words[i].weight));
    }

    //estimate the size of each word
    $("#invisable-item").empty();
    d3.select("#invisable-item")
        .append("svg")
        .append("g")
        .selectAll("text")
        .data(words.map(function (item) {
            return {
                text: item.word.replace("___", ""),
                size: item.size
            }
        }))
        .enter().append("text")
        .classed("wordCloudText", true)
        .style("font-size", function (d) { return d.size + "px"; })
        .style("font-family", wordCloudFontName)
        .attr("text-anchor", "middle")
        .text(function (d) { return d.text; });
    var newWords = new Array();
    for (var i = 0; i < words.length; i++) {
        newWords[words[i].word] = words[i];
    }
    var text = $("#invisable-item svg g text");

    for (var i = 0; i < text.length; i++)
    {
        var bbox = text[i].getBBox();
        newWords["___" + text[i].innerHTML].width = bbox.width;
        newWords["___" + text[i].innerHTML].height = bbox.height;
    }
    var word = new Array();
    var width = new Array();
    var height = new Array();
    var textWidth = new Array();
    var textHeight = new Array();
    var weight = new Array();
    var font = new Font();
    font.fontFamily = wordCloudFontName;
    font.src = wordCloudFontName;
    font.onload = function ()
    {
        var i = 0;
        for (var x in newWords)
        {
            if (newWords.hasOwnProperty(x))
            {
                word[i] = newWords[x].word.replace("___", "");
                textWidth[i] = font.measureText(word[i], newWords[x].size).width;
                textHeight[i] = font.measureText(word[i], newWords[x].size).height;
                width[i] = newWords[x].width;
                height[i] = newWords[x].height;
                weight[i] = newWords[x].size;
                i++;
            }
        }

        data = wordCloudLayout(word,textWidth,textHeight,weight,$("#word-cloud").width(),$("#word-cloud").height());

        //clear the word cloud
        $("#word-cloud").empty();

        //show the word cloud
        d3
            .select("#word-cloud")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .append("g")
            //.attr("transform", "translate(50,50)")
            .selectAll("text")
            .data(data.map(function (item) {
                return {
                    text: item.word,
                    size: item.size,
                    x: item.point.X,
                    y: item.point.Y,
                    rotate: 0
                };
            }))
            .enter().append("text")
            .classed("wordCloudText", true)
            .style("font-size", function (d) { return d.size + "px"; })
            .style("font-family", wordCloudFontName)
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) { return d.text; });
    };
};
