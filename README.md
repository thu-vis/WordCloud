# WordCloud
A word cloud package for web
## Description
A word cloud using scan-line algorithm which makes word with more weight bigger and closer to the center.
## Ruquirement
    WebStorm 2017.2.5
    Chrome、Firefox or IE9+
## External libraries
    bootstrap.js
    d3.js
    Font.js
    jquery-3.2.1.js
    modernizr-2.6.2.js
## Kernal Algorithm
### objects
```javascript
function Point(x, y)
{
    this.X = x; //number
    this.Y = y; //number
}
```
(X,Y) represents a position in the word cloud.
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
```javascript
function SegEvent(yy)
{
    this.y = yy; //number
    this.upIntervals = new Array(); //Array
    this.downIntervals = new Array(); //Array
}
```
SegEvent is the segment event on the line with y coordinates equal to y.
y is the y coordinates.
upIntervals are the spare parts above the y coordinates while downIntervals are the below ones.
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
```javascript
function DataItem(point, word, size)
{
    this.point = point; //Point
    this.word = word; //string
    this.size = size; //number
}
```
DataItem is an item of the result
## Example
### words
    Hello,20
    World,10
    Try,25
    Normally,25
    You,15
    Want,30
    More,30
    Words,18
    Who,23
### result
![image](https://github.com/thu-vis/WordCloud/blob/master/example_result.png)

### example link：
    [click me](https://whwang1996.github.io/WordCloud/)
    
