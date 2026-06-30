"use client";
// ============================================================
// useGeolocation — Solicita e retorna posição do usuário
// ============================================================

import { useState, useEffect, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  erro: string | null;
  carregando: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null, longitude: null, erro: null, carregando: false,
  });

  const solicitar = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, erro: "Geolocalização não suportada neste navegador." }));
      return;
    }
    setState((s) => ({ ...s, carregando: true, erro: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => setState({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        erro: null, carregando: false,
      }),
      (err) => setState((s) => ({ ...s, erro: err.message, carregando: false }))
    );
  }, []);

  return { ...state, solicitar };
}
