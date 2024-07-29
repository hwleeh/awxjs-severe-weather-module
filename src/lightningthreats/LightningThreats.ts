import MapSourceModule, {
    MapSourceModuleOptions
} from '@aerisweather/javascript-sdk/dist/modules/MapSourceModule';
import ApiRequest from '@aerisweather/javascript-sdk/dist/network/api/ApiRequest';

class LightningThreats extends MapSourceModule<MapSourceModuleOptions> {
    private request!: ApiRequest;

    get id(): string {
        return 'lightningthreats';
    }

    source(): any {
        const properties: any = {
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

    controls(): any {
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
        const request = this.account
            .api()
            .endpoint('lightning/summary')
            .format('geojson')
            .filter('geo')
            .from('-15minutes');
        this.request = request;
    }
}

export default LightningThreats;
