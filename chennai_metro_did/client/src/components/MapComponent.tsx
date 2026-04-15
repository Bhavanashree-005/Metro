import axios from 'axios';
import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { API_BASE_URL } from '../config';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom Cartoon Icon definition
const BLUE_LINE: [number, number][] = [
  [13.1095, 80.2858], [13.0827, 80.2707], [13.0697, 80.2711], [13.0601, 80.2647],
  [13.0562, 80.2541], [13.0454, 80.2476], [13.0374, 80.2435], [13.0305, 80.2393],
  [13.0211, 80.2231], [13.0092, 80.2131], [13.0044, 80.2014], [12.9806, 80.1706]
];

const GREEN_LINE: [number, number][] = [
  [13.0827, 80.2707], [13.0805, 80.2608], [13.0789, 80.2471], [13.0782, 80.2370],
  [13.0768, 80.2241], [13.0741, 80.2111], [13.0848, 80.2155], [13.0847, 80.2023],
  [13.0851, 80.1923], [13.0734, 80.1915], [13.0682, 80.2015], [13.0622, 80.2115],
  [13.0505, 80.2123], [13.0361, 80.2116], [13.0186, 80.2053], [13.0044, 80.2014], [12.9961, 80.2022]
];

const CartoonIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-metro-primary/20 rounded-full animate-ping"></div>
      <div class="relative w-4 h-4 bg-white rounded-full border-2 border-metro-primary shadow-[0_0_15px_#9b5de5]"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: 'station-marker-professional'
});

// Using the custom DIV icon instead of standard markers to avoid asset path issues in production
const DefaultIcon = CartoonIcon;
L.Marker.prototype.options.icon = DefaultIcon;

interface Station {
  station_name: string;
  lat: number;
  lon?: number;
  lng?: number;
  line?: string;
  [key: string]: any;
}

interface MapProps {
  onMapClick?: (lat: number, lng: number) => void;
  showHeatmap?: boolean;
  simulationPoint?: { lat: number, lng: number } | null;
  focusPoint?: [number, number] | null;
}

// Special component to handle view transitions
function ChangeView({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, {
        duration: 3,
        easeLinearity: 0.25
      });
    }
  }, [center, map]);
  return null;
}

