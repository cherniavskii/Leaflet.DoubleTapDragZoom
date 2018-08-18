L.Map.mergeOptions({
  doubleTapDragZoom: L.Browser.touch
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

    var centerPoint = map.getSize()._divideBy(2);
    this._startLatLng = map.containerPointToLatLng(centerPoint);

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

    var scale = Math.pow(Math.E, distance / this._startPointY);

    this._zoom = map.getScaleZoom(scale, this._startZoom);

    this._center = this._startLatLng;
    if (scale === 1) { return; }

    L.Util.cancelAnimFrame(this._animRequest);

    var moveFn = L.Util.bind(map._move, map, this._center, this._zoom, {pinch: true, round: false});
    this._animRequest = L.Util.requestAnimFrame(moveFn, this, true);
  },

  _onDoubleTapDragEnd: function (e) {
    L.Util.cancelAnimFrame(this._animRequest);

    // Pinch updates GridLayers' levels only when zoomSnap is off, so zoomSnap becomes noUpdate.
    if (this._map.options.zoomAnimation) {
      this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
    } else {
      this._map._resetView(this._center, this._map._limitZoom(this._zoom));
    }
  }
});

L.Map.addInitHook('addHandler', 'doubleTapDragZoom', DoubleTapDragZoom);
