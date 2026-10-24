define([
    'Magento_PageBuilder/js/content-type/master'
], function (Master) {
    'use strict';

    function InteractiveHotspotsMaster() {
        Master.apply(this, arguments);
    }

    InteractiveHotspotsMaster.prototype = Object.create(Master.prototype);
    InteractiveHotspotsMaster.prototype.constructor = InteractiveHotspotsMaster;

    InteractiveHotspotsMaster.prototype.getImageUrl = function () {
        var value = this.contentType.dataStore.get('image') || this.contentType.dataStore.get('data-hotspots-image');

        if (Array.isArray(value) && value.length) {
            value = value[0].url || value[0].name || '';
        }

        if (value && typeof value === 'object') {
            value = value.url || value.src || '';
        }

        return value || '';
    };

    InteractiveHotspotsMaster.prototype.getHotspots = function () {
        var raw = this.contentType.dataStore.get('hotspots') || '[]';

        try {
            return Array.isArray(raw) ? raw : JSON.parse(raw);
        } catch (e) {
            return [];
        }
    };

    return InteractiveHotspotsMaster;
});
