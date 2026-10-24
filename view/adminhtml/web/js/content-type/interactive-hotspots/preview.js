
define([
    'Magento_PageBuilder/js/content-type/preview',
    'Magento_PageBuilder/js/events',
    'jquery',
    'mage/translate'
], function (Preview, events, $, $t) {
    'use strict';

    function InteractiveHotspotsPreview() {
        Preview.apply(this, arguments);
        this._eventsBound = false;
        this._renderTimer = null;
    }

    InteractiveHotspotsPreview.prototype = Object.create(Preview.prototype);
    InteractiveHotspotsPreview.prototype.constructor = InteractiveHotspotsPreview;

    InteractiveHotspotsPreview.prototype.defaults = {
        listens: {
            'data.image': 'onImageChange',
            'data.hotspots': 'onHotspotsChange'
        },
        template: 'Kumar_InteractiveHotspots/content-type/interactive-hotspots/preview'
    };

    InteractiveHotspotsPreview.prototype.initialize = function () {
        if (typeof Preview.prototype.initialize === 'function') {
            Preview.prototype.initialize.apply(this, arguments);
        }

        this.restoreHotspots();
        this.renderHotspotPreview();

        return this;
    };

    InteractiveHotspotsPreview.prototype.bindEvents = function () {
        var self = this;
        var updateEvent;

        Preview.prototype.bindEvents.apply(this, arguments);

        if (this._eventsBound) {
            return;
        }

        this._eventsBound = true;

        if (!this.config || !this.config.name || !this.contentType) {
            return;
        }

        updateEvent = this.config.name + ':' +
            this.contentType.id + ':updateAfter';

        events.on(updateEvent, function () {
            self.renderHotspotPreview();
        });

        events.on('contentType:renderAfter', function (args) {
            if (
                args &&
                args.contentType &&
                self.contentType &&
                args.contentType.id === self.contentType.id
            ) {
                self.renderHotspotPreview(args.element);
            }
        });
    };

    InteractiveHotspotsPreview.prototype.onOptionEdit = function () {
        var store = this.contentType && this.contentType.dataStore;

        if (store && !store.get('appearance')) {
            store.set('appearance', 'default');
        }

        if (typeof Preview.prototype.onOptionEdit === 'function') {
            return Preview.prototype.onOptionEdit.apply(this, arguments);
        }
    };

    InteractiveHotspotsPreview.prototype.onImageChange = function () {
        this.renderHotspotPreview();
    };

    InteractiveHotspotsPreview.prototype.onHotspotsChange = function () {
        this.renderHotspotPreview();
    };

    InteractiveHotspotsPreview.prototype.getAttributes = function () {
        var attributes = this.data &&
            this.data.main &&
            this.data.main.attributes;

        return typeof attributes === 'function'
            ? attributes()
            : attributes;
    };

    InteractiveHotspotsPreview.prototype.restoreHotspots = function () {
        var store = this.contentType && this.contentType.dataStore;
        var attributes = this.getAttributes();
        var raw;
        var element;

        if (!store || store.get('hotspots')) {
            return;
        }

        raw = attributes && (
            attributes['data-hotspots'] ||
            attributes.hotspots
        );

        if (!raw && typeof this.getElement === 'function') {
            element = this.getElement();

            if (element && element.jquery) {
                element = element[0];
            }

            if (element && element.getAttribute) {
                raw = element.getAttribute('data-hotspots');
            }
        }

        if (raw) {
            store.set(
                'hotspots',
                typeof raw === 'string' ? raw : JSON.stringify(raw)
            );
        }
    };

    InteractiveHotspotsPreview.prototype.getImageUrl = function () {
        var store = this.contentType && this.contentType.dataStore;
        var attributes = this.getAttributes();
        var candidates = [
            store && store.get('image'),
            store && store.get('data.image'),
            attributes && attributes.image
        ];
        var element;
        var i;
        var url;

        function extract(value, depth) {
            var keys;
            var result;
            var match;
            var j;

            if (!value || depth > 5) {
                return '';
            }

            if (typeof value === 'function') {
                value = value();
            }

            if (typeof value === 'string') {
                value = value.trim();

                match = value.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/i);

                if (match) {
                    return match[2];
                }

                match = value.match(/https?:\/\/[^\s)\]]+/i);

                if (match) {
                    return match[0];
                }

                if (value.charAt(0) === '/' && value.indexOf('//') !== 0) {
                    return value;
                }

                if (value.charAt(0) === '{' || value.charAt(0) === '[') {
                    try {
                        return extract(JSON.parse(value), depth + 1);
                    } catch (e) {
                        return '';
                    }
                }

                return '';
            }

            if (Array.isArray(value)) {
                for (j = 0; j < value.length; j++) {
                    result = extract(value[j], depth + 1);

                    if (result) {
                        return result;
                    }
                }

                return '';
            }

            if (typeof value === 'object') {
                keys = [
                    'url',
                    'previewUrl',
                    'src',
                    'media_url',
                    'image',
                    'images',
                    'value',
                    'file',
                    'data'
                ];

                for (j = 0; j < keys.length; j++) {
                    if (value[keys[j]]) {
                        result = extract(value[keys[j]], depth + 1);

                        if (result) {
                            return result;
                        }
                    }
                }
            }

            return '';
        }

        for (i = 0; i < candidates.length; i++) {
            url = extract(candidates[i], 0);

            if (url) {
                return url;
            }
        }

        if (typeof this.getElement === 'function') {
            element = this.getElement();

            if (element && element.jquery) {
                element = element[0];
            }

            if (element && element.querySelector) {
                element = element.querySelector(
                    '.kumar-interactive-hotspots__image'
                );

                if (element && element.getAttribute('src')) {
                    return element.getAttribute('src');
                }
            }
        }

        return '';
    };

    
    InteractiveHotspotsPreview.prototype.getHotspots = function () {
        var store = this.contentType && this.contentType.dataStore;
        var attributes = this.getAttributes();
        var raw = store && store.get('hotspots');
        var element;
        var $root;
        var $nested;
        var points;

        function parseHotspots(value, source) {
            var parsed;

            if (value === undefined || value === null || value === '') {
                return null;
            }

            if (Array.isArray(value)) {
                return value;
            }

            if (typeof value === 'object') {
                return Array.isArray(value.hotspots) ? value.hotspots : null;
            }

            if (typeof value !== 'string' || !value.trim()) {
                return null;
            }

            try {
                parsed = JSON.parse(value);
            } catch (error) {
                console.error('[KHP HOTSPOTS] JSON parse failed:', source, error, value);
                return null;
            }

            if (Array.isArray(parsed)) {
                return parsed;
            }

            return parsed && Array.isArray(parsed.hotspots)
                ? parsed.hotspots
                : null;
        }

        points = parseHotspots(raw, 'dataStore.hotspots');

        if (!points && attributes) {
            points = parseHotspots(
                attributes['data-hotspots'],
                'attributes[data-hotspots]'
            );

            if (!points) {
                points = parseHotspots(
                    attributes.hotspots,
                    'attributes.hotspots'
                );
            }
        }

        if (typeof this.getElement === 'function') {
            element = this.getElement();

            if (element && element.jquery) {
                element = element[0];
            }


            if (!points && element && element.getAttribute) {
                points = parseHotspots(
                    element.getAttribute('data-hotspots'),
                    'getElement[data-hotspots]'
                );
            }

            if (element && element.querySelectorAll) {
                var nodes = element.querySelectorAll('[data-hotspots]');

                Array.prototype.forEach.call(nodes, function (node, index) {
                    if (!points) {
                        points = parseHotspots(
                            node.getAttribute('data-hotspots'),
                            'descendant[' + index + ']'
                        );
                    }
                });
            }
        }

        if (this.wrapperElement) {
            $root = $(this.wrapperElement).closest(
                '[data-content-type="kumar_interactive_hotspots"]'
            );

            if ($root.length) {

                if (!points) {
                    points = parseHotspots(
                        $root.attr('data-hotspots'),
                        'wrapper closest root'
                    );
                }

                $nested = $root.find('[data-hotspots]');

                $nested.each(function (index) {

                    if (!points) {
                        points = parseHotspots(
                            this.getAttribute('data-hotspots'),
                            'wrapper nested element ' + index
                        );
                    }
                });
            }
        }

        if (!points) {
            return [];
        }

        if (store && !store.get('hotspots')) {
            store.set('hotspots', JSON.stringify(points));
        }

        return points;
    };


    InteractiveHotspotsPreview.prototype.renderHotspotPreview = function (element) {
        var self = this;

        if (this._renderTimer) {
            window.clearTimeout(this._renderTimer);
        }

        this._renderTimer = window.setTimeout(function () {
            var $root = element ? $(element).closest('.khp-preview') : $();
            var $stage;
            var $image;
            var $points;
            var imageUrl;
            var points;

            if (!$root.length && self.wrapperElement) {
                $root = $(self.wrapperElement).closest('.khp-preview');
            }

            if (!$root.length && self.contentType && self.contentType.id) {
                $root = $(
                    '.khp-preview[data-content-type="kumar_interactive_hotspots"]'
                ).filter(function () {
                    return $(this).attr('data-element') === 'main';
                }).last();
            }

            if (!$root.length) {
                return;
            }

            $stage = $root.find('[data-hotspot-stage]').first();

            if (!$stage.length) {
                return;
            }

            $image = $stage.find('.khp-preview-image').first();

            if (!$image.length) {
                $image = $('<img/>', {
                    'class': 'khp-preview-image',
                    alt: ''
                }).prependTo($stage);
            }

            imageUrl = self.getImageUrl();

            if (!imageUrl) {
                $image.removeAttr('src');
            } else {
                if (imageUrl.charAt(0) === '/') {
                    imageUrl = window.location.origin + imageUrl;
                }

                $image.attr('src', imageUrl).css({
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto'
                });
            }

            points = self.getHotspots();
            $points = $stage.find('.khp-preview-points').first();

            if (!$points.length) {
                $points = $('<div/>', {
                    'class': 'khp-preview-points'
                }).appendTo($stage);
            }

            $points.empty();

            points.forEach(function (point, index) {
                $('<button/>', {
                    type: 'button',
                    'class': 'khp-point',
                    text: String(index + 1),
                    title: point.name || $t('Hotspot'),
                    'aria-label': point.name ||
                        ($t('Hotspot') + ' ' + (index + 1))
                }).css({
                    position: 'absolute',
                    left: (Number(point.x) || 0) + '%',
                    top: (Number(point.y) || 0) + '%',
                    transform: 'translate(-50%, -50%)'
                }).attr('data-point-index', index).appendTo($points);
            });

            self.bindHotspotEditor($root, $stage);
        }, 0);
    };

    InteractiveHotspotsPreview.prototype.bindHotspotEditor = function (
        $root,
        $stage
    ) {
        var self = this;
        var $toolbar;

        if ($stage.data('khp-bound')) {
            return;
        }

        $stage.data('khp-bound', true);

        $toolbar = $(
            '<div class="khp-editor-toolbar">' +
                '<button type="button" class="action-primary khp-add-mode">' +
                    '+ ' + $t('Add hotspot') +
                '</button>' +
                '<span class="khp-editor-hint">' +
                    $t('Select a point to edit. Drag a point to reposition it.') +
                '</span>' +
            '</div>'
        );

        $stage.before($toolbar);

        var addMode = false;

        $toolbar.on('click', '.khp-add-mode', function () {
            addMode = !addMode;

            $(this)
                .toggleClass('active', addMode)
                .text(
                    addMode
                        ? $t('Click image to place')
                        : '+ ' + $t('Add hotspot')
                );

            $stage.toggleClass('khp-placement-mode', addMode);
        });

        $stage.on('click', function (event) {
            var rect;
            var points;
            var x;
            var y;

            if (!addMode || $(event.target).closest('.khp-point').length) {
                return;
            }

            rect = this.getBoundingClientRect();

            if (!rect.width || !rect.height) {
                return;
            }

            x = Math.max(
                0,
                Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)
            );

            y = Math.max(
                0,
                Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)
            );

            points = self.getHotspots();

            points.push({
                x: +x.toFixed(3),
                y: +y.toFixed(3),
                name: '',
                description: '',
                url: ''
            });

            self.saveHotspots(points);

            addMode = false;

            $toolbar.find('.khp-add-mode')
                .removeClass('active')
                .text('+ ' + $t('Add hotspot'));

            $stage.removeClass('khp-placement-mode');

            self.openPointEditor(points.length - 1, points);
        });

        $stage.on('click', '.khp-point', function (event) {
            var $point = $(this);

            event.preventDefault();
            event.stopPropagation();

            if ($point.data('khp-dragging')) {
                $point.data('khp-dragging', false);
                return;
            }

            self.openPointEditor(
                Number($point.attr('data-point-index')),
                self.getHotspots()
            );
        });

        $stage.on('pointerdown', '.khp-point', function (event) {
            var $point = $(this);
            var index = Number($point.attr('data-point-index'));
            var rect = $stage[0].getBoundingClientRect();
            var moved = false;

            if (event.button !== 0) {
                return;
            }

            $point.data('khp-dragging', false);

            function move(e) {
                var x;
                var y;

                moved = true;
                $point.data('khp-dragging', true);

                x = Math.max(
                    0,
                    Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
                );

                y = Math.max(
                    0,
                    Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)
                );

                $point.css({
                    left: x + '%',
                    top: y + '%'
                });
            }

            function up(e) {
                var points;
                var x;
                var y;

                document.removeEventListener('pointermove', move);
                document.removeEventListener('pointerup', up);

                if (!moved || !rect.width || !rect.height) {
                    return;
                }

                points = self.getHotspots();

                if (!points[index]) {
                    return;
                }

                x = ((e.clientX - rect.left) / rect.width) * 100;
                y = ((e.clientY - rect.top) / rect.height) * 100;

                points[index].x = +Math.max(0, Math.min(100, x)).toFixed(3);
                points[index].y = +Math.max(0, Math.min(100, y)).toFixed(3);

                self.saveHotspots(points);
            }

            document.addEventListener('pointermove', move);
            document.addEventListener('pointerup', up);
        });
    };

    InteractiveHotspotsPreview.prototype.saveHotspots = function (points) {
        var store = this.contentType && this.contentType.dataStore;
        var serialized = JSON.stringify(points);
        var attributes = this.getAttributes();

        if (store) {
            store.set('hotspots', serialized);
        }

        if (attributes) {
            attributes['data-hotspots'] = serialized;
        }

        this.renderHotspotPreview();
    };

    InteractiveHotspotsPreview.prototype.openPointEditor = function (
        index,
        points
    ) {
        var self = this;
        var point = points[index];
        var $modal;

        if (!point) {
            return;
        }

        $('.khp-modal-backdrop').remove();

        $modal = $(
            '<div class="khp-modal-backdrop">' +
                '<section class="khp-modal" role="dialog" aria-modal="true">' +
                    '<header>' +
                        '<h3>' + $t('Hotspot details') + '</h3>' +
                        '<button type="button" class="khp-close" aria-label="' +
                            $t('Close') + '">x</button>' +
                    '</header>' +
                    '<label>' + $t('Name') +
                        '<input class="khp-name" type="text" maxlength="120">' +
                    '</label>' +
                    '<label>' + $t('Description') +
                        '<textarea class="khp-description" rows="4" maxlength="1000"></textarea>' +
                    '</label>' +
                    '<label>' + $t('URL') +
                        '<input class="khp-url" type="url" placeholder="https://">' +
                    '</label>' +
                    '<footer>' +
                        '<button type="button" class="action-secondary khp-delete">' +
                            $t('Delete hotspot') +
                        '</button>' +
                        '<span></span>' +
                        '<button type="button" class="action-secondary khp-cancel">' +
                            $t('Cancel') +
                        '</button>' +
                        '<button type="button" class="action-primary khp-save">' +
                            $t('Save hotspot') +
                        '</button>' +
                    '</footer>' +
                '</section>' +
            '</div>'
        );

        $modal.find('.khp-name').val(point.name || '');
        $modal.find('.khp-description').val(point.description || '');
        $modal.find('.khp-url').val(point.url || '');

        $('body').append($modal);

        function close() {
            $modal.remove();
        }

        $modal
            .on('click', '.khp-close, .khp-cancel', close)
            .on('click', function (event) {
                if (event.target === this) {
                    close();
                }
            });

        $modal.on('click', '.khp-save', function () {
            point.name = $.trim($modal.find('.khp-name').val());
            point.description = $.trim(
                $modal.find('.khp-description').val()
            );
            point.url = $.trim($modal.find('.khp-url').val());

            points[index] = point;

            self.saveHotspots(points);
            close();
        });

        $modal.on('click', '.khp-delete', function () {
            if (window.confirm($t('Delete this hotspot?'))) {
                points.splice(index, 1);
                self.saveHotspots(points);
                close();
            }
        });

        $modal.find('.khp-name').trigger('focus');
    };

    return InteractiveHotspotsPreview;
});
