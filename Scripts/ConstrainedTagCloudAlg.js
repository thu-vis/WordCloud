var alignTolerance = 3;
var maxTolDist;
var ellipseRatio;
var events = new Array();

var ConstrainedTagCloudAlg = function (labelBounds, isplaced, preferLocs, boundWidth, boundHeight, se_up, se_down,HorizontalGap, VerticalGap, wordList)
{
    ellipseRatio = boundWidth/boundHeight;
    maxTolDist = Math.min(boundWidth/2, boundHeight/2) - 5;
    events.splice(0, events.length);
    events.push(se_up, se_down);

    var result = new Array();
    PlaceRectangles(labelBounds, isplaced, preferLocs);
    for(var i = 0; i < labelBounds.length; i++)
    {
        if( i === 0 && !isplaced[0])
        {
            alert("is too large to be shown on the word cloud!!!");
            continue;
        }
        else if(isplaced[i])
        {
            var position = new Point(labelBounds[i].X + HorizontalGap, labelBounds[i].Y + VerticalGap);
            var res = new DataItem(position, wordList[i].word, wordList[i].weight);
            result.push(res);
        }
    }
    return result;
};

/// <summary>
/// Generate the new segment event in the line of <code>yLine</code>, and return the index of events.
/// If the yline is aligned with existed event segment, use the exsited one.
/// </summary>
var GeneratePreferSegEvent = function(yLine)
{
    //alert("yLine = " + yLine);
    //alert("events[0].y = " + events[0].y);
    if(yLine <= events[0].y)
    {
        return 0;
    }

    for(var i = 1; i < events.length; i++)
    {
        var se = events[i];
        var pse = events[i - 1];
        if(pse.y < yLine && se.y >= yLine)
        {
            // adding the extra center events.
            if(se.y - yLine > alignTolerance)
            {
                var centerEvent = new SegEvent(yLine);
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
var IntersectInterval = function(orig, other)
{
    //alert("IntersectInterval");
    for(var i = 0; i < orig.length; i += 2)
    {
        var s = orig[i];
        var t = orig[i + 1];

        var addCnt = 0;
        var cnt = 0;
        while(cnt < other.length && other[cnt] < t)
        {
            var os = other[cnt];
            var ot = other[cnt + 1];

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
var FillInterval = function(interval, width, cx)
{
    //alert("FillInterval");
    var x = -Infinity;
    var minDist = Number.MAX_VALUE;

    var hw = width / 2;
    for(var i = 0; i < interval.length; i += 2)
    {
        var s = interval[i];
        var t = interval[i + 1];
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

            var xx = t <= cx ? t - hw : s + hw;
            //make x as near to the center as possible
            var d = Math.abs(xx - cx);
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
var SearchCenterLine = function (w, hh, centerEventIndex, center)
{
    //alert("SearchCenterLine");
    var e = events[centerEventIndex];
    var intervals = e.upIntervals.slice();

    var upFeasible = false, downFeasible = false;

    // up search the span lines
    for(var j = centerEventIndex - 1; j >= 0; j--)
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
    for(var j = centerEventIndex; j < events.length; j++)
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
        var x = FillInterval(intervals, w, center.X);
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
var UpdateInterval = function(interval, w, x)
{
    //alert("UpdateInterval");
    var hw = w / 2;

    for(var i = 0; i < interval.length; i += 2)
    {
        var s = interval[i];
        var t = interval[i + 1];

        if(s < x && t > x)
        {
            interval.splice(i,2);

            var ii = i;

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
var UpdateEvent = function (x, eIndex, width, height, direction)
{
    //alert("UpdateEvent");
    var curEvent = events[eIndex];
    var h = (0 === direction) ? height / 2 :height;

    if(1 === direction || 0 === direction)
    {
        // Up direciton Search
        var  newY = curEvent.y - h;
        var updateIndex = eIndex - 1;
        while (newY < events[updateIndex].y - alignTolerance)
        {
            var e = events[updateIndex];
            UpdateInterval(e.downIntervals, width, x);
            updateIndex--;
        }

        if(newY < events[updateIndex].y + alignTolerance)
        {
            UpdateInterval(events[updateIndex].downIntervals, width, x);
        }
        else
        {
            var lastEvent = events[updateIndex + 1];
            var upInterval = lastEvent.upIntervals;

            var newEvent = new SegEvent(newY);
            var newInterval = upInterval.slice();

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
        var newY = curEvent.y + h;
        var updateIndex = eIndex + 1;

        while (newY > events[updateIndex].y + alignTolerance)
        {
            var e = events[updateIndex];
            UpdateInterval(e.upIntervals, width, x);
            updateIndex++;
        }

        if(newY > events[updateIndex].y - alignTolerance)
        {
            UpdateInterval(events[updateIndex].upIntervals, width, x);
        }
        else
        {
            var lastEvent = events[updateIndex - 1];
            var downInterval = lastEvent.downIntervals;

            var newEvent = new SegEvent(newY);
            var newInterval = downInterval.slice();

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
var PlaceRectangles = function (rects, displaced, prefers)
{
    //alert("PlaceRectangles");
  for(var i = 0; i < rects.length; i++)
  {
      if(!displaced){
          continue;
      }
      //alert("rects[i].Width = " + rects[i].Width);
      var w = rects[i].Width;
      var h = rects[i].Height;
      var hw = w / 2;
      var hh = h / 2;

      var center = prefers[i];
      var centerEventIndex = GeneratePreferSegEvent(prefers[i].Y);
      //alert("centerEventIndex = " + centerEventIndex);

      var yIndex = -1;
      var xCoor = Infinity;
      var minDist = Infinity;
      var direction = 0;

      xCoor = SearchCenterLine(w, hh, centerEventIndex, center);
      if(Infinity !== xCoor)
      {
          minDist = Math.abs((xCoor - center.X) / ellipseRatio);
          yIndex = centerEventIndex;
      }

      var upCnt = centerEventIndex, downCnt = centerEventIndex;

      var upDy = Math.abs(center.Y - (events[upCnt].y - hh));
      var downDy = Math.abs(events[downCnt].y + hh - center.Y);

      do {
          var upSearch;
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
          var dy = upSearch ? upDy : downDy;
          if (dy >= minDist || dy >= maxTolDist)
          {
              break;
          }

          var e = new SegEvent(-1);
          if(upSearch){
              // up search
              e = events[upCnt];
              if (e.y - events[0].y < h)
              {
                  upCnt = -1;
                  continue;
              }

              var intervals = e.upIntervals.slice();

              for (var j = upCnt - 1; j >= 0; j--)
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
              var x = FillInterval(intervals, w, center.X);
              if(-Infinity !== x)
              {
                  var y = e.y - hh;

                  var d = Math.sqrt((x - center.X) / ellipseRatio
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

              var intervals = e.downIntervals.slice();

              for (var j = downCnt + 1; j < events.length; j++)
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

              var x = FillInterval(intervals, w, center.X);
              if(-Infinity !== x)
              {
                  var y = e.y + hh;

                  var d = Math.sqrt((x - center.X) / ellipseRatio
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
          var x = xCoor - hw;
          var y = (0 === direction) ? center.Y - hh
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