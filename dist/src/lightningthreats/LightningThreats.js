"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _MapSourceModule = _interopRequireDefault(require("@aerisweather/javascript-sdk/dist/modules/MapSourceModule"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class LightningThreats extends _MapSourceModule.default {
  get id() {
    return 'lightningthreats';
  }
  source() {
    const properties = {
      root: 'features',
      path: 'geometry'
    };
    return {
      type: 'vector',
      requreBounds: true,
      data: {
        service: () => this.request,
        properties
      },
      style: {
        polygon: () => ({
          fill: {
            color: '#f3e9b2',
            opacity: 0.85
          }
        })
      }
    };
  }
  controls() {
    return {
      value: this.id,
      title: 'Lightning Zones',
      controls: {
        settings: [{
          type: 'opacity'
        }]
      }
    };
  }
  onInit() {
    const request = this.account.api().endpoint('lightning/summary').format('geojson').filter('geo').from('-15minutes');
    this.request = request;
  }
}
var _default = exports.default = LightningThreats;
module.exports = exports.default;