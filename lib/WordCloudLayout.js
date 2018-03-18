(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.WordCloudLayout = global.WordCloudLayout || {})));
}(this, (function (exports) {
    'use strict';

    //Constructor
    function Word(word, textWidth, textHeight, weight)
    {
        this.word = word;
        this.textWidth = textWidth;
        this.textHeight = textHeight;
        this.weight = weight;
    }

    function Point(x, y)
    {
        this.X = x;
        this.Y = y;
    }

    function Rect(x, y, width, height)
    {
        this.X = x;
        this.Y = y;
        this.Width = width;
        this.Height = height;
    }

    function SegEvent(yy)
    {
        this.y = yy;
        this.upIntervals = new Array();
        this.downIntervals = new Array();
    }

    function DataItem(point, word, size)
    {
        this.point = point;
        this.word = word;
        this.size = size;
    }

    function SortWord(w1,w2)
    {
        return w2.weight - w1.weight;
    }

    function Selection(_id) {
        this.text = selection_text;
        this.attr = selection_attr;
        this.show = selection_show;
    }

    let id;
    let select = function (_id)
    {
        id = _id;

        console.log(Selection);
        return new Selection();
    };

    let words = new Array();
    let selection_text = function (_words)
    {
        words = _words;
        return this;
    };

    let width;
    let height;
    let num;
    let minFontSize;
    let maxFontSize;
    let fontname;

    let selection_attr = function (name, value)
    {
        switch (name)
        {
            case "width":
                width = value;
                break;
            case "height":
                height = value;
                break;
            case "num":
                num = value;
                break;
            case "minFontSize":
                minFontSize = value;
                break;
            case "font":
                fontname = value;
                break;
            case "maxFontSize":
                maxFontSize = value;
                break;
            default:
                alert("attr undefined!");
        }
        return this;
    };

    let selection_show = function () {
        wordCloud();
        return this;
    };

    /*Selection.prototype = {
        text:selection_text,
        attr:selection_attr,
        show:selection_show
    };*/

    let wordCloud = function () {
        let wordCloudFontName = fontname;

        let wd = new Array();
        let wt = new Array();
        for (let i = 0; i < words.length; i++) {
            wd.push(words[i].word);
            wt.push(words[i].weight);
        }

        //sort the wordList by weight
        words.sort(SortWord);
        words.splice(num, words.length - num);
        //set the font scale
        let weightScale = d3.scalePow()
            .exponent(0.3)
            .domain(d3.extent(words, function (word) { return word.weight }))
            .range([minFontSize, maxFontSize]);


        if(words.length === 2 && words[0].weight === words[1].weight){
            for (let i = 0; i < words.length; i++) {
                words[i].word = "___" + words[i].word;
                words[i].word = words[i].word.replace("&", "");
            }
            words[0].size = words[1].size = maxFontSize;
        }
        else if(words.length === 1){
            for (let i = 0; i < words.length; i++) {
                words[i].word = "___" + words[i].word;
                words[i].word = words[i].word.replace("&", "");
                words[i].size = maxFontSize;
            }
        }
        else{
            for (let i = 0; i < words.length; i++) {
                words[i].word = "___" + words[i].word;
                words[i].word = words[i].word.replace("&", "");
                words[i].size = parseInt(weightScale(words[i].weight));
            }
        }

        //estimate the size of each word
        $("#" + id).empty();
        //$("#" + id).visibility = "hidden";
        d3.select("#" + id)
            .append("div")
            .attr("id", "measure")
            .style("visivility", "hidden");
        d3.select("#" + "measure")
            .append("svg")
            .append("g")
            .selectAll("text")
            .data(words.map(function (item) {
                let obj = {};
                obj.text = item.word.replace("___", "");
                obj.size = item.size;
                return obj;
            }))
            .enter().append("text")
            .classed("wordCloudText", true)
            .style("font-size", function (d) { return d.size + "px"; })
            .style("font-family", wordCloudFontName)
            .attr("text-anchor", "middle")
            .text(function (d) { return d.text; });
        let newWords = new Array();
        for (let i = 0; i < words.length; i++) {
            newWords[words[i].word] = words[i];
        }
        let text = $("#" + "measure" + " svg g text");

        for (let i = 0; i < text.length; i++)
        {
            let bbox = text[i].getBBox();
            newWords["___" + text[i].innerHTML].width = bbox.width;
            newWords["___" + text[i].innerHTML].height = bbox.height;
        }
        let word = new Array();
        let textWidth = new Array();
        let textHeight = new Array();
        let weight = new Array();
        let font = new Font();
        font.fontFamily = wordCloudFontName;
        font.src = wordCloudFontName;
        font.onload = function ()
        {
            let i = 0;
            for (let x in newWords)
            {
                if (newWords.hasOwnProperty(x))
                {
                    word[i] = newWords[x].word.replace("___", "");
                    textWidth[i] = font.measureText(word[i], newWords[x].size).width;
                    textHeight[i] = font.measureText(word[i], newWords[x].size).height;
                    weight[i] = newWords[x].size;
                    i++;
                }
            }

            let data = wordCloudLayout(word,textWidth,textHeight,weight, width, height, num);

            //clear the word cloud
            $("#" + id).empty();
            $("#" + id).visibility = "visible";

            //show the word cloud
            d3
                .select("#" + id)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
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
                .text(function (d) { return d.text; })
                .on("mouseover", function (d) {
                    d3.select(this)
                        //.select("text")
                        .style("fill", "orange");
                })
                .on("mousedown",function (d) {
                    alert("click " + d.text)
                })
                .on("mouseout",function(d){
                    d3.select(this)
                    //.select("text")
                        .style("fill", "steelblue");
                })
                .style("cursor", "pointer");
        };

        words.splice(0, words.length);
        for (let i = 0; i < wd.length; i++) {
            words.push({
                word: wd[i],
                weight: wt[i]
            });
        }
    };

    let wordList = new Array();
    let wordCloudLayout = function (words,textWidth,textHeight,weight,width,height, num)
    {
        //alert("wordCloudLayout");
        let boundWidth = width;
        let boundHeight = height;
        let HorizontalGap = 2;
        let VerticalGap = 2;
        let EllipseCenter = new Point(boundWidth/2,boundHeight/2);
        wordList.splice(0,wordList.length);

        for(let i = 0; i < words.length;i++)
        {
            let w = new Word(words[i],textWidth[i],textHeight[i],weight[i]);
            wordList.push(w);
        }

        let labelBounds = new Array();
        let isPlaced = new Array();
        let preferLocs = new Array();
        for(let i = 0; i <wordList.length;i++)
        {
            preferLocs.push(EllipseCenter);
            isPlaced.push(true);
            let lb = new Rect(0, 0, wordList[i].textWidth + HorizontalGap * 2, wordList[i].textHeight + VerticalGap * 2);
            labelBounds.push(lb);
        }
        let se_up = new SegEvent(0);
        se_up.downIntervals.push(0,boundWidth);
        let se_down = new SegEvent(boundHeight);
        se_down.upIntervals.push(0,boundWidth);

        let res = ConstrainedTagCloudAlg(labelBounds, isPlaced, preferLocs, boundWidth, boundHeight, se_up, se_down, HorizontalGap, VerticalGap, wordList);
        let result = new Array();
        for(let i = 0; i < res.length; i++)
        {
            let position = new Point(res[i].point.X + wordList[i].textWidth / 2, res[i].point.Y + wordList[i].textHeight);
            let r = new DataItem(position, wordList[i].word, wordList[i].weight);
            result.push(r);
        }
        return result;
    };


    let alignTolerance = 3;
    let maxTolDist;
    let ellipseRatio;
    let events = new Array();

    let ConstrainedTagCloudAlg = function (labelBounds, isplaced, preferLocs, boundWidth, boundHeight, se_up, se_down,HorizontalGap, VerticalGap, wordList)
    {
        ellipseRatio = boundWidth/boundHeight;
        maxTolDist = Math.min(boundWidth/2, boundHeight/2) - 5;
        events.splice(0, events.length);
        events.push(se_up, se_down);

        let result = new Array();
        PlaceRectangles(labelBounds, isplaced, preferLocs);
        for(let i = 0; i < labelBounds.length; i++)
        {
            if( i === 0 && !isplaced[0])
            {
                alert("is too large to be shown on the word cloud!!!");
                continue;
            }
            else if(isplaced[i])
            {
                let position = new Point(labelBounds[i].X + HorizontalGap, labelBounds[i].Y + VerticalGap);
                let res = new DataItem(position, wordList[i].word, wordList[i].weight);
                result.push(res);
            }
        }
        return result;
    };

/// <summary>
/// Generate the new segment event in the line of <code>yLine</code>, and return the index of events.
/// If the yline is aligned with existed event segment, use the exsited one.
/// </summary>
    let GeneratePreferSegEvent = function(yLine)
    {
        //alert("yLine = " + yLine);
        //alert("events[0].y = " + events[0].y);
        if(yLine <= events[0].y)
        {
            return 0;
        }

        for(let i = 1; i < events.length; i++)
        {
            let se = events[i];
            let pse = events[i - 1];
            if(pse.y < yLine && se.y >= yLine)
            {
                // adding the extra center events.
                if(se.y - yLine > alignTolerance)
                {
                    let centerEvent = new SegEvent(yLine);
                    centerEvent.upIntervals = pse.downIntervals;
                    centerEvent.downIntervals = se.upIntervals.slice();
                    se.upIntervals = centerEvent.downIntervals;
                    events.splice(i, 0, centerEvent);
                }
                //alert("i = " + i);
                return i;
            }
        }
        return events.length - 1;
    };

/// <summary>
/// Intersect interval orig and other. deposite the result in orig interval.
/// </summary>
    let IntersectInterval = function(orig, other)
    {
        //alert("IntersectInterval");
        for(let i = 0; i < orig.length; i += 2)
        {
            let s = orig[i];
            let t = orig[i + 1];

            let addCnt = 0;
            let cnt = 0;
            while(cnt < other.length && other[cnt] < t)
            {
                let os = other[cnt];
                let ot = other[cnt + 1];

                if(ot > s)
                {
                    if(0 === addCnt)
                    {
                        orig[i] = Math.max(s,os);
                        orig[i + 1] = Math.min(t,ot);
                        addCnt = 2;
                    }
                    else
                    {
                        orig.splice(i + addCnt, 0, Math.max(s, os));
                        orig.splice(i + addCnt + 1, 0,Math.min(t, ot));
                    }
                }
                cnt += 2;
            }

            if(0 === addCnt)
            {
                orig.splice(i, 2);
                i -= 2;
            }
            else{
                i+= addCnt - 2;
            }
        }
    };

/// <summary>
/// Find the position which is the best place to displace word in the intervals
/// </summary>
    let FillInterval = function(interval, width, cx)
    {
        //alert("FillInterval");
        let x = -Infinity;
        let minDist = Number.MAX_VALUE;

        let hw = width / 2;
        for(let i = 0; i < interval.length; i += 2)
        {
            let s = interval[i];
            let t = interval[i + 1];
            if(t - s >= width){
                // calculate x
                if(t >= cx && s <= cx){
                    // special case, in the region
                    if(t - cx >= hw && cx - s >= hw)
                    {
                        return cx;
                    }
                    //left of centre
                    else if(t - cx > hw)
                    {
                        return s + hw;
                    }
                    //right of centre
                    else
                    {
                        return t - hw;
                    }
                }

                let xx = t <= cx ? t - hw : s + hw;
                //make x as near to the center as possible
                let d = Math.abs(xx - cx);
                if(d < minDist)
                {
                    x = xx;
                    minDist = d;
                }
            }
        }

        //alert("x = " + x);
        return x;
    };

/// <summary>
/// Searching the suitable position on the center line of prefered location.
/// </summary>
    let SearchCenterLine = function (w, hh, centerEventIndex, center)
    {
        //alert("SearchCenterLine");
        let e = events[centerEventIndex];
        let intervals = e.upIntervals.slice();

        let upFeasible = false, downFeasible = false;

        // up search the span lines
        for(let j = centerEventIndex - 1; j >= 0; j--)
        {
            //alert("0e.y - events[j].y = " + (e.y - events[j].y));
            //alert("hh = " + hh);
            if(e.y - events[j].y >= hh)
            {
                //alert("upFeasible = true;");
                upFeasible = true;
                break;
            }
            else
            {
                IntersectInterval(intervals, events[j].upIntervals);
            }
        }

        // down search
        for(let j = centerEventIndex; j < events.length; j++)
        {
            if(events[j].y - e.y >= hh)
            {
                //alert("downFeasible = true;");
                downFeasible = true;
                break;
            }
            else
            {
                IntersectInterval(intervals, events[j].downIntervals);
            }
        }

        //up and down are both feasible
        if(upFeasible && downFeasible)
        {
            let x = FillInterval(intervals, w, center.X);
            if(-Infinity !== x)
            {
                return x;
            }
        }
        return Infinity;
    };

/// <summary>
/// Update Interval by filled with the rect at x
/// </summary>
    let UpdateInterval = function(interval, w, x)
    {
        //alert("UpdateInterval");
        let hw = w / 2;

        for(let i = 0; i < interval.length; i += 2)
        {
            let s = interval[i];
            let t = interval[i + 1];

            if(s < x && t > x)
            {
                interval.splice(i,2);

                let ii = i;

                //there is space in the left
                if(x - s - hw > alignTolerance)
                {
                    interval.splice(ii++, 0, s);
                    interval.splice(ii++, 0, x - hw);
                }

                //there is space in the right
                if(t - x - hw > alignTolerance)
                {
                    interval.splice(ii++, 0, x + hw);
                    interval.splice(ii++, 0, t);
                }
                break;
            }
        }
    };

/// <summary>
/// Update the interval array and marked the rectangle region as forbidden.
/// </summary>
    let UpdateEvent = function (x, eIndex, width, height, direction)
    {
        //alert("UpdateEvent");
        let curEvent = events[eIndex];
        let h = (0 === direction) ? height / 2 :height;

        if(1 === direction || 0 === direction)
        {
            // Up direciton Search
            let  newY = curEvent.y - h;
            let updateIndex = eIndex - 1;
            while (newY < events[updateIndex].y - alignTolerance)
            {
                let e = events[updateIndex];
                UpdateInterval(e.downIntervals, width, x);
                updateIndex--;
            }

            if(newY < events[updateIndex].y + alignTolerance)
            {
                UpdateInterval(events[updateIndex].downIntervals, width, x);
            }
            else
            {
                let lastEvent = events[updateIndex + 1];
                let upInterval = lastEvent.upIntervals;

                let newEvent = new SegEvent(newY);
                let newInterval = upInterval.slice();

                UpdateInterval(newInterval, width, x);
                lastEvent.upIntervals = newInterval;
                newEvent.downIntervals = newInterval;
                newEvent.upIntervals = upInterval;

                // insert before the last event
                events.splice(updateIndex + 1, 0, newEvent);
            }
        }

        if(-1 === direction || 0 === direction)
        {
            // Down Search
            let newY = curEvent.y + h;
            let updateIndex = eIndex + 1;

            while (newY > events[updateIndex].y + alignTolerance)
            {
                let e = events[updateIndex];
                UpdateInterval(e.upIntervals, width, x);
                updateIndex++;
            }

            if(newY > events[updateIndex].y - alignTolerance)
            {
                UpdateInterval(events[updateIndex].upIntervals, width, x);
            }
            else
            {
                let lastEvent = events[updateIndex - 1];
                let downInterval = lastEvent.downIntervals;

                let newEvent = new SegEvent(newY);
                let newInterval = downInterval.slice();

                UpdateInterval(newInterval, width, x);
                lastEvent.downIntervals = newInterval;
                newEvent.upIntervals = newInterval;
                newEvent.downIntervals = downInterval;

                events.splice(updateIndex, 0, newEvent);
            }
        }
    };

/// <summary>
/// Layout keyword according to the segment event.
/// </summary>
/// <param name="rects">the boundary of keyword</param>
/// <param name="displaced">whether the rectangle is placed</param>
/// <param name="prefers">prefered location for each rectangle</param>
    let PlaceRectangles = function (rects, displaced, prefers)
    {
        //alert("PlaceRectangles");
        for(let i = 0; i < rects.length; i++)
        {
            if(!displaced){
                continue;
            }
            //alert("rects[i].Width = " + rects[i].Width);
            let w = rects[i].Width;
            let h = rects[i].Height;
            let hw = w / 2;
            let hh = h / 2;

            let center = prefers[i];
            let centerEventIndex = GeneratePreferSegEvent(prefers[i].Y);
            //alert("centerEventIndex = " + centerEventIndex);

            let yIndex = -1;
            let xCoor = Infinity;
            let minDist = Infinity;
            let direction = 0;

            xCoor = SearchCenterLine(w, hh, centerEventIndex, center);
            if(Infinity !== xCoor)
            {
                minDist = Math.abs((xCoor - center.X) / ellipseRatio);
                yIndex = centerEventIndex;
            }

            let upCnt = centerEventIndex, downCnt = centerEventIndex;

            let upDy = Math.abs(center.Y - (events[upCnt].y - hh));
            let downDy = Math.abs(events[downCnt].y + hh - center.Y);

            do {
                let upSearch;
                if(-1 === upCnt){
                    upSearch = false;
                }
                else if (downCnt === events.length)
                {
                    upSearch = true;
                }
                else
                {
                    upDy = Math.abs(center.Y - (events[upCnt].y - hh));
                    downDy = Math.abs((events[downCnt].y + hh - center.Y));
                    upSearch = upDy < downDy;
                }

                // search region exceed the border.
                let dy = upSearch ? upDy : downDy;
                if (dy >= minDist || dy >= maxTolDist)
                {
                    break;
                }

                let e = new SegEvent(-1);
                if(upSearch){
                    // up search
                    e = events[upCnt];
                    if (e.y - events[0].y < h)
                    {
                        upCnt = -1;
                        continue;
                    }

                    let intervals = e.upIntervals.slice();

                    for (let j = upCnt - 1; j >= 0; j--)
                    {
                        if (e.y - events[j].y >= h)
                        {
                            break;
                        }
                        else
                        {
                            IntersectInterval(intervals, events[j].upIntervals);
                        }
                    }
                    let x = FillInterval(intervals, w, center.X);
                    if(-Infinity !== x)
                    {
                        let y = e.y - hh;

                        let d = Math.sqrt((x - center.X) / ellipseRatio
                            * (x - center.X) / ellipseRatio + (y - center.Y)
                            * (y - center.Y));
                        if (d < minDist)
                        {
                            minDist = d;
                            yIndex = upCnt;
                            xCoor = x;
                            direction = 1;
                        }
                    }
                    upCnt--;
                }
                else {
                    // down search
                    e = events[downCnt];
                    if (events[events.length - 1].y - e.y < h)
                    {
                        downCnt = events.length;
                        continue;
                    }

                    let intervals = e.downIntervals.slice();

                    for (let j = downCnt + 1; j < events.length; j++)
                    {
                        if (events[j].y - e.y >= h)
                        {
                            break;
                        }
                        else
                        {
                            IntersectInterval(intervals, events[j].downIntervals);
                        }
                    }

                    let x = FillInterval(intervals, w, center.X);
                    if(-Infinity !== x)
                    {
                        let y = e.y + hh;

                        let d = Math.sqrt((x - center.X) / ellipseRatio
                            * (x - center.X) / ellipseRatio + (y - center.Y)
                            * (y - center.Y));
                        if (d < minDist)
                        {
                            minDist = d;
                            yIndex = downCnt;
                            xCoor = x;
                            direction = -1;
                        }
                    }
                    downCnt++;
                }
            } while (upCnt >= 0 || downCnt < events.length);

            //succeed to place the rectangles
            if (-1 !== yIndex && minDist < maxTolDist)
            {
                displaced[i] = true;
                let x = xCoor - hw;
                let y = (0 === direction) ? center.Y - hh
                    : (1 === direction ? events[yIndex].y - h : events
                        [yIndex].y);
                rects[i].X = x;
                rects[i].Y = y;

                UpdateEvent(xCoor, yIndex, rects[i].Width, rects[i].Height, direction);
            }

            //fail to place the rectangles
            else
            {
                displaced[i] = false;
            }
        }
    };

    exports.select = select;
})));
