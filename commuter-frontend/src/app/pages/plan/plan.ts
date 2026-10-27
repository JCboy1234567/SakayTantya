import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

import {
  LucideMapPin,
  LucideCircleDot,
  LucideChevronRight,
  LucideMap,
  LucideArrowRight,
  LucideFuel,
  LucideArrowUpRight,
  LucideClock,
  LucideInfo,
  LucideRotateCcw,
  LucideBus,
  LucideCar,
  LucideCheck,
  LucideSearch,
  LucideX
} from '@lucide/angular';
import { AuthServices } from '../../core/services/auth.services';

interface TagumLocation {
  name: string;
  category: string;
  coords: [number, number];
}

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideMapPin,
    LucideCircleDot,
    LucideChevronRight,
    LucideMap,
    LucideArrowRight,
    LucideFuel,
    LucideArrowUpRight,
    LucideClock,
    LucideInfo,
    LucideRotateCcw,
    LucideBus,
    LucideCar,
    LucideCheck,
    LucideSearch,
    LucideX
  ],
  templateUrl: './plan.html',
  styleUrl: './plan.css'
})
export class Plan implements AfterViewInit, OnDestroy {
  @ViewChild('routeMap', { static: false }) routeMapContainer!: ElementRef;

  // Preset / Dynamic Tagum City Landmarks & Barangays
  tagumLocations: TagumLocation[] = [
    { name: 'Tagum City Hall', category: 'Government', coords: [7.4478, 125.8083] },
    { name: 'Tagum City Public Market', category: 'Commercial', coords: [7.4400, 125.8115] },
    { name: 'Gaisano Mall of Tagum', category: 'Shopping', coords: [7.4452, 125.8035] },
    { name: 'NCCC Mall Tagum', category: 'Shopping', coords: [7.4431, 125.8090] },
    { name: 'Robinsons Place Tagum', category: 'Shopping', coords: [7.4520, 125.7980] },
    { name: 'Tagum City National High School', category: 'Education', coords: [7.4501, 125.8120] },
    { name: 'UM Tagum College', category: 'Education', coords: [7.4420, 125.8075] },
    { name: 'Davao Regional Medical Center', category: 'Healthcare', coords: [7.4610, 125.8150] },
    { name: 'Christ the King Cathedral', category: 'Landmark', coords: [7.4445, 125.8050] },
    { name: 'New Tagum Overland Transport Terminal', category: 'Transport', coords: [7.4320, 125.8180] },
    { name: 'Energy Park, Apokon', category: 'Recreation', coords: [7.4260, 125.8250] },
    { name: 'Brgy. Apokon Hall', category: 'Barangay', coords: [7.4300, 125.8200] },
    { name: 'Brgy. Mankilam Gymnasium', category: 'Barangay', coords: [7.4650, 125.7950] },
    { name: 'Brgy. Visayan Village Market', category: 'Barangay', coords: [7.4490, 125.8010] },
    { name: 'Magugpo Poblacion', category: 'Barangay', coords: [7.4410, 125.8095] }
  ];

  pickupLocation = 'Tagum City Hall';
  destinationLocation = 'Tagum City Public Market';

  pickupCoords: [number, number] = [7.447544, 125.808389];
  destinationCoords: [number, number] = [7.439123, 125.811845];

  fuelPriceLabel = '₱60/L';
  isDarkMode = false;

  // Location Picker Modal State
  showLocationModal = false;
  modalTargetType: 'pickup' | 'destination' = 'pickup';
  searchQuery = '';

  selectionMode: 'pickup' | 'destination' = 'pickup';
  mapLoading = true;
  routeLoading = false;
  routeError: string | null = null;
  distanceKm: number | null = 5.0;

  // Fully Dynamic Vehicles & Fare Rules from Database
  vehicles: any[] = [];
  selectedVehicleId: number | null = null;
  selectedVehicle: any = null;
  fareRulesMap: { [vehicleId: number]: any } = {};
  estimatedFareAmount: number | null = null;
  successModal = false;

  private map: L.Map | null = null;
  private pickupMarker: L.Marker | null = null;
  private destinationMarker: L.Marker | null = null;
  private routePolyline: L.Polyline | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthServices,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';

    window.addEventListener('storage', () => {
      const theme = localStorage.getItem('theme');
      this.isDarkMode = theme === 'dark';
      this.cdr.detectChanges();
    });

