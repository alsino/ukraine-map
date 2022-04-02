import { writable } from 'svelte/store';

export const APP_HEIGHT = writable(undefined);

// Set type of map to be rendered
export const MAP_TYPE = writable("choropleth-api"); // choropleth or flow
export const CENTER_ON = writable("europe"); // ukraine or europe

export const MAP_WIDTH = writable(undefined);
export const MAP_HEIGHT = writable(undefined);
export const csvData = writable(undefined);

export const dataReady = writable(false);

export const MOUSE = writable(undefined);
MOUSE.set({ 
  x: 0, 
  y: 0,
  tooltip: {}
});