export default function MapComponent({ onMapClick, showHeatmap = true, simulationPoint, focusPoint }: MapProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/map/stations`);
        setStations(response.data.stations);
      } catch (err) {
        console.error("Failed to fetch stations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  // Map click handler component
  function ClickHandler() {
    useMapEvents({
      click(e) {
        if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return null;
  }

  // Chennai Coordinates
  const center: [number, number] = [13.0475, 80.2089];

  return (
    <div className="h-full w-full relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <ChangeView center={focusPoint || null} />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        />
        
        <ClickHandler />

        {/* High-Fidelity Metro Routes in TN (Blue & Green Lines) */}
        <Polyline 
          positions={BLUE_LINE}
          pathOptions={{ color: '#0072bc', weight: 6, opacity: 0.9, className: 'route-glow' }}
        />
        <Polyline 
          positions={GREEN_LINE}
          pathOptions={{ color: '#009639', weight: 6, opacity: 0.9, className: 'route-glow' }}
        />

        {Array.isArray(stations) && stations.length > 1 && (
          <Polyline 
            positions={stations
              .filter(s => s && typeof s.lat === 'number' && Number.isFinite(s.lat) && typeof (s.lng ?? s.lon) === 'number' && Number.isFinite(s.lng ?? s.lon))
              .map(s => [s.lat, s.lng ?? s.lon ?? 0])
            } 
            pathOptions={{ 
              color: '#9b5de5', 
              weight: 4, 
              opacity: 0.6,
              lineCap: 'round',
              className: 'metro-path-glow shadow-[0_0_15px_#9b5de5]' 
            }} 
          />
        )}

        {Array.isArray(stations) && stations
          .filter(stn => stn && typeof stn.lat === 'number' && Number.isFinite(stn.lat) && typeof (stn.lng ?? stn.lon) === 'number' && Number.isFinite(stn.lng ?? stn.lon))
          .map((stn: any, idx) => (
          <React.Fragment key={idx}>
            {/* Impact Ripple Effects */}
            <Circle
              center={[stn.lat, stn.lng ?? stn.lon ?? 0]}
              radius={800}
              pathOptions={{ 
                fillColor: '#9b5de5', 
                color: '#9b5de5', 
                weight: 1, 
                fillOpacity: 0.1,
                className: 'animate-pulse' 
              }}
            />
            <Circle
              center={[stn.lat, stn.lng ?? stn.lon ?? 0]}
              radius={1500}
              pathOptions={{ 
                fillColor: 'transparent', 
                color: '#9b5de5', 
                weight: 0.5, 
                dashArray: '5, 10',
                opacity: 0.2
              }}
            />

            <Marker
              position={[stn.lat, stn.lng ?? stn.lon ?? 0]}
              icon={CartoonIcon}
              eventHandlers={{
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup(),
              }}
            >
              <Popup className="premium-popup">
                <div className="p-5 min-w-[240px] bg-metro-dark/95 border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                    <h4 className="font-black text-xs uppercase tracking-[0.1em] text-white italic">{stn.station_name}</h4>
                    <span className="text-[10px] font-black text-metro-primary uppercase animate-pulse">Impact Zone</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-metro-primary/10 p-4 rounded-2xl border border-metro-primary/20">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Capital Uplift</span>
                      <span className="text-lg font-black text-white text-glow">
                        +{stn.station_name === 'Guindy' ? '32.4' : stn.station_name === 'Saidapet' ? '28.1' : '22.5'}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="text-[8px] font-black text-gray-600 uppercase mb-1">Catchment</div>
                          <div className="text-[10px] font-bold text-white uppercase italic">1.5 KM</div>
                       </div>
                       <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="text-[8px] font-black text-gray-600 uppercase mb-1">Status</div>
                          <div className="text-[10px] font-bold text-metro-success uppercase italic">Active</div>
                       </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest">
                       <span>{stn.line} LINE</span>
                       <TrendingUp size={12} className="text-metro-primary" />
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* Catchment Zones (Heatmap Style Circles) */}
        {showHeatmap && Array.isArray(stations) && stations
          .filter(stn => stn && typeof stn.lat === 'number' && Number.isFinite(stn.lat) && typeof (stn.lng ?? stn.lon) === 'number' && Number.isFinite(stn.lng ?? stn.lon))
          .map((stn, idx) => (
          <Circle
            key={`catchment-${idx}`}
            center={[stn.lat, (stn.lng ?? stn.lon ?? 0)]}
            pathOptions={{ 
              fillColor: '#9b5de5', 
              color: 'transparent', 
              fillOpacity: 0.05 
            }}
            radius={1000}
          />
        ))}

        {/* Simulation Point */}
        {simulationPoint && (
          <>
            <Circle
              center={[simulationPoint.lat, simulationPoint.lng]}
              pathOptions={{ 
                fillColor: '#00f5d4', 
                color: '#00f5d4', 
                weight: 2, 
                fillOpacity: 0.8,
                className: 'animate-pulse' 
              }}
              radius={300}
            />
            {/* Ripple Effects */}
            {[500, 1000, 1500].map((radius, i) => (
              <Circle
                key={i}
                center={[simulationPoint.lat, simulationPoint.lng]}
                pathOptions={{ 
                  fillColor: 'transparent', 
                  color: '#00f5d4', 
                  weight: 1, 
                  dashArray: '5, 10',
                  opacity: 0.3 / (i + 1)
                }}
                radius={radius}
              />
            ))}
          </>
        )}
      </MapContainer>

      {/* Map Overlay Controls */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
        <div className="bg-metro-card/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 mb-2">
            System Legends
          </div>
          <div className="space-y-3">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#0072bc] shadow-[0_0_8px_#0072bc]" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Line 1 (Blue)</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#009639] shadow-[0_0_8px_#009639]" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Line 2 (Green)</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-metro-primary shadow-[0_0_8px_#9b5de5]" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Treated Zone</span>
             </div>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="absolute inset-0 bg-metro-dark/80 backdrop-blur-sm z-[2000] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-metro-primary/20 border-t-metro-primary rounded-full animate-spin" />
             <span className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Mapping Geometry</span>
          </div>
        </div>
      )}
    </div>
  );
}
