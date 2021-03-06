"use strict"

var detailTmpl = $.templates("./templates/hello-detail.html");
var data = {
  world: "Brave New",
  version: 1
};

function incrementWorld() {
  var html = detailTmpl.render(data);
  $("#result").html(html);
  data.version ++;
  data.world += "+";
};

$("#incrementBtn").on("click", incrementWorld);

incrementWorld();
