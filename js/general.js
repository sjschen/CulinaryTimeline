// settings
var DIVIDERS = false; // false for no year dividers; true for year dividers
var DATA_FILE = "./projects.json";
var isMobile = true;
var colors = ["#ca5454", "#e8a040", "#fcdd75", "#7e92b9", "#ebc59c"];

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
    if (endDate){
      var startYear = parseInt(startDate["year"]);
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
    }else{
      var yearInt = parseInt(startDate["year"]);
      if (yearInt <= -20000){
        outString = "Ancient"
      }
      else if (yearInt <  0){
        outString = (-yearInt).toString() + "BC";
      }
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

function loadedData(data, titleText) {
  var container = $("#container");

  var yearCounter = 0;

  // change date strings to date objects
  data = convertDates(data);

  // sort events by date
  data.sort(function(a, b) {
    return a["date"] < b["date"];
  });

  container.append("<div id=\"timeline\"></div>");

  var lastYear = null;
  var lastDisplayDate = null;
  var lastGroup = null;
  var yearColor = colors[0]; //[yearCounter % colors.length];

  var titleElem = "<div class=\"title\" style=\"" +
    "background: " + yearColor + "\">" +
    "<a href=\"" + "http://foodtimeline.org" + //This is a hack
    "\" target=\"_blank\" rel=\"noopener noreferrer\" >" +
    titleText + "</a>" + "</div>";
  container.append(titleElem);

  var links = "";

  // loop on each event to be added
  data.forEach(function(e) {
    if (lastYear == null){
      lastYear = e["start_date"]["year"];
      lastDisplayDate = e["sDate"];
      lastGroup = e["group"];
    }
    else if (e["start_date"]["year"] != lastYear || e["group"] != lastGroup) {
      if (lastGroup == "recipe"){
        infoClass = "leftInfo" ;
        dateClass = "leftDate";
      }else{
          infoClass = "rightInfo" ;
          dateClass = "rightDate";
      }

      // time block generate view
      var elem = "<div class=\"level\">" +
        "<div class=\"infoDot\" style=\"background : " + yearColor + "\">" +
        "<div class=\"infoDate " + dateClass + "\" style=\"background: " + yearColor + "\">" +
        lastDisplayDate + "</div>" +
        "</div>" +
        "<div class=\"info " + infoClass + "\">";

      if (e["text"]["text"] !== "") {
        elem += "<p>" + e["text"]["text"] + "</p>";
      }
      if (e["media"]["url"].length !== 0) {
        elem += links
      }
      elem += "</div>" + "</div>";

      container.append($(elem));

      //Reset everything
      if(e["start_date"]["year"] != lastYear ){
        yearCounter += 1;
        yearColor = colors[yearCounter % colors.length];
      }
      lastYear = e["start_date"]["year"];
      lastDisplayDate = e["sDate"];
      lastGroup = e["group"];
      links = ""
      if (DIVIDERS) {
        var dividerElem = "<div class=\"divider\" style=\"" +
          "background: " + yearColor + "\" id=\"" +
          lastYear + "\">" +
          lastYear + "</div>";
        container.append(dividerElem);
      }
    }

    links = "<p>" + makeLinks(e) + "</p>" + links;
  });
}

$(function() {
  // get window dimensions
  windowDim = {
    x: $(window).width(),
    y: $(window).height()
  };

  console.log("win: "+ windowDim.x + " " + windowDim.y);
  if (windowDim.x > 500) {
    isMobile = true;
  }

  $.getJSON(DATA_FILE)
    .done(function(d) {
      loadedData(d["events"], d["title"]["text"]["text"]);
      $("#loadingMessage").remove();
    })
    .fail(function(jqxhr, textStatus, error) {
      console.log("Couldn't load " + file);
      console.log("Status: " + textStatus);
      console.log("Error: " + error);
    })
});
