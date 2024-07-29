import MapSourceModule, {
    MapSourceModuleOptions
} from '@aerisweather/javascript-sdk/dist/modules/MapSourceModule';
import ApiRequest from '@aerisweather/javascript-sdk/dist/network/api/ApiRequest';
import * as utils from '@aerisweather/javascript-sdk/dist/utils/index';
import { toName } from '@aerisweather/javascript-sdk/dist/utils/strings';
import { isset } from '@aerisweather/javascript-sdk/dist/utils';

class Warnings extends MapSourceModule<MapSourceModuleOptions> {
    private request!: ApiRequest;

    get id(): string {
        return this.opts?.id || 'warnings';
    }

    source(): any {
        const properties: any = {
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
                polygon: (item: any) => ({
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

    controls(): any {
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

    infopanel(): any {
        return {
            views: [{
                data: (data: any) => {
                    if (!isset(data)) return;
                    data = data.alert.details;

                    return data;
                },
                renderer: (data: any) => {
                    if (!isset(data)) return;

                    return `<div class="alert">${(data.body || '').replace(/\n/g, '<br>')}</div>`;
                }
            }]
        };
    }

    onInit() {
        const request = this.account.api()
            .endpoint('advisories')
            .action('search' as any)
            .filter('usa')
            .query('type:TO.W;type:SV.W;type:FF.W;')
            .fields('details.type,details.name,details.body,details,geoPoly')
            .limit(100)
            .format('geojson');

        this.request = request;
    }

    onShapeClick(shape: any, data: any) {
        const source = data.awxjs_source;
        const props = data.properties || {};

        if (source === 'warnings') {
            this.showInfoPanel(props.details.name).load(`${toName(props.details.name)}`, {
                alert: props
            });
        }
    }
}

export default Warnings;
