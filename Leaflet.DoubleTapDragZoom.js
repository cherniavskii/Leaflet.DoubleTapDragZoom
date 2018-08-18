L.Map.mergeOptions({
  // @option doubleTapDragZoom: Boolean|String = *
  // Whether the map can be zoomed by double-tap-and-drag gesture. If
  // passed `'center'`, it will zoom to the center of the view regardless of
  // where the touch event (finger) was. Enabled for touch-capable web
  // browsers except for old Androids.
  doubleTapDragZoom: L.Browser.touch && !L.Browser.android23,
});

var DoubleTapDragZoom = L.Handler.extend({
  addHooks: function () {
    this._map.on('doubletapdragstart', this._onDoubleTapDragStart, this);
    this._map.on('doubletapdrag', this._onDoubleTapDrag, this);
    this._map.on('doubletapdragend', this._onDoubleTapDragEnd, this);
  },

  removeHooks: function () {
    this._map.off('doubletapdragstart', this._onDoubleTapDragStart, this);
    this._map.off('doubletapdrag', this._onDoubleTapDrag, this);
    this._map.off('doubletapdragend', this._onDoubleTapDragEnd, this);
  },

  _onDoubleTapDragStart: function (e) {
    var map = this._map;

    if (!e.touches || e.touches.length !== 1 || map._animatingZoom) { return; }

    var p = map.mouseEventToContainerPoint(e.touches[0]);
    this._startPointY = p.y;
    this._startPoint = p;

    this._centerPoint = map.getSize()._divideBy(2);
    this._startLatLng = map.containerPointToLatLng(p);

    this._startZoom = map.getZoom();

    map._stop();
    map._moveStart(true, false);
  },

  _onDoubleTapDrag: function (e) {
    if (!e.touches || e.touches.length !== 1) { return; }

    var map = this._map;
    var p = map.mouseEventToContainerPoint(e.touches[0]);

    if (p.y <= 0) {
      return;
    }

    var distance = this._startPointY - p.y;

    var scale = Math.pow(Math.E, distance / 200);

    this._zoom = map.getScaleZoom(scale, this._startZoom);

    const delta = L.point(this._startPoint.x, p.y)._add(this._startPoint).divideBy(2)._subtract(this._centerPoint);
    this._center = map.unproject(map.project(this._startLatLng, this._zoom).subtract(delta), this._zoom);
    if (scale === 1) { return; }

    L.Util.cancelAnimFrame(this._animRequest);

    var moveFn = L.Util.bind(map._move, map, this._center, this._zoom, {pinch: true, round: false});
    this._animRequest = L.Util.requestAnimFrame(moveFn, this, true);
  },

  _onDoubleTapDragEnd: function (e) {
    if (!this._center) { return; }
    L.Util.cancelAnimFrame(this._animRequest);

    // Pinch updates GridLayers' levels only when zoomSnap is off, so zoomSnap becomes noUpdate.
    if (this._map.options.zoomAnimation) {
      this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
    } else {
      this._map._resetView(this._center, this._map._limitZoom(this._zoom));
    }

    this._center = null;
  }
});

L.Map.addInitHook('addHandler', 'doubleTapDragZoom', DoubleTapDragZoom);
