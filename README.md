![](https://img.shields.io/npm/v/leaflet-doubletapdragzoom.svg)
![](https://img.shields.io/bundlephobia/minzip/leaflet-doubletapdragzoom.svg)
![](https://img.shields.io/npm/l/leaflet-doubletapdragzoom.svg)
![](https://img.shields.io/npm/dt/leaflet-doubletapdragzoom.svg)



# Leaflet.DoubleTapDragZoom

This plugin implements double-tap-and-drag zoom feature, which allows to zoom in / out with one hand! :tada:

Inspired by Google Maps and Apple Maps.

## Demo: https://cherniavskii.github.io/Leaflet.DoubleTapDragZoom/

## Installation

### NPM

`npm install --save leaflet-doubletapdrag leaflet-doubletapdragzoom`

```js
import L from 'leaflet';
import 'leaflet-doubletapdrag';
import 'leaflet-doubletapdragzoom';
```

### Loading from unpkg.com:

Add the following scripts to the head:

```
<script src="https://unpkg.com/leaflet">
<script src="https://unpkg.com/leaflet-doubletapdrag"></script>
<script src="https://unpkg.com/leaflet-doubletapdragzoom"></script>
```

## Usage

Now you can pass supported options to map.
See [Options](#options) section for more details.

```js
var map = L.map('map', {
  doubleTapDragZoom: true,
  doubleTapDragZoomOptions: {
    reverse: false,
  },
})
```

To achieve Google Maps-like behavior, use this configuration:
```js
var map = L.map('map', {
  doubleTapDragZoom: 'center',
  doubleTapDragZoomOptions: {
    reverse: true,
  },
})
```

## Options

| Option |  Type | Default | Description |
| ------ | ----- | ------- | ----------- |
| `doubleTapDragZoom` | Boolean\|String | * | Whether the map can be zoomed by double-tap-and-drag gesture. If passed `'center'`, it will zoom to the center of the view regardless of where the touch event (finger) was. Enabled for touch-capable web browsers except for old Androids |
| `doubleTapDragZoomOptions` | Object | -- | Plugin options, see available options below |
| `doubleTapDragZoomOptions.reverse` | Boolean | false | If true, zoom drag direction will be reversed - dragging up will zoom out, dragging down will zoom in |
