"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _MapSourceModule = _interopRequireDefault(require("@aerisweather/javascript-sdk/dist/modules/MapSourceModule"));
var _utils = require("@aerisweather/javascript-sdk/dist/utils");
var _strings = require("@aerisweather/javascript-sdk/dist/utils/strings");
var _units = require("@aerisweather/javascript-sdk/dist/utils/units");
var _utils2 = require("../utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class StormCells extends _MapSourceModule.default {
  get id() {
    return 'stormcells';
  }
  source() {
    const properties = {
      id: 'id',
      path: 'points',
      category: 'traits.type',
      timestamp: 'ob.timestamp',
      points: 'points'
    };
    return {
      type: 'vector',
      requiresBounds: true,
      data: {
        service: () => this.request,
        properties,
        formatter: data => (0, _utils2.formatStormCells)(data)
      },
      style: {
        marker: data => (0, _utils2.getStormCellMarker)(data),
        polyline: () => ({
          stroke: {
            color: '#ffffff',
            width: 3
          }
        })
      }
    };
  }
  infopanel() {
    return {
      request: data => {
        const locations = (0, _utils.get)(data, 'stormcells.forecast.locs') || [];
        if (!locations || locations.length === 0) {
          return;
        }
        const request = this.account.api();
        locations.forEach(({
          lat,
          long
        }) => {
          const request_ = this.account.api().endpoint('places').place(`${lat},${long}`).radius('10mi').fields('place.name,place.state');
          request.addRequest(request_);
        });
        return request;
      },
      views: [{
        // place info
        requiresData: true,
        data: data => {
          if (!(0, _utils.get)(data, 'stormcells')) return;
          return data;
        },
        renderer: data => {
          if (!data) return '';
          const {
            stormcells: {
              place,
              movement,
              traits = {}
            },
            metric
          } = data;
          const placeName = `${(0, _strings.toName)(place.name)}, ${place.state.toUpperCase()}`;
          const movementBlock = (0, _utils.isset)(movement) ? `
                            <div class="awxjs__ui-row">
                                <div>
                                    Moving ${movement.dirTo}
                                    at ${(0, _units.formatDataValue)(movement, 'speedMPH', 'speedKMH', metric)}
                                </div>
                            </div>
                        ` : '';
          return `
                        <div class="stormtrack-loc awxjs__app__ui-panel-info__table">
                            <div class="awxjs__ui-row">
                                <div class="awxjs__ui-cols align-center">
                                    <div class="awxjs__ui-expand awxjs__text-lg value">
                                        <strong>Near ${placeName}</strong>
                                    </div>
                                    <div>
                                        <div class="indicator" style="background:${(0, _utils2.colorStormCell)(traits.type)};"></div>
                                    </div>
                                </div>
                            </div>
                            ${movementBlock}
                        </div>
                    `;
        }
      }, {
        // severity levels
        requiresData: true,
        data: data => {
          const stormcells = (0, _utils.get)(data, 'stormcells');
          if (!stormcells) return;
          const {
            dbzm
          } = stormcells;
          const result = [];
          if ((0, _utils.isset)(dbzm)) {
            result.push({
              type: 'intensity',
              name: 'Intensity',
              value: dbzm
            });
          }
          const severity = (0, _utils2.getSeverity)(data.stormcells);
          result.push({
            type: 'severity',
            name: 'Severity',
            value: severity
          });
          return result;
        },
        renderer: data => {
          const hazards = data.map(hazard => {
            let index = 0;
            let level = '';
            if (hazard.type === 'intensity') {
              const {
                index: hazardIndex,
                label
              } = (0, _utils2.indexForIntensity)(hazard.value);
              index = hazardIndex;
              level = label;
            } else if (hazard.type === 'severity') {
              const {
                index: hazardIndex,
                label
              } = (0, _utils2.indexForSeverity)(hazard.value);
              index = hazardIndex;
              level = label;
            }
            const indexString = `${index}`.replace(/\./g, 'p');
            const percent = Math.round(index / 5 * 1000) / 10;
            return `
                            <div class="awxjs__app__ui-panel-info__hazard awxjs__ui-cols align-center">
                                <div class="awxjs__app__ui-panel-info__hazard-label">
                                    ${hazard.name}
                                </div>
                                <div class="awxjs__app__ui-panel-info__hazard-bar
                                    awxjs__app__ui-panel-info__hazard-bar-sm"
                                >
                                    <div class="awxjs__app__ui-panel-info__hazard-bar-inner">
                                        <div
                                            class="awxjs__app__ui-panel-info__hazard-bar-progress
                                                awxjs__app__ui-panel-info__hazard-indice-fill-${indexString}"
                                            style="width:${percent}%;"
                                        ></div>
                                    </div>
                                </div>
                                <div
                                    class="awxjs__app__ui-panel-info__hazard-value
                                    awxjs__app__ui-panel-info__hazard-value-lg
                                        awxjs__app__ui-panel-info__hazard-value-${indexString}"
                                    >${level}</div>
                            </div>
                        `;
          });
          return `
                        <div class="awxjs__app__ui-panel-info__hazards">
                            ${hazards.join('')}
                        </div>
                    `;
        }
      }, {
        // forecast track
        title: 'Forecast Track',
        requiresData: true,
        data: data => {
          const locations = (0, _utils.get)(data, 'stormcells.forecast.locs');
          if (!locations) return;
          // filter out invalid place results
          const places = locations.map(loc => {
            const key = `places_${loc.lat}_${loc.long}`;
            const place = data[key];
            if (place && (0, _utils.isset)(place.place)) {
              return Object.assign({
                timestamp: loc.timestamp
              }, place);
            }
            return false;
          }).filter(v => v);
          if (places.length === 0) return;
          data.locations = places;
          return data;
        },
        renderer: data => {
          const locations = (0, _utils.get)(data, 'locations') || [];
          const names = [];
          const rows = locations.map(loc => {
            const {
              place,
              timestamp
            } = loc;
            if (names.includes(place.name)) {
              return;
            }
            names.push(place.name);
            const time = (0, _utils.formatDate)(new Date(timestamp * 1000), 'h:mm a');
            return `
                            <div class="awxjs__ui-row">
                                <div class="awxjs__ui-expand label">${place.name}</div>
                                <div class="awxjs__ui-expand value">${time}</div>
                            </div>
                        `;
          });
          return `
                        <div class="awxjs__app__ui-panel-info__table awxjs__table">
                            ${rows.filter(v => typeof v !== 'undefined').join('\n')}
                        </div>
                    `;
        }
      }, {
        // details
        requiresData: true,
        data: data => {
          const payload = (0, _utils.get)(data, 'stormcells');
          if (!payload) {
            return;
          }
          return payload;
        },
        renderer: data => {
          const {
            metric,
            timestamp,
            radarID,
            dbzm,
            tvs,
            mda,
            vil
          } = data;
          const rows = [{
            label: 'Observed',
            value: (0, _utils.formatDate)(new Date(timestamp * 1000), 'h:mm a, MMM d, yyyy')
          }, {
            label: 'Radar Station',
            value: radarID
          }, {
            label: 'Max Reflectivity',
            value: `${dbzm} dbz`
          }, {
            label: 'Echo Top',
            value: (0, _units.formatDataValue)(data, 'topFT', 'topM', metric)
          }, {
            label: 'TVS',
            value: tvs === 1 ? 'Yes' : 'No'
          }, {
            label: 'Hail',
            value: `${(0, _utils.get)(data, 'hail.prob') || 0}% Probability`
          }, {
            label: 'Severe Hail',
            value: `${(0, _utils.get)(data, 'hail.probSevere') || 0}% Probability`
          }, {
            label: 'Max Hail Size',
            value: (0, _units.formatDataValue)(data, 'hail.maxSizeIN', 'hail.maxSizeCM', metric)
          }, {
            label: 'MDA',
            value: mda
          }, {
            label: 'VIL',
            value: vil
          }];
          const content = rows.reduce((result, row) => {
            result.push(`
                            <div class="awxjs__ui-row">
                                <div class="awxjs__ui-expand awxjs__text-sm label">${row.label}</div>
                                <div class="awxjs__ui-expand value">${row.value}</div>
                            </div>
                        `);
            return result;
          }, []).join('\n');
          return `
                        <div class="awxjs__app__ui-panel-info__table awxjs__table awxjs__table-bordered">
                            ${content}
                        </div>
                    `;
        }
      }]
    };
  }
  controls() {
    return {
      value: this.id,
      title: 'Storm Tracks',
      filter: true,
      multiselect: true,
      segments: [{
        value: 'all',
        title: 'All'
      }, {
        value: 'hail',
        title: 'Hail'
      }, {
        value: 'rotating',
        title: 'Rotating'
      }, {
        value: 'tornado',
        title: 'Tornadic'
      }]
    };
  }
  onInit() {
    const request = this.account.api().endpoint('stormcells');
    this.request = request;
  }
  onMarkerClick(marker, data) {
    if (!data) return;
    const {
      id,
      radarID,
      cellID
    } = data;
    const cellId = `${radarID}_${cellID}`;
    this.showInfoPanel(`Cell ${cellId}`).load({
      p: id
    }, {
      stormcells: data
    });
  }
}
var _default = exports.default = StormCells;
module.exports = exports.default;