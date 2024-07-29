import MapSourceModule, {
    MapSourceModuleOptions
} from '@aerisweather/javascript-sdk/dist/modules/MapSourceModule';
import ApiRequest from '@aerisweather/javascript-sdk/dist/network/api/ApiRequest';

class StormThreats extends MapSourceModule<MapSourceModuleOptions> {
    private request!: ApiRequest;

    get id() {
        return 'stormthreats';
    }

    source(): any {
        const properties: any = {
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

    controls(): any {
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
            segments: [ {
                value: 'threat',
                title: 'Threatening'
            },{
                value: 'hail',
                title: 'Hail'
            }, {
                value: 'rotating',
                title: 'Rotating'
            }, {
                value: 'tornado',
                title: 'Tornadic'
            },{
                value: 'all',
                title: 'All Storms'
            }]
        };
    }

    onInit() {
        const request = this.account
            .api()
            .endpoint('stormcells/summary')
            .format('geojson')
            .limit(1)
            .filter('geo');
        this.request = request;
    }
}

export default StormThreats;
