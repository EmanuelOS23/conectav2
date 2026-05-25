"use client";

import React from "react";
import { cn } from "@/utils";

interface MapContainerProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: string;
  className?: string;
  label?: string;
}

/**
 * MapContainer
 * ─────────────────────────────────────────────────────────────
 * Estrutura preparada para futura integração com mapa real.
 * 
 * Para integrar:
 *   - Google Maps:  @react-google-maps/api
 *   - Mapbox GL:    mapbox-gl + react-map-gl
 *   - Leaflet:      leaflet + react-leaflet (gratuito e open-source)
 * 
 * Variável de ambiente necessária: NEXT_PUBLIC_MAP_API_KEY
 * ─────────────────────────────────────────────────────────────
 */
export function MapContainer({
  latitude, longitude, zoom = 14, height = "300px", className, label,
}: MapContainerProps) {
  const hasCoords = latitude != null && longitude != null;

  return (
    <div
      role="region"
      aria-label={label ?? "Mapa de localização"}
      className={cn("rounded-card overflow-hidden border border-neutral-200", className)}
      style={{ height }}
    >
      {/* TODO: substituir pelo componente de mapa real */}
      <div className="w-full h-full bg-brand-50 flex flex-col items-center justify-center gap-3 text-brand-700">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        {hasCoords ? (
          <>
            <p className="text-sm font-semibold">
              {latitude!.toFixed(4)}, {longitude!.toFixed(4)}
            </p>
            <p className="text-xs text-neutral-500">Mapa será exibido aqui</p>
            <p className="text-xs text-neutral-400 max-w-xs text-center">
              Configure NEXT_PUBLIC_MAP_API_KEY e substitua este componente pela
              integração com Google Maps, Leaflet ou Mapbox.
            </p>
          </>
        ) : (
          <p className="text-sm text-neutral-500">Localização não disponível</p>
        )}
      </div>
    </div>
  );
}
