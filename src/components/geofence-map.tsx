'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import * as turf from '@turf/turf';

interface GeofenceMapProps {
  onGeofenceChange?: (
    geofence: {
      type: string;
      properties: Record<string, unknown>;
      geometry: Record<string, unknown>;
    },
    area: number
  ) => void;
  initialGeofence?: {
    type: string;
    properties: Record<string, unknown>;
    geometry: Record<string, unknown>;
  };
}

const GeofenceMap: React.FC<GeofenceMapProps> = ({ onGeofenceChange, initialGeofence }) => {
  const [area, setArea] = useState<number>(0);
  const [hasPolygon, setHasPolygon] = useState(false);

  const MapController = () => {
    const map = useMap();
    const drawnLayersRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

    const clearMap = () => {
      // Force clear all layers from the feature group
      drawnLayersRef.current.eachLayer((layer) => {
        drawnLayersRef.current.removeLayer(layer);
      });
      drawnLayersRef.current.clearLayers();

      setArea(0);
      setHasPolygon(false);
      if (onGeofenceChange) {
        onGeofenceChange(
          { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [] } },
          0
        );
      }
    };

    // Expose clearMap function globally for the button
    (window as unknown as { clearGeofenceMap?: () => void }).clearGeofenceMap = clearMap;

    useEffect(() => {
      const drawnLayers = drawnLayersRef.current;
      map.addLayer(drawnLayers);

      // Add initial geofence if provided
      if (
        initialGeofence &&
        initialGeofence.geometry &&
        'coordinates' in initialGeofence.geometry &&
        Array.isArray(initialGeofence.geometry.coordinates) &&
        initialGeofence.geometry.coordinates.length > 0
      ) {
        try {
          // Add only the inner layers from GeoJSON into the feature group, so they are editable
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const geoJsonLayer = L.geoJSON(initialGeofence as any);
          geoJsonLayer.getLayers().forEach((innerLayer) => {
            drawnLayers.addLayer(innerLayer);
          });
          setHasPolygon(true);

          // Calculate area
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const areaInSquareMeters = turf.area(initialGeofence as any);
          const areaInHectares = areaInSquareMeters / 10000;
          setArea(areaInHectares);
        } catch (error) {
          console.error('Error loading initial geofence:', error);
        }
      }

      const DrawControl = (
        L.Control as unknown as { Draw: new (options: Record<string, unknown>) => L.Control }
      ).Draw;
      const drawControl = new DrawControl({
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
          },
          polyline: false,
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
        },
      });
      map.addControl(drawControl);

      // When a polygon is created, add it to the feature group, style it, and bring to front
      const onDrawCreated = (e: {
        layer: L.Layer & {
          toGeoJSON: () => Record<string, unknown>;
          setStyle?: (style: L.PathOptions) => void;
        };
      }) => {
        const createdLayer = e.layer;

        // Keep only the latest polygon
        drawnLayers.clearLayers();

        // Style the drawn layer if possible
        if ('setStyle' in createdLayer && typeof createdLayer.setStyle === 'function') {
          (createdLayer as unknown as L.Path).setStyle({
            color: '#ff0000',
            weight: 6,
            opacity: 1,
            fillColor: '#ffff00',
            fillOpacity: 0.6,
          });
        }

        // Add to feature group only (no direct addTo(map))
        drawnLayers.addLayer(createdLayer);

        // Bring to front if supported
        if ((createdLayer as unknown as L.Path).bringToFront) {
          (createdLayer as unknown as L.Path).bringToFront();
        }

        setHasPolygon(true);

        const featureForArea = createdLayer.toGeoJSON() as unknown as {
          type: string;
          properties: Record<string, unknown>;
          geometry: Record<string, unknown>;
        };
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const areaInSquareMeters = turf.area(featureForArea as any);
          const areaInHectares = areaInSquareMeters / 10000;
          setArea(areaInHectares);
          if (onGeofenceChange) {
            onGeofenceChange(featureForArea, areaInHectares);
          }
        } catch (error) {
          console.error('Error calculating area:', error);
        }
      };

      const onDrawDeleted = () => {
        setArea(0);
        setHasPolygon(false);
        if (onGeofenceChange) {
          onGeofenceChange(
            {
              type: 'Feature',
              properties: {},
              geometry: { type: 'Polygon', coordinates: [] } as unknown as Record<string, unknown>,
            },
            0
          );
        }
      };

      const onDrawEdited = () => {
        const layers = drawnLayers.getLayers();
        if (layers.length > 0) {
          const firstLayer = layers[0] as L.Layer & { toGeoJSON: () => Record<string, unknown> };
          const editedFeature = firstLayer.toGeoJSON() as {
            type: string;
            properties: Record<string, unknown>;
            geometry: Record<string, unknown>;
          };
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const areaInSquareMeters = turf.area(editedFeature as any);
            const areaInHectares = areaInSquareMeters / 10000;
            setArea(areaInHectares);
            if (onGeofenceChange) {
              onGeofenceChange(editedFeature, areaInHectares);
            }
          } catch (error) {
            console.error('Error calculating area after edit:', error);
          }
        }
      };

      map.on('draw:created', onDrawCreated);
      map.on('draw:deleted', onDrawDeleted);
      map.on('draw:edited', onDrawEdited);

      return () => {
        map.off('draw:created', onDrawCreated);
        map.off('draw:deleted', onDrawDeleted);
        map.off('draw:edited', onDrawEdited);
        map.removeControl(drawControl);
        map.removeLayer(drawnLayers);
      };
    }, [map]);

    return null;
  };

  const handleClearMap = () => {
    const windowWithClear = window as unknown as { clearGeofenceMap?: () => void };
    if (windowWithClear.clearGeofenceMap) {
      windowWithClear.clearGeofenceMap();
    }
  };

  return (
    <div>
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm text-gray-600">Dibuja un polígono para definir el área</span>
        {hasPolygon && (
          <button
            onClick={handleClearMap}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Limpiar Mapa
          </button>
        )}
      </div>

      <MapContainer
        center={[28.954250461617914, -111.24862117479974]}
        zoom={13}
        style={{ width: '100%', height: '500px' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController />
      </MapContainer>

      {area > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          Área: <span className="font-semibold">{area.toFixed(2)} hectáreas</span>
        </div>
      )}
    </div>
  );
};

export default GeofenceMap;
