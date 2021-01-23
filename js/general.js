// settings
var DIVIDERS = false; // false for no year dividers; true for year dividers
var DATA_FILE = "./projects.json";
var isMobile = true;
var colors = ["#ca5454", "#e8a040", "#fcdd75", "#7e92b9", "#ebc59c"];

// function to format date to Month Date, Year
function formatDate(date) {
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
  }
  //monthNames[monthIndex] +  ' ' + day + ', ' + year;
  return outString;
}

// function to convert date strings to date objects
function convertDates(data) {
  for (i = 0; i < data.length; i++) {
    var original = data[i]["start_date"];
    var dateTime = new Date();

    if ("year" in original && original["year"]) {
      dateTime.setFullYear(original["year"]);
      if ("month" in original && original["month"]) {
        dateTime.setMonth(original["month"]);
        if ("day" in original && original["day"]) {
          dateTime.setDate(original["day"]);
        }
      }
    }

    data[i]["date"] = dateTime;
    data[i]["sDate"] = formatDate(dateTime);
  }
  return data;
}

function elementToHtml(data, myColor, infoClass, dateClass) {
  // generate html code for links section
  links = "<h3>"
  data["media"]["url"].forEach(function(link) {
    //refer.
    //data["text"]["headline"]
    links += "<span><a href=\"" + link[1] +
      "\"  target=\"_blank\" rel=\"noopener noreferrer\" >" +
      link[0] + "</a></span>";
  });
  if (data["media"]["url"].length == 0) {
    links += "None";
  }
  links += "</h3>";

  // time block generate view
  var elem = "<div class=\"level\">" +
    "<div class=\"infoDot\" style=\"background : " +
    myColor + "\">" +
    "<div class=\"infoDate " +
    dateClass + "\" style=\"background: " +
    myColor + "\">" +
    data["sDate"] + "</div>" +
    "</div>" +
    "<div class=\"info " + infoClass + "\">";

  if (data["text"]["text"] !== "") {
    elem += "<p>" + data["text"]["text"] + "</p>";
  }

  if (data["media"]["url"].length !== 0) {
    elem += links
  }

  elem += "</div>" + "</div>";

  return elem;
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
  var yearColor = colors[yearCounter % colors.length];

  var titleElem = "<div class=\"title\" style=\"" +
    "background: " + yearColor + "\">" +
    "<a href=\"" + "http://foodtimeline.org" + //This is a hack
    "\" target=\"_blank\" rel=\"noopener noreferrer\" >" +
    titleText + "</a>" + "</div>";
  container.append(titleElem);

  // loop on each event to be added
  data.forEach(function(e) {
    var infoClass = (counter % 2 == 0 ? "leftInfo" : "rightInfo")
    var dateClass = (counter % 2 == 0 ? "leftDate" : "rightDate")
    counter += 1;

    // add generated html code to document
    if (e["start_date"]["year"] != lastYear) {
      yearCounter += 1;
      lastYear = e["start_date"]["year"];
      yearColor = colors[yearCounter % colors.length];

      if (DIVIDERS) {
        var dividerElem = "<div class=\"divider\" style=\"" +
          "background: " + yearColor + "\" id=\"" +
          lastYear + "\">" +
          lastYear + "</div>";
        container.append(dividerElem);
      }
    }

    var elem = elementToHtml(e, yearColor, infoClass, dateClass);
    elem = $(elem)
    container.append(elem);
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
