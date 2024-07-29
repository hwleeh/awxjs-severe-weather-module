"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ModuleGroup = _interopRequireDefault(require("@aerisweather/javascript-sdk/dist/modules/ModuleGroup"));
var _utils = require("@aerisweather/javascript-sdk/dist/utils");
var _strings = require("@aerisweather/javascript-sdk/dist/utils/strings");
var _StormCells = _interopRequireDefault(require("./stormcells/StormCells"));
var _StormReports = _interopRequireDefault(require("./stormreports/StormReports"));
var _LightningThreats = _interopRequireDefault(require("./lightningthreats/LightningThreats"));
var _StormThreats = _interopRequireDefault(require("./stormthreats/StormThreats"));
var _Warnings = _interopRequireDefault(require("./warnings/Warnings"));
var _utils2 = require("./utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var __awaiter = void 0 && (void 0).__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
/* eslint-disable max-len */

class Severe extends _ModuleGroup.default {
  constructor(args) {
    super();
    this._showThreats = false;
    this._opts = {};
    this._groupTitle = 'Severe Weather';
    if (args) {
      this._opts = args;
      this._showThreats = args.showThreats || false;
      this._groupTitle = args.groupTitle || 'Severe Weather';
    }
  }
  get id() {
    return 'severe';
  }
  load() {
    return __awaiter(this, void 0, void 0, function* () {
      return new Promise(resolve => {
        this._modules = [new _Warnings.default(), new _StormCells.default(), new _StormThreats.default(), new _LightningThreats.default(), new _StormReports.default()];
        resolve(this._modules);
      });
    });
  }
  controls() {
    var _a;
    let buttons = ((_a = this.modules) === null || _a === void 0 ? void 0 : _a.reduce((acc, m) => {
      if (m && typeof m.controls === 'function') {
        acc.push(m.controls());
      }
      return acc;
    }, [])) || [];
    if (this._opts && this._opts.buttons) {
      buttons = this._opts.buttons.map(button => {
        buttons.find(dict => dict.value === button);
      }).filter(button => button !== undefined);
    }
    let response = {
      buttons
    };
    if (this._groupTitle) {
      response.title = this._groupTitle;
    }
    return response;
  }
  initialize(account, app, map) {
    super.initialize(account, app, map);
    if (!this._showThreats) return;
    // do custom info panel stuff...
    const localWeatherConfig = {
      request: () => {
        const request = this.account.api().endpoint('threats');
        this._request = request;
        return request;
      },
      views: [{
        requresData: true,
        // Location info and threat phrase
        data: data => data,
        renderer: data => {
          if (!data[0]) return;
          const {
            place
          } = data[0];
          return `
                        <div class="awxjs__app__ui-panel-info__place">
                            <div class="awxjs__app__ui-panel-info__place-name">
                                ${(0, _strings.toName)(place.name)}, ${place.state.toUpperCase()}
                            </div>
                            <div class="awxjs__app__ui-panel-info__obs-timestamp" style="font-size:14px">
                                ${(0, _utils.formatDate)(new Date(data[0].periods[0].timestamp * 1000), 'h:mm a, MMM d, yyyy')}
                            </div>
                        </div>
                    `;
        }
      }, {
        title: 'Active Threats',
        renderer: data => {
          if (!data[0]) return;
          const threatPhrase = data[0].periods[0].storms ? data[0].periods[0].storms.phrase.long : 'No Immediate Threats';
          return `
                        <div class="awxjs__app__ui-panel-info__threats">
                            <div class="awxjs__app__ui-panel-info__threats-row">${threatPhrase}</div>
                        </div>
                    `;
        }
      }, {
        requiresData: true,
        data: data => (0, _utils.get)(data, '[0].periods[0].storms'),
        renderer: data => {
          const intensity = (0, _utils2.indexForIntensity)(data.dbz.max);
          let hailSize = {};
          let rotationScale = {};
          rotationScale = (0, _utils.isset)(data.mda) ? (0, _utils2.rotationIntensity)(data.mda.max) : {
            index: 0,
            label: 'None'
          };
          hailSize = (0, _utils.isset)(data.hail) ? (0, _utils2.indexForHail)(data.hail.maxSizeIN) : {
            index: 0,
            label: 'None'
          };
          const hailProb = (0, _utils.isset)(data.hail) ? (0, _utils2.indexForHailProbability)(data.hail.prob) : {
            index: 0,
            label: 'None'
          };
          const rows = [{
            type: 'Precip Intensity',
            indexString: (0, _utils2.getIndexString)(intensity.index),
            percent: (0, _utils2.getPercent)(intensity.index),
            label: intensity.label
          }, {
            type: 'Max Hail Size',
            indexString: (0, _utils2.getIndexString)(hailSize.index),
            percent: (0, _utils2.getPercent)(hailSize.index),
            label: hailSize.label
          }, {
            type: 'Hail Probability',
            indexString: (0, _utils2.getIndexString)(hailProb.index),
            percent: (0, _utils2.getPercent)(hailProb.index),
            label: hailProb.label
          }, {
            type: 'Rotation',
            indexString: (0, _utils2.getIndexString)(rotationScale.index),
            percent: (0, _utils2.getPercent)(rotationScale.index),
            label: rotationScale.label
          }];
          return rows.reduce((result, row) => {
            result.push(`<div class="awxjs__app__ui-panel-info__hazard awxjs__ui-cols align-center">
                            <div class="awxjs__app__ui-panel-info__hazard-label">
                                ${row.type}
                            </div>
                            <div class="awxjs__app__ui-panel-info__hazard-bar">
                                <div class="awxjs__app__ui-panel-info__hazard-bar-inner">
                                    <div
                                        class="awxjs__app__ui-panel-info__hazard-bar-progress
                                            awxjs__app__ui-panel-info__hazard-indice-fill-${row.indexString}"
                                        style="width:${row.percent}%;"
                                    ></div>
                                </div>
                            </div>
                            <div
                                class="awxjs__app__ui-panel-info__hazard-value
                                    awxjs__app__ui-panel-info__hazard-value-${row.indexString}"
                                >${row.label}</div>
                            </div>`);
            return result;
          }, []).join('\n');
        }
      }, {
        requiresData: true,
        data: data => (0, _utils.get)(data, '[0].periods[0].storms'),
        renderer: data => {
          const rows = [{
            label: 'Approaching',
            value: data.approaching ? 'Yes' : 'No'
          }, {
            label: 'Tornadoes',
            value: data.tornadic ? 'Possible' : 'No'
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
      }, {
        title: 'Affecting Storms',
        requiresData: true,
        data: data => (0, _utils.get)(data, '[0].periods[0].storms'),
        renderer: data => `
                    <div class="awxjs__app__ui-panel-info__table">
                        <div class="awxjs__ui-row">
                            <div class="awxjs__ui-expand label">Location</div>
                            <div class="awxjs__ui-expand value">
                                ${data.distance.avgMI} mi
                                ${data.direction.from} (${data.direction.fromDEG}&deg;)
                            </div>
                        </div>
                        <div class="awxjs__ui-row">
                            <div class="awxjs__ui-expand label">Movement</div>
                            <div class="awxjs__ui-expand value">
                                ${data.direction.to}
                                at ${(0, _utils2.round5)(data.speed.avgMPH)} mph
                            </div>
                        </div>
                    </div>
                `
      }]
    };
    this.app.panels.info.setContentView('threats', localWeatherConfig);
    this.app.map.on('click', e => {
      this.app.showInfoAtCoord(e.data.coord, 'threats', 'Storm Threats');
    });
  }
}
var _default = exports.default = Severe;
module.exports = exports.default;