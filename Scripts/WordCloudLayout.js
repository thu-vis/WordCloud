var wordList = new Array();
var wordCloudLayout = function (words,textWidth,textHeight,weight,width,height)
{
    //alert("wordCloudLayout");
    var boundWidth = width;
    var boundHeight = height;
    var HorizontalGap = 2;
    var VerticalGap = 2;
    var EllipseCenter = new Point(boundWidth/2,boundHeight/2);
    wordList.splice(0,wordList.length);

    for(var i = 0; i < words.length;i++)
    {
        var w = new Word(words[i],textWidth[i],textHeight[i],weight[i]);
        wordList.push(w);
    }

    //sort the wordList by weight
    SortWordList();

    var labelBounds = new Array();
    var isPlaced = new Array();
    var preferLocs = new Array();
    for(i = 0; i <wordList.length;i++)
    {
        preferLocs.push(EllipseCenter);
        isPlaced.push(true);
        var lb = new Rect(0, 0, wordList[i].textWidth + HorizontalGap * 2, wordList[i].textHeight + VerticalGap * 2);
        labelBounds.push(lb);
    }
    se_up = new SegEvent(0);
    se_up.downIntervals.push(0,723);
    se_down = new SegEvent(boundHeight);
    se_down.upIntervals.push(0,723);

    var res = ConstrainedTagCloudAlg(labelBounds, isPlaced, preferLocs, boundWidth, boundHeight, se_up, se_down, HorizontalGap, VerticalGap, wordList);
    var result = new Array();
    for(var i = 0; i < wordList.length; i++)
    {
        var position = new Point(res[i].point.X + wordList[i].textWidth / 2, res[i].point.Y + wordList[i].textHeight);
        var r = new DataItem(position, wordList[i].word, wordList[i].weight);
        result.push(r);
    }
    return result;
};

function SortWord(w1,w2)
{
    return w2.weight - w1.weight;
}

var SortWordList = function ()
{
    wordList.sort(SortWord);
};