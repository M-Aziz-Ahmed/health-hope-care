'use client';
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

// Custom icons with better visibility
const staffIcon = L.divIcon({
    className: 'custom-staff-marker',
    html: `<div style="
        width: 40px;
        height: 40px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 18px;
    ">👨‍⚕️</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const patientIcon = L.divIcon({
    className: 'custom-patient-marker',
    html: `<div style="
        width: 40px;
        height: 40px;
        background: #ef4444;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 18px;
    ">🏠</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

function ChangeView({ bounds }) {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length === 2) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
    }, [bounds, map]);
    return null;
}

function MapBounds({ startLocation, endLocation }) {
    const map = useMap();
    useEffect(() => {
        if (startLocation && endLocation) {
            const bounds = L.latLngBounds([startLocation, endLocation]);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        } else if (startLocation || endLocation) {
            const location = startLocation || endLocation;
            map.setView(location, 15);
        }
    }, [startLocation, endLocation, map]);
    return null;
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

export default function MapComponent({
    startLocation, // [lat, lng]
    endLocation,   // [lat, lng]
    showRoute = false,
    staffName = "Staff",
    patientName = "Patient",
    onRouteCalculated = null
}) {
    const [route, setRoute] = useState([]);
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showRoute && startLocation && endLocation) {
            fetchRoute();
        } else {
            setRoute([]);
            setDistance(null);
            setDuration(null);
        }
    }, [startLocation, endLocation, showRoute]);

    const fetchRoute = async () => {
        setLoading(true);
        try {
            // Use OSRM (Open Source Routing Machine) for free routing
            // Format: [lng, lat] for OSRM
            const start = `${startLocation[1]},${startLocation[0]}`;
            const end = `${endLocation[1]},${endLocation[0]}`;
            
            // Try OSRM routing service
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
            
            try {
                const response = await fetch(osrmUrl);
                const data = await response.json();
                
                if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                    const routeData = data.routes[0];
                    const geometry = routeData.geometry.coordinates;
                    
                    // Convert from [lng, lat] to [lat, lng] for Leaflet
                    const routePoints = geometry.map(coord => [coord[1], coord[0]]);
                    setRoute(routePoints);
                    
                    // Calculate distance and duration
                    const dist = (routeData.distance / 1000).toFixed(2); // Convert to km
                    const dur = Math.round(routeData.duration / 60); // Convert to minutes
                    setDistance(dist);
                    setDuration(dur);
                    
                    if (onRouteCalculated) {
                        onRouteCalculated({ distance: dist, duration: dur, route: routePoints });
                    }
                } else {
                    // Fallback to straight line if routing fails
                    setRoute([startLocation, endLocation]);
                    const dist = calculateDistance(startLocation[0], startLocation[1], endLocation[0], endLocation[1]);
                    setDistance(dist.toFixed(2));
                    setDuration(Math.round(dist * 2)); // Estimate 2 min per km
                }
            } catch (error) {
                console.error('OSRM routing error:', error);
                // Fallback to straight line
                setRoute([startLocation, endLocation]);
                const dist = calculateDistance(startLocation[0], startLocation[1], endLocation[0], endLocation[1]);
                setDistance(dist.toFixed(2));
                setDuration(Math.round(dist * 2));
            }
        } catch (error) {
            console.error('Route calculation error:', error);
            setRoute([startLocation, endLocation]);
        } finally {
            setLoading(false);
        }
    };

    const center = startLocation || endLocation || [31.5204, 74.3587]; // Default to Lahore

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    Calculating route...
                </div>
            )}
            {(distance || duration) && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    <div>📍 Distance: {distance} km</div>
                    <div>⏱️ ETA: ~{duration} min</div>
                </div>
            )}
            <MapContainer 
                center={center} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <MapBounds startLocation={startLocation} endLocation={endLocation} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {startLocation && (
                    <Marker position={startLocation} icon={staffIcon}>
                        <Popup>
                            <div style={{ textAlign: 'center' }}>
                                <strong>{staffName}</strong><br />
                                <small>Your Current Location</small>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {endLocation && (
                    <Marker position={endLocation} icon={patientIcon}>
                        <Popup>
                            <div style={{ textAlign: 'center' }}>
                                <strong>{patientName}</strong><br />
                                <small>Destination</small>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {showRoute && route.length > 0 && (
                    <Polyline 
                        positions={route} 
                        color="#3b82f6" 
                        weight={5}
                        opacity={0.7}
                        dashArray=""
                    />
                )}
            </MapContainer>
        </div>
    );
}
