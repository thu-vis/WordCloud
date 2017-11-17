# WordCloud
A word cloud package for web
## Description
A word cloud using scan-line algorithm which makes word with more weight bigger and closer to the center.
## Ruquirement
    WebStorm 2017.2.5
    Chrome、Firefox or IE9+
## Usage
Open the folder in WebStorm and run. Input keywords and frequencies, then click the update button.  
### Example
  #### words
    Hello,20
    World,10
    Try,25
    Normally,25
    You,15
    Want,30
    More,30
    Words,18
    Who,23
  #### result
![image](https://github.com/thu-vis/WordCloud/blob/master/example_result.png)

  #### example link：
    **[Click me](https://whwang1996.github.io/WordCloud/)**
### Set font
The font scale and font family can be set in the following code in Scripts/word-cloud.js.
```javascript
var wordCloudFontName = "Times New Roman";  //set the font family here. e.g. Georgia, Microsoft YaHei

var weightScale = d3.scalePow()
    .exponent(0.3)
    .domain(d3.extent(words, function (word) { return word.weight }))
    .range([12, 30]); //set the font scale here
```
## External libraries
### d3.js  
**used interface**  
```
select  
append  
selectAll  
data  
enter  
classed  
style  
attr  
text  
scalePow  
exponent  
domain
extent
range
```
### Font.js
**used interface**  
```
fontFamily
src
onload
```
### jquery-3.2.1.js
**used interface**  
```
empty
```
## Kernel Algorithm
  ### objects
**Point**
```javascript
function Point(x, y)
{
    this.X = x; //number
    this.Y = y; //number
}
```
(X,Y) represents a position in the word cloud.  
  
**Rect**
```javascript
function Rect(x, y, width, height)
{
    this.X = x; //number
    this.Y = y; //number
    this.Width = width; //number
    this.Height = height; //number
}
```
Rect represents the shape of a word in the word cloud.  
(X,Y) is the top left corner of the Rect, while Width and Height are the width and height of the Rect.  
  
**SegEvent**
```javascript
function SegEvent(yy)
{
    this.y = yy; //number
    this.upIntervals = new Array(); //Array
    this.downIntervals = new Array(); //Array
}
```
SegEvent is the segment event on the line with y coordinate equal to y.  
y is the y coordinates.  
upIntervals are the spare parts above the y coordinates while downIntervals are the below ones.  
  
**Word**
```javascript
function Word(word, textWidth, textHeight, weight)
{
    this.word = word; //string
    this.textWidth = textWidth; //number
    this.textHeight = textHeight; //number
    this.weight = weight; //number
}
```
Object Word is essential information of a word.  
  
**DataItem**
```javascript
function DataItem(point, word, size)
{
    this.point = point; //Point
    this.word = word; //string
    this.size = size; //number
}
```
DataItem is an item of the result.  
  ### functions
**PlaceRectangles**
```javascript
var PlaceRectangles = function (rects, displaced, prefers)
```
Layout keyword according to the segment event.  
rects: the boundary of keyword  
displaced: whether the rectangle is placed  
prefers: prefered location for each rectangle  
  
**GeneratePreferSegEvent**
```javascript
var GeneratePreferSegEvent = function(yLine)
```
Generate the new segment event in the line of <code>yLine</code>, and return the index of events.  
If the yline is aligned with existed event segment, use the exsited one.  
  
**IntersectInterval**
```javascript
var IntersectInterval = function(orig, other)
```
Intersect interval orig and other. deposite the result in orig interval.  
  
**FillInterval**
```javascript
var FillInterval = function(interval, width, cx)
```
Find the position which is the best place to displace word in the intervals. 
  
**SearchCenterLine**
```javascript
var SearchCenterLine = function (w, hh, centerEventIndex, center)
```
Searching the suitable position on the center line of prefered location.  
  
**UpdateInterval**
```javascript
var UpdateInterval = function(interval, w, x)
```
Update Interval by filled with the rect at x.  
  
**UpdateEvent**
```javascript
var UpdateEvent = function (x, eIndex, width, height, direction)
```
Update the interval array and marked the rectangle region as forbidden.
