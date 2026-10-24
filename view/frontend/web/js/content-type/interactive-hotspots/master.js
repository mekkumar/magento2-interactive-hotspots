define(['Magento_PageBuilder/js/content-type/master'], function (Master) {
    'use strict';
    return Master.extend({
        defaults: { template: 'Kumar_InteractiveHotspots/content-type/interactive-hotspots/master' },
        getImageUrl: function () {
            var value = this.contentType.dataStore.get('image');
            if (Array.isArray(value) && value.length) { value = value[0].url || value[0].name || ''; }
            if (value && typeof value === 'object') { value = value.url || value.src || ''; }
            return value || '';
        },
        getHotspots: function () {
            var raw = this.contentType.dataStore.get('hotspots') || '[]';
            try { return Array.isArray(raw) ? raw : JSON.parse(raw); } catch (e) { return []; }
        }
    });
});
