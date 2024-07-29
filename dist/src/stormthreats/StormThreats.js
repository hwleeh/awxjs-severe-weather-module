"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _MapSourceModule = _interopRequireDefault(require("@aerisweather/javascript-sdk/dist/modules/MapSourceModule"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class StormThreats extends _MapSourceModule.default {
  get id() {
    return 'stormthreats';
  }
  source() {
    const properties = {
      root: 'features',
      path: 'geometry'
    };
    return {
      type: 'vector',
      requiresBounds: true,
      data: {
        service: () => this.request,
        properties
      },
      style: {
        polygon: () => ({
          fill: {
            color: '#ffa500',
            opacity: 0.85
          }
        })
      }
    };
  }
  controls() {
    return {
      value: this.id,
      title: 'Storm Zones',
      controls: {
        settings: [{
          type: 'opacity'
        }]
      },
      filter: true,
      multiselect: false,
      segments: [{
        value: 'threat',
        title: 'Threatening'
      }, {
        value: 'hail',
        title: 'Hail'
      }, {
        value: 'rotating',
        title: 'Rotating'
      }, {
        value: 'tornado',
        title: 'Tornadic'
      }, {
        value: 'all',
        title: 'All Storms'
      }]
    };
  }
  onInit() {
    const request = this.account.api().endpoint('stormcells/summary').format('geojson').limit(1).filter('geo');
    this.request = request;
  }
}
var _default = exports.default = StormThreats;
module.exports = exports.default;