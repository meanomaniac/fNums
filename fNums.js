var request =require('request');
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "pocu4.ceixhvsknluf.us-east-2.rds.amazonaws.com",
  post: "3306",
  user: "SYSTEM",
  password: "mysqlmysql",
  database : 'pocu4'
});
// f Likes between 200 K to 1 Mil
for (var j=597; j<1243; j++) {
  var newURl = 'https://data.quintly.com/facebook-page-ranking/?category=0&paging='+j+'&sorting=likes&sortingDirection=desc';
  var mainHtmlText;
  request(newURl, function (error, response, body) {
      // console.log(body);
      mainHtmlText = body;
      if (!error && response.statusCode == 200) {
        var startIndices = getIndicesOf("<tr>", mainHtmlText);
        var endIndices = getIndicesOf("</tr>", mainHtmlText);
        var trHtmlTextArray = getBetweenText(startIndices, endIndices, mainHtmlText);

        var tdArray = [];
        for (var i=0; i<trHtmlTextArray.length; i++) {
          var startIndices2 = getIndicesOf("<td>", trHtmlTextArray[i]);
          var endIndices2 = getIndicesOf("</td>", trHtmlTextArray[i]);
          var newTdArray = getBetweenText(startIndices2, endIndices2, trHtmlTextArray[i]);
          if (newTdArray.length) {
            tdArray.push(newTdArray);
          }
        }
        // console.log(tdArray);
        writeToDB(tdArray);
      }
    });
  }

// https://stackoverflow.com/questions/3410464/how-to-find-indices-of-all-occurrences-of-one-string-in-another-in-javascript
  function getIndicesOf(searchStr, str, caseSensitive) {
      var searchStrLen = searchStr.length;
      if (searchStrLen == 0) {
          return [];
      }
      var startIndex = 0, index, indices = [];
      if (!caseSensitive) {
          str = str.toLowerCase();
          searchStr = searchStr.toLowerCase();
      }
      while ((index = str.indexOf(searchStr, startIndex)) > -1) {
          indices.push(index);
          startIndex = index + searchStrLen;
      }
      return indices;
  }

  function getBetweenText(startIndices, endIndices, string) {
    var betweenTextArray = [];
    for (var i=0; i<startIndices.length; i++) {
    // for (var i=1; i<2; i++) {
      betweenTextArray.push(string.substring(startIndices[i]+4,endIndices[i]));
    }
    return betweenTextArray;
  }

function writeToDB(queryParameters) {
  var query = "INSERT INTO quintlyNums (position, imgUrl, pageName, likes, thirdayDaysPm, pm, ptat, ptatPerc, pmThirtyDays, pmPerc) VALUES  ?;"
  con.query(query, [queryParameters], function (err, result) {
  if (err) {}
  });
}
