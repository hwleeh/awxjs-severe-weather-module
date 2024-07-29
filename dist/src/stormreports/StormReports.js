"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _MapSourceModule = _interopRequireDefault(require("@aerisweather/javascript-sdk/dist/modules/MapSourceModule"));
var _strings = require("@aerisweather/javascript-sdk/dist/utils/strings");
var _utils = require("@aerisweather/javascript-sdk/dist/utils");
var _utils2 = require("../utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const color = code => {
  code = code.toLowerCase();
  switch (code) {
    case 'avalanche':
      return '#639fec';
    case 'blizzard':
      return '#4100e2';
    case 'flood':
      return '#117d00';
    case 'fog':
      return '#767676';
    case 'ice':
      return '#e100e2';
    case 'hail':
      return '#62def7';
    case 'lightning':
      return '#8c8c8c';
    case 'rain':
      return '#38e600';
    case 'snow':
      return '#175cef';
    case 'tides':
      return '#40db83';
    case 'tornado':
      return '#c50000';
    case 'wind':
      return '#d8cc00';
    default:
      return '#000000';
  }
};
class StormReports extends _MapSourceModule.default {
  get id() {
    return 'stormreports';
  }
  source() {
    return {
      type: 'vector',
      requreBounds: true,
      data: {
        service: () => this.request
      },
      style: {
        marker: data => {
          var _a;
          const type = (_a = data === null || data === void 0 ? void 0 : data.report) === null || _a === void 0 ? void 0 : _a.cat;
          return {
            className: 'marker-stormreport',
            svg: {
              shape: {
                type: 'circle',
                fill: {
                  color: color(type)
                },
                stroke: {
                  color: '#ffffff',
                  width: 2
                }
              }
            },
            size: [14, 14]
          };
        }
      }
    };
  }
  controls() {
    return {
      value: this.id,
      title: 'Storm Reports'
    };
  }
  infopanel() {
    return {
      views: [{
        data: data => {
          const payload = data === null || data === void 0 ? void 0 : data.stormreports;
          if (!payload) {
            return;
          }
          return payload;
        },
        renderer: data => {
          var _a, _b, _c;
          if (!data) return;
          const rows = [{
            label: 'Location',
            value: (_a = data.report) === null || _a === void 0 ? void 0 : _a.name
          }, {
            label: 'Description',
            value: (0, _strings.ucwords)((_b = data.report) === null || _b === void 0 ? void 0 : _b.type)
          }, {
            label: 'Magnitude',
            value: (0, _utils2.getMagnitude)(data.report)
          }, {
            label: 'Report Time',
            value: (0, _utils.formatDate)(new Date(((_c = data.report) === null || _c === void 0 ? void 0 : _c.timestamp) * 1000), 'h:mm a, MMM d, yyyy')
          }, {
            label: 'Remarks',
            value: data.report.comments || ''
          }];
          const content = rows.reduce((result, row) => {
            result.push(`
                                <div class="awxjs__ui-row">
                                    <div class="awxjs__ui-expand label">${row.label}</div>
                                    <div class="awxjs__ui-expand value">${row.value}</div>
                                </div>
                            `);
            return result;
          }, []).join('\n');
          return `
                        <div class="awxjs__app__ui-panel-info__table">
                            ${content}
                        </div>
                    `;
        }
      }]
    };
  }
  onMarkerClick(marker, data) {
    if (!data) return;
    const {
      id,
      report
    } = data;
    const type = (0, _strings.ucwords)(report.type);
    this.showInfoPanel(`${type}`).load({
      p: id
    }, {
      stormreports: data
    });
  }
  onInit() {
    const request = this.account.api().endpoint('stormreports');
    this.request = request;
  }
}
var _default = exports.default = StormReports;
module.exports = exports.default;