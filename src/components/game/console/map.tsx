import React from "react";

import rawMapData from "./map-data.json";

type Vector2 = [number, number];
const mapData: [string, { pos: Vector2; size: Vector2 }][] = Object.entries(
  rawMapData
);

const MapComponent = ({ px, py, sx, sy, active }) => {
  const transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
  const width = `${sx}px`;
  const height = `${sy}px`;

  return <div className="map-component" style={{ width, height, transform }} />;
};

export default function Map({ currentArea = "" }) {
  const components = mapData.map(([key, d]) => (
    <MapComponent
      px={d.pos[0]}
      py={d.pos[1]}
      sx={d.size[0]}
      sy={d.size[1]}
      active={key === currentArea}
      key={key}
    />
  ));

  return <div className="map">{components}</div>;
}
