L.Map.mergeOptions({
  doubleTapDragZoom: L.Browser.touch && !L.Browser.android23,
  doubleTapDragZoomOptions: {
    reverse: false,
  },
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

    if (map.options.doubleTapDragZoom === 'center') {
      this._startLatLng = map.containerPointToLatLng(this._centerPoint);
    } else {
      this._startLatLng = map.containerPointToLatLng(p);
    }

    this._startZoom = map.getZoom();

    map._stop();
    map._moveStart(true, false);
  },

  _onDoubleTapDrag: function (e) {
    if (!e.touches || e.touches.length !== 1) { return; }

    var map = this._map;
    var reverse = this._map.options.doubleTapDragZoomOptions.reverse;
    var p = map.mouseEventToContainerPoint(e.touches[0]);

    if (p.y <= 0) {
      return;
    }

    var distance = reverse ? p.y - this._startPointY : this._startPointY - p.y;

    var scale = Math.pow(Math.E, distance / 200);

    if (scale === 1) { return; }

    this._zoom = map.getScaleZoom(scale, this._startZoom);

    if (map.options.doubleTapDragZoom === 'center') {
      this._center = this._startLatLng;
    } else {
      var delta =
        L.point(this._startPoint.x, p.y)
          ._add(this._startPoint)
          .divideBy(2)
          ._subtract(this._centerPoint);

      this._center = map.unproject(map.project(this._startLatLng, this._zoom).subtract(delta), this._zoom);
    }

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
