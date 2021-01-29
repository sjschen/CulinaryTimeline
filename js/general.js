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
      outString += "..." //dummy
      //spanTermify(startDate["year"], endDate["year"])
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

  // counter to make sure no more than 2 adjacent events go to same side
  var counter = 0;
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
  var yearColor = colors[yearCounter % colors.length];

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
      infoClass = (counter % 2 == 0 ? "leftInfo" : "rightInfo")
      dateClass = (counter % 2 == 0 ? "leftDate" : "rightDate")
    }
    else if (e["start_date"]["year"] != lastYear) {
      counter += 1;
      var infoClass = (counter % 2 == 0 ? "leftInfo" : "rightInfo")
      var dateClass = (counter % 2 == 0 ? "leftDate" : "rightDate")

      // time block generate view
      var elem = "<div class=\"level\">" +
        "<div class=\"infoDot\" style=\"background : " +
yearColor + "\">" +
        "<div class=\"infoDate " +
        dateClass + "\" style=\"background: " +
        yearColor + "\">" +
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
      elem = $(elem)

      container.append(elem);

      //Reset everything
      yearCounter += 1;
      yearColor = colors[yearCounter % colors.length];
      lastYear = e["start_date"]["year"];
      lastDisplayDate = e["sDate"];
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