    this.fetchDynamicData();
    this.fetchRouteDistance();
  }

  fetchDynamicData() {
    this.authService.getLocations().subscribe({
      next: (res: any) => {
        const rawLocations = res?.data || res;
        if (Array.isArray(rawLocations) && rawLocations.length > 0) {
          this.tagumLocations = rawLocations.map((loc: any) => ({
            name: loc.name,
            category: loc.category || 'Tagum Landmark',
            coords: [Number(loc.latitude), Number(loc.longitude)] as [number, number]
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('Could not fetch locations from database, using defaults:', err);
      }
    });

    this.authService.getVehicles().subscribe({
      next: (res: any) => {
        const rawVehicles = res?.data || res;
        if (Array.isArray(rawVehicles) && rawVehicles.length > 0) {
          this.vehicles = rawVehicles;
          this.selectedVehicleId = this.vehicles[0].id;
          this.updateSelectedVehicle();
        } else {
          this.loadFallbackVehicles();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadFallbackVehicles();
        this.cdr.detectChanges();
      }
    });

    this.authService.getFareRules().subscribe({
      next: (res: any) => {
        const rawRules = res?.data || res;
        if (Array.isArray(rawRules)) {
          rawRules.forEach((rule: any) => {
            if (rule.vehicle_id) {
              this.fareRulesMap[rule.vehicle_id] = rule;
            }
          });
          this.updateSelectedVehicle();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('Could not fetch dynamic fare rules:', err);
      }
    });
  }

  loadFallbackVehicles() {
    this.vehicles = [
      { id: 1, vehicle_name: 'Traditional Jeepney', fuel_type: 'Diesel', description: 'Standard public utility jeepney operating fixed city routes.' },
      { id: 2, vehicle_name: 'Modern E-Jeep', fuel_type: 'Electric / Solar', description: 'Air-conditioned modern commuter transport.' },
      { id: 3, vehicle_name: 'Tricycle', fuel_type: 'Gasoline', description: 'Door-to-door barangay and city commuter tricycle.' }
    ];
    this.fareRulesMap = {
      1: { base_fare: 13.00, rate_per_km: 2.20 },
      2: { base_fare: 15.00, rate_per_km: 2.50 },
      3: { base_fare: 30.00, rate_per_km: 5.00 }
    };
    this.selectedVehicleId = this.vehicles[0].id;
    this.updateSelectedVehicle();
  }

  selectVehicle(vehicle: any) {
    this.selectedVehicleId = vehicle.id;
    this.updateSelectedVehicle();
  }

  updateSelectedVehicle() {
    if (!this.selectedVehicleId) return;
    const vehicle = this.vehicles.find(v => Number(v.id) === Number(this.selectedVehicleId));
    const rule = this.fareRulesMap[this.selectedVehicleId] || {};

    if (vehicle) {
      this.selectedVehicle = {
        ...vehicle,
        name: vehicle.vehicle_name || vehicle.name || 'Vehicle',
        base_fare: Number(rule.base_fare ?? vehicle.base_fare ?? 13.00),
        per_km_rate: Number(rule.rate_per_km ?? rule.per_km_rate ?? vehicle.per_km_rate ?? 2.20),
        description: vehicle.description || 'Public utility transport operating across Tagum City routes.'
      };
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.initMap();
        }, 500);
      });
    }
  }

  private initMap() {
    const containerEl = this.routeMapContainer?.nativeElement;
    if (!containerEl) {
      setTimeout(() => this.initMap(), 500);
      return;
    }

    try {
      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      this.map = L.map(containerEl, {
        zoomControl: false,
        attributionControl: false
      }).setView(this.pickupCoords, 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(this.map);

      L.control.zoom({ position: 'topright' }).addTo(this.map);

      this.updateMarkersAndRoute();

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.ngZone.run(() => {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;

          if (this.selectionMode === 'pickup') {
            this.pickupCoords = [lat, lng];
            this.pickupLocation = `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            this.selectionMode = 'destination';
          } else {
            this.destinationCoords = [lat, lng];
            this.destinationLocation = `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            this.selectionMode = 'pickup';
          }

          this.updateMarkersAndRoute();
          this.fetchRouteDistance();
          this.cdr.detectChanges();
        });
      });

      this.ngZone.run(() => {
        this.mapLoading = false;
        this.cdr.detectChanges();
      });

      setTimeout(() => {
        this.map?.invalidateSize();
      }, 300);
    } catch (e) {
      console.error('Error initializing Leaflet map:', e);
      this.ngZone.run(() => {
        this.mapLoading = false;
        this.cdr.detectChanges();
      });
    }
  }

  private updateMarkersAndRoute() {
    if (!this.map) return;

    if (this.pickupMarker) this.map.removeLayer(this.pickupMarker);
    if (this.destinationMarker) this.map.removeLayer(this.destinationMarker);
    if (this.routePolyline) this.map.removeLayer(this.routePolyline);

    const greenIcon = L.divIcon({
      className: 'custom-pin-icon',
      html: '<div style="background-color: #155b32; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const redIcon = L.divIcon({
      className: 'custom-pin-icon',
      html: '<div style="background-color: #dc2626; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    this.pickupMarker = L.marker(this.pickupCoords, { icon: greenIcon }).addTo(this.map);
    this.destinationMarker = L.marker(this.destinationCoords, { icon: redIcon }).addTo(this.map);

    this.routePolyline = L.polyline([this.pickupCoords, this.destinationCoords], {
      color: '#155b32',
      weight: 5,
      opacity: 0.85,
      dashArray: '6, 6'
    }).addTo(this.map);

    const bounds = L.latLngBounds([this.pickupCoords, this.destinationCoords]);
    this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }

  private fetchRouteDistance() {
    this.routeLoading = true;
    this.routeError = null;
    this.cdr.detectChanges();

    const url = `https://router.project-osrm.org/route/v1/driving/${this.pickupCoords[1]},${this.pickupCoords[0]};${this.destinationCoords[1]},${this.destinationCoords[0]}?overview=full&geometries=geojson`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.routeLoading = false;
        if (res.routes && res.routes.length > 0) {
          const meters = res.routes[0].distance;
          this.distanceKm = meters / 1000;

          if (res.routes[0].geometry && res.routes[0].geometry.coordinates && this.map) {
            const coords: [number, number][] = res.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            if (this.routePolyline) {
              this.map.removeLayer(this.routePolyline);
            }
            this.routePolyline = L.polyline(coords, {
              color: '#155b32',
              weight: 5,
              opacity: 0.9
            }).addTo(this.map);
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('OSRM routing failed, calculating straight-line fallback', err);
        this.routeLoading = false;
        this.distanceKm = this.calculateHaversineDistance(
          this.pickupCoords[0], this.pickupCoords[1],
          this.destinationCoords[0], this.destinationCoords[1]
        ) * 1.3;
        this.cdr.detectChanges();
      }
    });
  }

  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Open Tagum Place Selector Modal
  openLocationModal(target: 'pickup' | 'destination'): void {
    this.modalTargetType = target;
    this.searchQuery = '';
    this.showLocationModal = true;
    this.cdr.detectChanges();
  }

  closeLocationModal(): void {
    this.showLocationModal = false;
    this.cdr.detectChanges();
  }

  selectPlace(loc: TagumLocation): void {
    if (this.modalTargetType === 'pickup') {
      this.pickupLocation = loc.name;
      this.pickupCoords = loc.coords;
    } else {
      this.destinationLocation = loc.name;
      this.destinationCoords = loc.coords;
    }
    this.showLocationModal = false;
    this.updateMarkersAndRoute();
    this.fetchRouteDistance();
    this.cdr.detectChanges();
  }

  get filteredLocations(): TagumLocation[] {
    if (!this.searchQuery.trim()) {
      return this.tagumLocations;
    }
    const q = this.searchQuery.toLowerCase();
    return this.tagumLocations.filter(l =>
      l.name.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)
    );
  }

  selectLocation(type: 'pickup' | 'destination'): void {
    this.openLocationModal(type);
  }

  clearRoute(): void {
    this.pickupCoords = [7.447544, 125.808389];
    this.destinationCoords = [7.439123, 125.811845];
    this.pickupLocation = 'Tagum City Hall';
    this.destinationLocation = 'Tagum City Public Market';
    this.distanceKm = 5.0;
    this.selectionMode = 'pickup';
    this.estimatedFareAmount = null;
    this.updateMarkersAndRoute();
    this.fetchRouteDistance();
    this.cdr.detectChanges();
  }

  estimateFare(): void {
    if (!this.selectedVehicle) return;

    const baseFare = Number(this.selectedVehicle.base_fare || 13);
    const perKmRate = Number(this.selectedVehicle.per_km_rate || 2.2);
    const dist = this.distanceKm || 5.0;

    let calculated = baseFare;
    if (dist > 4) {
      calculated += (dist - 4) * perKmRate;
    }

    this.estimatedFareAmount = Math.round(calculated * 100) / 100;
    this.successModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.successModal = false;
    this.cdr.detectChanges();
  }

  openFuelCosts(): void {
    this.router.navigate(['/main-dashboard/fuels']);
  }

  toNumber(val: any): number {
    return Number(val || 0);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
