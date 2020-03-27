

export class Datasource {

    constructor() {

        // data sets order by time
        this.datasets = [];

        // location id -> lat/lon
        this.locations = {};

        // maximum value (for normalization)
        this.maxValue = 0;
    }

}

export class Dataset {

    constructor(date) {

        this.date = date;

        // camera coordinates (for story mode)
        this.cameraCoordinates = null;

        // location id -> data
        this.data = {};

        // stats
        this.totalConfirmed = 0;
        this.totalRecovered = 0;
        this.totalDeceased = 0;
        this.totalActive = 0;
        this.totalConfirmedProjected = 0;
    }
}

export class Data {
    constructor() {

        this.containmentScore = null;

        this.absolute = {
            current: {
                confirmed: null,
                recovered: null,
                deceased: null,
                active: null,
                confirmedProjected: null
            },
            growthLast1Day: {
                confirmed: null,
                recovered: null,
                deceased: null,
                active: null,
                confirmedProjected: null
            },
            growthLast3Days: {
                confirmed: null,
                recovered: null,
                deceased: null,
                active: null,
                confirmedProjected: null
            },
            growthLast7Days: {
                confirmed: null,
                recovered: null,
                deceased: null,
                active: null,
                confirmedProjected: null
            }
        };

        this.ppm = {
            current: {
                confirmed: null,
                recovered: null,
                deceased: null,
                active: null,
                confirmedProjected: null
            },
            growthLast1Day: {
                confirmed: null,
                recovered: null,
                deceased: null,
                active: null,
                confirmedProjected: null
            },
            growthLast3Days: {
                confirmed: null,
                recovered: null,
                deceased: null,
                active: null,
                confirmedProjected: null
            },
            growthLast7Days: {
                confirmed: null,
                recovered: null,
                deceased: null,
                active: null,
                confirmedProjected: null
            }
        };
    }
}

export class CameraCoordinates {
    constructor(location, zoom) {
        this.location = location;
        this.zoom = zoom;
    }
}

export class Location {
    constructor(lat, lon) {
        this.lat = lat;
        this.lon = lon;
    }
}
