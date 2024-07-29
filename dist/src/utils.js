"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.round5 = exports.rotationIntensity = exports.indexForSeverity = exports.indexForIntensity = exports.indexForHailProbability = exports.indexForHail = exports.getStormReportMarkerContent = exports.getStormCellPolygon = exports.getStormCellMarker = exports.getStormCellForecast = exports.getSeverity = exports.getPercent = exports.getMagnitude = exports.getIndexString = exports.formatStormCells = exports.colorStormCell = void 0;
var _index = require("@aerisweather/javascript-sdk/dist/utils/index");
var strings = _interopRequireWildcard(require("@aerisweather/javascript-sdk/dist/utils/strings"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const toRadians = degrees => degrees * Math.PI / 180;
const toDegrees = radians => radians * 180 / Math.PI;
const getBearing = (startLat, startLng, endLat, endLng) => {
  const sy = toRadians(startLat);
  const sx = toRadians(startLng);
  const ey = toRadians(endLat);
  const ex = toRadians(endLng);
  const y = Math.sin(ex - sx) * Math.cos(ey);
  const x = Math.cos(sy) * Math.sin(ey) - Math.sin(sy) * Math.cos(ey) * Math.cos(ex - sx);
  let result = Math.atan2(y, x);
  result = toDegrees(result);
  return (result + 360) % 360;
};
/**
 * Storm Cells
 */
const colorStormCell = code => {
  code = code.toLowerCase();
  switch (code) {
    case 'general':
      return '#2ed300';
    case 'hail':
      return '#ebe100';
    case 'rotating':
      return '#f17200';
    case 'tornado':
      return '#ff2600';
    default:
      return '#000000';
  }
};
exports.colorStormCell = colorStormCell;
const indexForSeverity = value => {
  // `value` is in the range 0..10 and needs to be converted to an index value in
  // the range 0..5
  const index = Math.floor(value / 2);
  const labels = ['None', 'Minimal', 'Low', 'Moderate', 'High', 'Extreme'];
  return {
    index,
    label: labels[index]
  };
};
exports.indexForSeverity = indexForSeverity;
const getSeverity = (cell = {}) => {
  const {
    hail,
    tvs,
    traits
  } = cell;
  let severity = 0;
  if ((0, _index.isset)(hail) && hail.probSevere > 0) {
    severity = hail.probSevere / 10;
  }
  if ((0, _index.isset)(traits) && severity < 10) {
    const {
      rotating,
      tornado
    } = traits;
    if (rotating) {
      severity = 7;
    }
    if (tornado) {
      severity = 10;
    }
  }
  if (severity < 8 && tvs === 1) {
    severity = 8;
  }
  return severity;
};
exports.getSeverity = getSeverity;
const getStormCellPolygon = data => {
  const {
    isCurrent
  } = data;
  const {
    isLast
  } = data;
  const type = (0, _index.get)(data, 'traits.type');
  const cone = data;
  if (!cone) {
    return null;
  }
  return {
    className: 'polygon-stormcell',
    fill: {
      color: colorStormCell(type),
      opacity: isCurrent ? 0.5 : 0.25
    },
    stroke: {
      color: colorStormCell(type),
      width: 1
    }
  };
};
exports.getStormCellPolygon = getStormCellPolygon;
const getStormCellMarker = data => {
  const {
    isCurrent
  } = data;
  const {
    isLast
  } = data;
  const type = (0, _index.get)(data, 'traits.type');
  if (isLast) {
    const bearing = data.bearing ? data.bearing : 0;
    return {
      className: 'marker-stormcell',
      svg: {
        hidden: true,
        shape: {
          type: 'path',
          path: 'M51.9,49.1L30.4,11.8L9,49.1C9,49.1,51.9,49.1,51.9,49.1z',
          fill: {
            color: '#ffffff'
          },
          transform: `rotate(${bearing},30,30)`
        },
        viewBox: '0 0 60 60'
      },
      size: [16, 16]
    };
  }
  return {
    className: 'marker-stormcell',
    svg: {
      shape: {
        type: 'circle',
        fill: {
          color: colorStormCell(type)
        },
        stroke: {
          color: '#ffffff',
          width: 2
        }
      }
    },
    size: isCurrent ? [15, 15] : [10, 10]
  };
};
exports.getStormCellMarker = getStormCellMarker;
const getIndexString = index => {
  return `${index}`.replace(/\./g, 'p');
};
exports.getIndexString = getIndexString;
const getPercent = index => {
  return Math.round(index / 5 * 1000) / 10;
};
exports.getPercent = getPercent;
const round5 = x => {
  return Math.ceil(x / 5) * 5;
};
exports.round5 = round5;
const indexForHailProbability = value => {
  if (value >= 90) {
    return {
      index: 5,
      label: `Likely (${value}%)`
    };
  }
  if (value >= 70) {
    return {
      index: 4,
      label: `High (${value}%)`
    };
  }
  if (value >= 50) {
    return {
      index: 3,
      label: `Moderate (${value}%)`
    };
  }
  if (value >= 30) {
    return {
      index: 2,
      label: `Low (${value}%)`
    };
  }
  if (value >= 10) {
    return {
      index: 1,
      label: `Very Low (${value}%)`
    };
  }
  return {
    index: 0,
    label: 'None'
  };
};
exports.indexForHailProbability = indexForHailProbability;
const rotationIntensity = value => {
  if (value >= 20) {
    return {
      index: 5,
      label: 'Inense'
    };
  }
  if (value >= 15) {
    return {
      index: 4,
      label: 'Strong'
    };
  }
  if (value >= 10) {
    return {
      index: 3,
      label: 'Moderate'
    };
  }
  if (value >= 5) {
    return {
      index: 2,
      label: 'Weak'
    };
  }
  if (value < 5) {
    return {
      index: 0,
      label: 'None'
    };
  }
};
//pulled from https://www.weather.gov/lwx/skywarn_hail
exports.rotationIntensity = rotationIntensity;
const indexForHail = value => {
  if (value >= 4.5) {
    return {
      index: 5,
      label: 'Softball Size'
    };
  }
  if (value >= 4.0) {
    return {
      index: 5,
      label: 'Grapefruit Size'
    };
  }
  if (value >= 3.0) {
    return {
      index: 5,
      label: 'Teacup Size'
    };
  }
  if (value >= 2.75) {
    return {
      index: 5,
      label: 'Baseball Size'
    };
  }
  if (value >= 2.5) {
    return {
      index: 5,
      label: 'Tennis Ball Size'
    };
  }
  if (value >= 2.0) {
    return {
      index: 4,
      label: 'Hen Egg Size'
    };
  }
  if (value >= 1.75) {
    return {
      index: 4,
      label: 'Golf Ball Size'
    };
  }
  if (value >= 1.50) {
    return {
      index: 4,
      label: 'Ping Pong Size'
    };
  }
  if (value >= 1.25) {
    return {
      index: 3,
      label: 'Half Dollar Size'
    };
  }
  if (value >= 1.00) {
    return {
      index: 3,
      label: 'Quarter Size'
    };
  }
  if (value >= 0.75) {
    return {
      index: 2,
      label: 'Penny Size'
    };
  }
  if (value >= 0.5) {
    return {
      index: 1,
      label: 'Small Marble Size'
    };
  }
  if (value >= 0.25) {
    return {
      index: 1,
      label: 'Pea Size'
    };
  }
  return {
    index: 0,
    label: 'None'
  };
};
exports.indexForHail = indexForHail;
const indexForIntensity = value => {
  if (value >= 60) {
    return {
      index: 5,
      label: 'Extreme'
    };
  }
  if (value >= 55) {
    return {
      index: 4,
      label: 'Very Heavy'
    };
  }
  if (value >= 50) {
    return {
      index: 3,
      label: 'Heavy'
    };
  }
  if (value >= 35) {
    return {
      index: 2,
      label: 'Moderate'
    };
  }
  if (value >= 20) {
    return {
      index: 1,
      label: 'Light'
    };
  }
  return {
    index: 0,
    label: 'Very Light'
  };
};
exports.indexForIntensity = indexForIntensity;
const formatStormCells = data => {
  if ((0, _index.isArray)(data)) {
    data.forEach(cell => {
      const {
        id,
        ob,
        loc,
        forecast,
        place,
        traits
      } = cell;
      let {
        points
      } = cell;
      const startLat = loc.lat;
      const startLng = loc.long;
      let conePolygon = null;
      points = [Object.assign(Object.assign({
        id
      }, ob), {
        traits,
        forecast,
        place,
        loc: {
          lat: loc.lat,
          lon: loc.long
        },
        isCurrent: true
      })];
      if (forecast && forecast.locs) {
        (forecast.locs || []).forEach(forecastLoc => {
          const endLat = forecastLoc.lat;
          const endLng = forecastLoc.long;
          const trueBearing = getBearing(startLat, startLng, endLat, endLng);
          let isLast = false;
          if (forecast.locs[forecast.locs.length - 1] === forecastLoc) {
            isLast = true;
            points.push(Object.assign(Object.assign({}, ob), {
              timestamp: forecastLoc.timestamp,
              dateTimeISO: forecastLoc.dateTimeISO,
              bearing: trueBearing,
              place,
              forecast,
              traits,
              loc: {
                lat: forecastLoc.lat,
                lon: forecastLoc.long
              },
              isCurrent: false,
              isLast
            }));
          }
        });
      }
      cell.points = points;
    });
  }
  return data;
};
exports.formatStormCells = formatStormCells;
const getStormCellForecast = (aeris, forecast) => {
  const {
    utils
  } = aeris;
  const request = aeris.api();
  const final = [];
  for (let i = 0; i < forecast.locs.length; i += 1) {
    request.addRequest(aeris.api().endpoint('places').place(`${forecast.locs[i].lat},${forecast.locs[i].long}`).fields('place.name,place.state'));
  }
  request.get().then(result => {
    for (let i = 0; i < forecast.locs.length; i += 1) {
      const object = {};
      const place = `
                ${result.data.responses[i].response.place.name},
                ${result.data.responses[i].response.place.state}
            `;
      const time = utils.dates.format(new Date(forecast.locs[i].timestamp * 1000), 'h:mm a, MMM d, yyyy');
      object.place = place;
      object.time = time;
      final.push(object);
    }
  });
  return final;
};
/**
 * Storm Reports
 */
exports.getStormCellForecast = getStormCellForecast;
const getMagnitude = (data = {}) => {
  var _a, _b, _c, _d;
  let magnitude = '';
  if (data.cat === 'snow' && !(0, _index.isEmpty)((_a = data.detail) === null || _a === void 0 ? void 0 : _a.snowIN)) {
    magnitude = `${data.detail.snowIN} inches`;
  }
  if (data.cat === 'wind' && !(0, _index.isEmpty)((_b = data.detail) === null || _b === void 0 ? void 0 : _b.windSpeedMPH)) {
    magnitude = `${data.detail.windSpeedMPH} mph`;
  }
  if (data.cat === 'rain' && !(0, _index.isEmpty)((_c = data.detail) === null || _c === void 0 ? void 0 : _c.rainIN)) {
    magnitude = `${data.detail.rainIN} inches`;
  }
  if (data.cat === 'hail' && !(0, _index.isEmpty)((_d = data.detail) === null || _d === void 0 ? void 0 : _d.hailIN)) {
    magnitude = `${data.detail.hailIN} inches`;
  }
  return magnitude;
};
exports.getMagnitude = getMagnitude;
const getStormReportMarkerContent = data => {
  let details = '';
  if (data.report.cat === 'hail' && !(0, _index.isEmpty)(data.report.detail.hailIN)) {
    details = `
            <div class="row">
                <div class="label">Hail Diameter:</div>
                <div class="value">
                    ${data.report.detail.hailIN.toFixed(2)} in
                </div>
            </div>`;
  }
  if (data.report.cat === 'wind' && !(0, _index.isEmpty)(data.report.detail.windSpeedMPH)) {
    details = `
            <div class="row">
                <div class="label">Wind Speed:</div>
                <div class="value">
                    ${data.report.detail.windSpeedMPH} mph
                </div>
            </div>`;
  }
  if (data.report.cat === 'rain' && !(0, _index.isEmpty)(data.report.detail.rainIN)) {
    details = `
            <div class="row">
                <div class="label">Rainfall:</div>
                <div class="value">
                    ${data.report.detail.rainIN.toFixed(2)} in
                </div>
            </div>`;
  }
  return `
        <div class="content">
            <div class="title">
                ${strings.toName(data.report.type)}
            </div>
            <div class="row">
                <div class="label">Location:</div>
                <div class="value">
                    ${data.report.name}
                </div>
            </div>
            <div class="row">
                <div class="label">Date:</div>
                <div class="value">
                    ${(0, _index.formatDate)(new Date(data.report.timestamp * 1000), 'h:mm a, MMM d, yyyy')}
                </div>
            </div>
            ${details}
            <div class="row">
                <div class="label">Reporter:</div>
                <div class="value">
                    ${data.report.reporter}
                </div>
            </div>
            <div class="row">
                <div class="label">WFO:</div>
                <div class="value">
                    ${data.report.wfo.toUpperCase()}
                </div>
            </div>
            ${!(0, _index.isEmpty)(data.report.comments) ? `
            <div class="row">
                <div class="label">Comments</div>
                <div class="value">
                    ${data.report.comments}
                </div>
            </div>
            ` : ''}
        </div>
    `;
};
exports.getStormReportMarkerContent = getStormReportMarkerContent;