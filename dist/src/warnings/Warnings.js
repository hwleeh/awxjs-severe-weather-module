"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _MapSourceModule = _interopRequireDefault(require("@aerisweather/javascript-sdk/dist/modules/MapSourceModule"));
var utils = _interopRequireWildcard(require("@aerisweather/javascript-sdk/dist/utils/index"));
var _strings = require("@aerisweather/javascript-sdk/dist/utils/strings");
var _utils = require("@aerisweather/javascript-sdk/dist/utils");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Warnings extends _MapSourceModule.default {
  get id() {
    var _a;
    return ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.id) || 'warnings';
  }
  source() {
    const properties = {
      root: 'features',
      id: 'properties.details.loc',
      category: 'properties.details.cat',
      path: 'geometry'
    };
    return {
      type: 'vector',
      data: {
        service: () => this.request,
        properties
      },
      style: {
        polygon: item => ({
          fill: {
            color: `#${utils.get(item, 'properties.details.color')}`,
            opacity: 0.75,
            weight: 3
          },
          stroke: {
            color: `#${utils.get(item, 'properties.details.color')}`,
            width: 2,
            weight: 3,
            adjustOpacity: false
          }
        })
      }
    };
  }
  controls() {
    return {
      value: this.id,
      title: 'Severe Warnings',
      controls: {
        settings: [{
          type: 'opacity'
        }]
      }
    };
  }
  infopanel() {
    return {
      views: [{
        data: data => {
          if (!(0, _utils.isset)(data)) return;
          data = data.alert.details;
          return data;
        },
        renderer: data => {
          if (!(0, _utils.isset)(data)) return;
          return `<div class="alert">${(data.body || '').replace(/\n/g, '<br>')}</div>`;
        }
      }]
    };
  }
  onInit() {
    const request = this.account.api().endpoint('advisories').action('search').filter('usa').query('type:TO.W;type:SV.W;type:FF.W;').fields('details.type,details.name,details.body,details,geoPoly').limit(100).format('geojson');
    this.request = request;
  }
  onShapeClick(shape, data) {
    const source = data.awxjs_source;
    const props = data.properties || {};
    if (source === 'warnings') {
      this.showInfoPanel(props.details.name).load(`${(0, _strings.toName)(props.details.name)}`, {
        alert: props
      });
    }
  }
}
var _default = exports.default = Warnings;
module.exports = exports.default;