// settings
var DATA_FILE = "./projects.json";
var colors = [getComputedStyle(document.documentElement).getPropertyValue('--colour0'),
    getComputedStyle(document.documentElement).getPropertyValue('--colour1'),
    getComputedStyle(document.documentElement).getPropertyValue('--colour2'),
    getComputedStyle(document.documentElement).getPropertyValue('--colour3')];

// function to format date to Month Date, Year
function formatDate(date, startDate, endDate) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];
  var outString = date.getFullYear();
  if (date.getMonth()) {
    outString += ' ' + monthNames[date.getMonth()];
    //Day only if there is a month
    if (date.getDate()) {
      outString += ' ' + date.getDate();
    }
  }else{ //year only date sometimes need mods to be more readable
    var startYear = parseInt(startDate["year"]);

    if (endDate){ //The named decades and century
      var span = parseInt(endDate["year"]) - startYear;
      if (span == 99){
        var century = ((startYear / 100) + 1).toString();
        var onesDigit = century.charAt(century.length - 1)
        var eth = "th";
        if (onesDigit == "1"){
          eth = "st";
        }else if (onesDigit == "2"){
          eth = "nd";
        }else if (onesDigit == "3"){
          eth = "rd";
        }
        outString = century + eth + " century"
      } else if (span == 9){
        outString = startYear + "s";
      } else{
        outString = startDate["year"] + " - " + endDate["year"];
      }
    }else if (startYear <= -20000){
      outString = "Ancient"
    }
    else if (startYear <  0){
      outString = (-startYear).toString() + "BC";
    }
  }
  //monthNames[monthIndex] +  ' ' + day + ', ' + year;
  return outString;
}

// function to convert date strings to date objects
function convertDates(data) {
  for (i = 0; i < data.length; i++) {
    var startDate = data[i]["start_date"];
    var dateTime = new Date();

    if ("year" in startDate && startDate["year"]) {
      dateTime.setFullYear(startDate["year"]);
      if ("month" in startDate && startDate["month"]) {
        dateTime.setMonth(startDate["month"]);
        if ("day" in startDate && startDate["day"]) {
          dateTime.setDate(startDate["day"]);
        }
      }
    }

    data[i]["date"] = dateTime;
    data[i]["sDate"] = formatDate(dateTime, startDate, data[i]["end_date"]);
  }
  return data;
}

function makeLinks(data) {
  // generate html code for links section
  var links = "<h3>"
  data["media"]["url"].forEach(function(link) {
    //refer.
    //data["text"]["headline"]
    if (link[1] == ""){
      links += "<span> " + link[0] + " </span>";
    }else{
      links += "<span><a href=\"" + link[1] +
        "\"  target=\"_blank\" rel=\"noopener noreferrer\" >" +
        link[0] + "</a></span>";
    }
  });
  if (data["media"]["url"].length == 0) {
    links += "None";
  }
  links += "</h3>";

  return links;
}

function makeElement( links, lastGroup, lastDisplayDate){
  if (lastGroup == "ingredient"){
    infoClass = "leftInfo" ;
    dateClass = "leftDate";
    yearColor = colors[1];
    yearBgColor = colors[2];

  }else{
    infoClass = "rightInfo" ;
    dateClass = "rightDate";
    yearColor = colors[2];
    yearBgColor = colors[1];
  }

  // time block generate view
  var elem = "<div class=\"level\">" +
    "<div class=\"infoDot\">" +
    "<div class=\"infoDate " + dateClass + "\" style=\"background: " + yearBgColor + ";" + "color: " + yearColor + "\">" +
    lastDisplayDate + "</div>" +
    "</div>" +
    "<div class=\"info " + infoClass + "\">";
    elem += links
  elem += "</div>" + "</div>";

  return elem;
}

function loadedData(data, titleText, chrono) {
  var container = $("#container");

  // change date strings to date objects
  data = convertDates(data);

  if(chrono){
    titleColor = colors[1];
    titleBgColor = colors[2];
  }else{
    titleColor = colors[2];
    titleBgColor = colors[1];
  }

  for (var i=0; i<data.length; i++)
  {
      data[i].index = i;
  }

  // sort events by date
  data.sort(function(a, b) {
    if (chrono){
      return a["date"] - b["date"] || a.index - b.index;
    }
    else{
      return b["date"] - a["date"] || a.index - b.index;
    }
  });

  container.append("<div id=\"timeline\"></div>");

  var lastYear = null;
  var lastDisplayDate = null;
  var lastGroup = null;

  var titleElem = "<div class=\"title\" style=\"" +
    "background: " + titleBgColor + "\">" +
    "<a href=\"" + "http://foodtimeline.org\"" + //This is a hack
    "style= \"color:" + titleColor +
    "\" target=\"_blank\" rel=\"noopener noreferrer\" >" +
    titleText + "</a>" + "</div>";
  container.append(titleElem);

  var headingElem = "<div class=\"level\">" +
  "<div class=\"heading headLeft\" style=\" background: " + titleBgColor + ";" + "color: " + titleColor + "\"> 🠗 Ingredients </div>" +
  "<div class=\"heading headRight\" style=\" background: " + titleBgColor +  ";" + "color: " + titleColor +  "\"> Recipes 🠗 </div>" + "</div>";
  container.append(headingElem);

  container.append("<div class=\"level\"></div>");

  var links = "";

  // loop on each event to be added
  data.forEach(function(e) {
    if (lastYear == null){
      lastYear = e["start_date"]["year"];
      lastDisplayDate = e["sDate"];
      lastGroup = e["group"];
    }
    else if (e["start_date"]["year"] != lastYear || e["group"] != lastGroup) {
      container.append($(makeElement(links, lastGroup, lastDisplayDate)));

      lastYear = e["start_date"]["year"];
      lastDisplayDate = e["sDate"];
      lastGroup = e["group"];
      links = ""
    }

    if (chrono){
      links += "<p>" + makeLinks(e) + "</p>";
    }else{
      links = "<p>" + makeLinks(e) + "</p>" + links;
    }
  });
  container.append($(makeElement(links, lastGroup, lastDisplayDate)));
  console.log("Is chrono: " + chrono);
}


function renderTimeline(){
  // Get the checkbox
  var checkBox = document.getElementById("chrono");

  $("#container").empty();

  $.getJSON(DATA_FILE)
    .done(function(d) {
      loadedData(d["events"], d["title"]["text"]["text"], !checkBox.checked);
      $("#loadingMessage").remove();
    })
    .fail(function(jqxhr, textStatus, error) {
      console.log("Couldn't load " + file);
      console.log("Status: " + textStatus);
      console.log("Error: " + error);
    })
}


$(function() {
  renderTimeline();
});
