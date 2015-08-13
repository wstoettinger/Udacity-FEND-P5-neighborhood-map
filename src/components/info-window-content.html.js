var SHADOW_HTML = '<!-- the content template of the infoWindow -->\
<div id="info-content" data-bind="if:place">\
  <div class="gm-iw gm-sm" data-bind="with:place">\
    <div class="gm-title" data-bind="text:name"></div>\
    <div class="gm-basicinfo">\
      <div class="gm-addr" data-bind="text:vicinity"></div>\
      <div class="gm-website" data-bind="if:website"><a target="_blank" data-bind="attr: {href:website}, text:websiteText"></a></div>\
      <div class="gm-phone" data-bind="text:formatted_phone_number"></div>\
    </div>\
    <div class="gm-photos" style="display: none;">\
      <span class="gm-wsv" jsdisplay="!photoImg" jsvalues=".onclick:svClickFn" jstcache="6">\
        <img jsvalues=".src:svImg" width="204" height="50" jstcache="11"><label class="gm-sv-label" jstcache="0">Street View</label>\
      </span>\
      <span class="gm-sv" jsdisplay="photoImg" jsvalues=".onclick:svClickFn" jstcache="7">\
        <img jsvalues=".src:svImg" width="100" height="50" jstcache="11"><label class="gm-sv-label" jstcache="0">Street View</label>\
      </span>\
      <span class="gm-ph" jsdisplay="photoImg" jstcache="8"><a jsvalues=".href:i.result.url;" target="_blank" jstcache="12">\
        <img jsvalues=".src:photoImg" width="100" height="50" jstcache="14"><label class="gm-ph-label" jstcache="0">Fotos</label></a>\
      </span>\
    </div>\
    <div class="gm-rev" >\
      <span data-bind="if:rating">\
        <span class="gm-numeric-rev" data-bind="text:rating"></span>\
        <div class="gm-stars-b">\
          <div class="gm-stars-f" data-bind="style: { width: getStarWidth } "></div>\
        </div>\
      </span>\
      <span data-bind="if:url"><a target="_blank" data-bind="attr: {href:url}">see more</a></span>\
    </div>\
  </div>\
</div>';

module.exports = SHADOW_HTML;

/*
var InfoWindowContentProto = Object.create(HTMLDivElement.prototype);

InfoWindowContentProto.createdCallback = function () {
  var shadow = this.createShadowRoot();
  shadow.innerHTML = SHADOW_HTML;
};

var InfoWindowContent = document.registerElement("info-window-content", {
  prototype: InfoWindowContentProto,
  extends: "div"
}); */