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
  readOnly?: boolean;
}

const GeofenceMap: React.FC<GeofenceMapProps> = ({ onGeofenceChange, initialGeofence, readOnly }) => {
  const [area, setArea] = useState<number>(0);
  const [hasPolygon, setHasPolygon] = useState(false);
  const [alternativePolygon, setAlternativePolygon] = useState<L.Polygon | null>(null);
  const clearMapRef = useRef<(() => void) | null>(null);

  const MapController = () => {
    const map = useMap();
    const drawnLayersRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

    const clearMap = () => {
      // Force clear all layers from the feature group
      drawnLayersRef.current.eachLayer((layer) => {
        drawnLayersRef.current.removeLayer(layer);
      });
      drawnLayersRef.current.clearLayers();

      // Clear the alternative polygon if it exists
      if (alternativePolygon) {
        map.removeLayer(alternativePolygon);
        setAlternativePolygon(null);
      }

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
    
    // Also expose it through the ref for the component
    clearMapRef.current = clearMap;

    useEffect(() => {
      const drawnLayers = drawnLayersRef.current;
      
      // Ensure the feature group is properly configured
      drawnLayers.options = {
        ...drawnLayers.options,
        pane: 'overlayPane' // Ensure it's in the correct pane
      };
      
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
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const geoJsonLayer = L.geoJSON(initialGeofence as any);
          geoJsonLayer.getLayers().forEach((innerLayer) => {
            drawnLayers.addLayer(innerLayer);
          });
          setHasPolygon(true);          
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
      let drawControl: L.Control | null = null;
      if (!readOnly) {
        const dc = new DrawControl({
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
        drawControl = dc as unknown as L.Control;
        map.addControl(drawControl);
      }

      // When a polygon is created, add it to the feature group, style it, and bring to front
      const onDrawCreated = (e: {
        layer: L.Layer & {
          toGeoJSON: () => Record<string, unknown>;
          setStyle?: (style: L.PathOptions) => void;
          _latlngs?: unknown;
          _bounds?: unknown;
        };
      }) => {
        const createdLayer = e.layer;

        // Clear existing layers first
        drawnLayers.clearLayers();

        // Style the drawn layer if possible
        if ('setStyle' in createdLayer && typeof createdLayer.setStyle === 'function') {
          // Use default Leaflet styling - no custom colors needed
        }

        // Add to feature group first
        drawnLayers.addLayer(createdLayer);
        
        // Ensure the layer is visible by adding it directly to the map as well
        if (createdLayer.addTo && typeof createdLayer.addTo === 'function') {
          try {
            createdLayer.addTo(map);
          } catch (error) {
            console.error('Error adding layer to map:', error);
          }
        }
        
        // Force the layer to be visible and bring to front
        if ((createdLayer as unknown as L.Path).bringToFront) {
          (createdLayer as unknown as L.Path).bringToFront();
        }
        
        // Alternative: Create a new polygon from the coordinates to ensure visibility
        try {
          const coords = (createdLayer as unknown as { _latlngs: Array<Array<{ lat: number; lng: number }>> })._latlngs[0];
          if (coords && Array.isArray(coords) && coords.length >= 3) {
            // Remove any existing alternative polygon first
            if (alternativePolygon) {
              map.removeLayer(alternativePolygon);
            }
            
            const newPolygon = L.polygon(coords);
            newPolygon.addTo(map);
            setAlternativePolygon(newPolygon);
          }
        } catch (error) {
          console.error('Error creating alternative polygon:', error);
        }
        
        // Force a redraw of the map to ensure the layer is visible
        map.invalidateSize();

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
        // Clear the alternative polygon if it exists
        if (alternativePolygon) {
          map.removeLayer(alternativePolygon);
          setAlternativePolygon(null);
        }
        
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

      if (!readOnly) {
        map.on('draw:created', onDrawCreated);
        map.on('draw:deleted', onDrawDeleted);
        map.on('draw:edited', onDrawEdited);
      }

      return () => {
        if (!readOnly) {
          map.off('draw:created', onDrawCreated);
          map.off('draw:deleted', onDrawDeleted);
          map.off('draw:edited', onDrawEdited);
        }
        if (drawControl) {
          map.removeControl(drawControl);
        }
        map.removeLayer(drawnLayers);
      };
    }, [map]);

    return null;
  };

  const handleClearMap = () => {
    if (clearMapRef.current) {
      clearMapRef.current();
    }
  };

  return (
    <div>
      <style dangerouslySetInnerHTML={{
        __html: `
          .leaflet-overlay-pane svg {
            z-index: 1000 !important;
          }
        `
      }} />
      
      <div className="mb-2 flex justify-between items-center">
        {!readOnly && hasPolygon && (
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
    </div>
  );
};

export default GeofenceMap;
