import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

import {
  LucideMapPin,
  LucideChevronRight,
  LucideArrowRight,
  LucideFuel,
  LucideArrowUpRight,
  LucideRotateCcw,
  LucideCheck,
  LucideSearch,
  LucideX,
  LucideTruck
} from '@lucide/angular';

import { AuthServices } from '../../core/services/auth.services';
import { Subject, Subscription, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap
} from 'rxjs/operators';

interface TagumLocation {
  name: string;
  category: string;
  coords: [number, number];
  address?: string;
}

interface PhotonFeature {
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    osm_value?: string;
  };

  geometry?: {
    coordinates?: number[];
  };
}

interface SuggestedRoute {
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][];
}

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideMapPin,
    LucideChevronRight,
    LucideArrowRight,
    LucideFuel,
    LucideArrowUpRight,
    LucideRotateCcw,
    LucideCheck,
    LucideSearch,
    LucideX,
    LucideTruck
  ],
  templateUrl: './plan.html',
  styleUrl: './plan.css'
})
export class Plan implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('routeMap', { static: false })
  routeMapContainer!: ElementRef<HTMLDivElement>;

  tagumLocations: TagumLocation[] = [
    { name: 'Tagum City Hall', category: 'Government / Landmark', coords: [7.4478, 125.8083], address: 'JV Ayala Avenue, Tagum City' },
    { name: 'Gaisano Grand Mall Tagum', category: 'Shopping Mall', coords: [7.4432, 125.8051], address: 'National Highway, Tagum City' },
    { name: 'Robinsons Place Tagum', category: 'Shopping Mall', coords: [7.4265, 125.8042], address: 'National Highway, Tagum City' },
    { name: 'Tagum Doctors Hospital', category: 'Medical / Hospital', coords: [7.4410, 125.8078], address: 'Rizal Street, Tagum City' },
    { name: 'Tagum City Public Market', category: 'Market / Commercial', coords: [7.4490, 125.8112], address: 'Pioneer Avenue, Tagum City' },
    { name: 'New Tagum City Overland Transport Terminal', category: 'Transport Terminal', coords: [7.4201, 125.8009], address: 'Diversion Road, Tagum City' },
    { name: 'Tagum National Trade School', category: 'School / Education', coords: [7.4520, 125.8150], address: 'Apokon Road, Tagum City' },
    { name: 'Davao del Norte State College', category: 'College / Education', coords: [7.4612, 125.8234], address: 'Panabo - Tagum Road, New Visayas, Tagum City' },
    { name: 'Christ the King Cathedral', category: 'Religious Landmark', coords: [7.4445, 125.8090], address: 'Rizal Street, Tagum City' },
    { name: 'Energy Park (E-Park)', category: 'Park / Recreation', coords: [7.4678, 125.8035], address: 'Apokon, Tagum City' }
  ];

  pickupLocation = '';
  destinationLocation = '';

  pickupCoords: [number, number] = [7.4478, 125.8083];
  destinationCoords: [number, number] = [7.4400, 125.8115];

  fuelPricePerLiter = 60;
  baselineFuelPrice = 50;
  fuelWeight = 0.35; // 35% fuel component weight

  // Calculation details exposed for modal view
  calcDetails: {
    standardFare: number;
    fuelFactor: number;
    effectiveMultiplier: number;
    fuelAdjustment: number;
    litersConsumed: number;
  } = {
    standardFare: 0,
    fuelFactor: 1,
    effectiveMultiplier: 1,
    fuelAdjustment: 0,
    litersConsumed: 0
  };

  get fuelPriceLabel(): string {
    return `₱${this.fuelPricePerLiter.toFixed(2)}/L`;
  }

  get driverFareComparison(): { status: 'higher' | 'lower' | 'same'; difference: number } | null {
    if (
      this.estimatedFareAmount === null ||
      this.driverFare === null ||
      !Number.isFinite(this.driverFare) ||
      this.driverFare < 0
    ) {
      return null;
    }

    const difference = Math.round(
      Math.abs(this.driverFare - this.estimatedFareAmount) * 100
    ) / 100;

    return {
      status: difference === 0
        ? 'same'
        : this.driverFare > this.estimatedFareAmount ? 'higher' : 'lower',
      difference
    };
  }

  isDarkMode = false;

  showLocationModal = false;
  modalTargetType: 'pickup' | 'destination' = 'pickup';
  modalDragOffset = 0;
  isDraggingLocationModal = false;
  private modalDragStartY: number | null = null;
  searchQuery = '';
  selectionMode: 'pickup' | 'destination' = 'pickup';

  mapLoading = true;
  routeLoading = false;
  isCalculatingFare = false;
  routeError: string | null = null;
  distanceKm: number | null = null;
  suggestedRoutes: SuggestedRoute[] = [];
  selectedRouteIndex = 0;

  isSearchingPlaces = false;
  placeSearchError: string | null = null;
  remoteLocations: TagumLocation[] = [];

  vehicles: any[] = [];
  selectedVehicleId: number | null = null;
  selectedVehicle: any = null;

  fareRulesMap: { [vehicleId: number]: any } = {};

  estimatedFareAmount: number | null = null;
  estimatedFuelExpense: number | null = null;
  driverFare: number | null = null;
  successModal = false;

  private map: L.Map | null = null;
  private pickupMarker: L.Marker | null = null;
  private destinationMarker: L.Marker | null = null;
  private routePolylines: L.Polyline[] = [];

  private browser = false;
  private storageListener?: (event: StorageEvent) => void;

  private searchTerms$ = new Subject<string>();
  private searchSubscription?: Subscription;
  private routeRequestId = 0;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthServices,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.browser = isPlatformBrowser(this.platformId);

    if (this.browser) {
      this.isDarkMode = localStorage.getItem('theme') === 'dark';

      this.storageListener = (event: StorageEvent) => {
        if (event.key === 'theme') {
          this.isDarkMode = event.newValue === 'dark';
          this.cdr.detectChanges();
        }
      };

      window.addEventListener('storage', this.storageListener);
    }

    this.setupPlaceSearch();
    this.fetchDynamicData();
  }

  private setupPlaceSearch(): void {
    this.searchSubscription = this.searchTerms$
      .pipe(
        map(value => value.trim()),
        debounceTime(350),
        distinctUntilChanged(),
        switchMap(query => {
          if (query.length < 2) {
            this.isSearchingPlaces = false;
            this.placeSearchError = null;
            this.remoteLocations = [];
            return of([] as TagumLocation[]);
          }

          this.isSearchingPlaces = true;
          this.placeSearchError = null;

          return this.http.get<any>(
            'https://photon.komoot.io/api/',
            {
              params: {
                q: query,
                lat: '7.4478',
                lon: '125.8083',
                limit: '15',
                lang: 'en'
              }
            }
          ).pipe(
            map(response =>
              (response?.features || [])
                .map((feature: PhotonFeature) =>
                  this.photonFeatureToLocation(feature)
                )
                .filter(
                  (location: TagumLocation | null):
                    location is TagumLocation => location !== null
                )
            ),
            catchError(() => {
              this.placeSearchError =
                'Hindi ma-load ang online search. Tingnan ang internet connection at subukan ulit.';
              return of([] as TagumLocation[]);
            })
          );
        })
      )
      .subscribe(locations => {
        this.remoteLocations = locations;
        this.isSearchingPlaces = false;
        this.cdr.detectChanges();
      });
  }

  onSearchQueryChange(value: string): void {
    this.searchQuery = value;
    this.searchTerms$.next(value);
  }

  private photonFeatureToLocation(
    feature: PhotonFeature
  ): TagumLocation | null {
    const properties = feature.properties;
    const coordinates = feature.geometry?.coordinates;

    if (
      !properties ||
      !coordinates ||
      coordinates.length < 2 ||
      !Number.isFinite(coordinates[0]) ||
      !Number.isFinite(coordinates[1])
    ) {
      return null;
    }

    const longitude = coordinates[0];
    const latitude = coordinates[1];

    const name =
      properties.name ||
      [properties.housenumber, properties.street]
        .filter(Boolean)
        .join(' ') ||
      properties.district ||
      properties.city;

    if (!name) {
      return null;
    }

    const address = [
      properties.housenumber,
      properties.street,
      properties.district,
      properties.city,
      properties.county,
      properties.state,
      properties.country
    ]
      .filter((value): value is string => Boolean(value))
      .join(', ');

    return {
      name,
      category: properties.osm_value || 'Online place',
      address,
      coords: [latitude, longitude]
    };
  }

  get filteredLocations(): TagumLocation[] {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      // Return the 10 popular Tagum City suggested places when query is empty
      return this.tagumLocations;
    }

    const combinedList = [...this.tagumLocations, ...this.remoteLocations];

    return combinedList.filter(location => {
      const searchableText = [
        location.name,
        location.category,
        location.address
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }

  fetchDynamicData(): void {
    this.authService.getVehicles().subscribe({
      next: (response: any) => {
        const rawVehicles = response?.data || response;

        if (Array.isArray(rawVehicles) && rawVehicles.length) {
          // Filter ONLY active vehicles for commuters (is_active == 1 or true)
          this.vehicles = rawVehicles.filter((v: any) => v.is_active == 1 || v.is_active === true || v.is_active === '1');
          
          if (this.vehicles.length > 0) {
            this.selectedVehicleId = Number(this.vehicles[0].id);
            this.updateSelectedVehicle();
          } else {
            this.loadFallbackVehicles();
          }
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

    this.authService.getFuelPrices().subscribe({
      next: (response: any) => {
        const prices = response?.data || response;
        if (Array.isArray(prices) && prices.length > 0) {
          const dieselOrGas = prices.find((p: any) => p.price_per_liter) || prices[0];
          if (dieselOrGas && dieselOrGas.price_per_liter) {
            this.fuelPricePerLiter = Number(dieselOrGas.price_per_liter);
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.authService.getFareRules().subscribe({
      next: (response: any) => {
        const rawRules = response?.data || response;

        if (Array.isArray(rawRules)) {
          this.fareRulesMap = {};

          rawRules.forEach((rule: any) => {
            if (rule.vehicle_id == null) {
              return;
            }

            const vehicleId = Number(rule.vehicle_id);
            const currentRule = this.fareRulesMap[vehicleId];

            if (
              !currentRule ||
              String(rule.valid_from || '') >= String(currentRule.valid_from || '')
            ) {
              this.fareRulesMap[vehicleId] = rule;
            }
          });

          this.updateSelectedVehicle();
        }

        this.cdr.detectChanges();
      },
      error: error => {
        console.warn('Could not load fare rules.', error);
      }
    });
  }

  private loadFallbackVehicles(): void {
    this.vehicles = [
      {
        id: 1,
        vehicle_name: 'Traditional Jeepney',
        fuel_type: 'Diesel',
        fuel_efficiency_km_per_liter: 8,
        description: 'Example vehicle data for interface testing.'
      },
      {
        id: 2,
        vehicle_name: 'Modern E-Jeep',
        fuel_type: 'Electric',
        fuel_efficiency_km_per_liter: 0,
        description: 'Electric vehicle; fuel expense is not calculated for this vehicle.'
      },
      {
        id: 3,
        vehicle_name: 'Tricycle',
        fuel_type: 'Gasoline',
        fuel_efficiency_km_per_liter: 25,
        description: 'Example vehicle data for interface testing.'
      }
    ];

    this.fareRulesMap = {
      1: { base_fare: 13, included_distance_km: 4, rate_per_km: 2.2, minimum_fare: 13 },
      2: { base_fare: 15, included_distance_km: 4, rate_per_km: 2.5, minimum_fare: 15 },
      3: { base_fare: 30, included_distance_km: 1, rate_per_km: 5, minimum_fare: 30 }
    };

    this.selectedVehicleId = this.vehicles[0].id;
    this.updateSelectedVehicle();
  }

  selectVehicle(vehicle: any): void {
    this.selectedVehicleId = Number(vehicle.id);
    this.updateSelectedVehicle();

    this.estimatedFareAmount = null;
    this.estimatedFuelExpense = null;
    this.driverFare = null;
    this.successModal = false;
  }

  private updateSelectedVehicle(): void {
    if (this.selectedVehicleId == null) {
      return;
    }

    const vehicle = this.vehicles.find(
      item => Number(item.id) === Number(this.selectedVehicleId)
    );

    if (!vehicle) {
      return;
    }

    const rule = this.fareRulesMap[Number(this.selectedVehicleId)] || {};

    this.selectedVehicle = {
      ...vehicle,
      name: vehicle.vehicle_name || vehicle.name || 'Vehicle',
      base_fare: this.toNumber(rule.base_fare ?? vehicle.base_fare ?? 0),
      included_distance_km: this.toNumber(rule.included_distance_km ?? vehicle.included_distance_km ?? 0),
      per_km_rate: this.toNumber(rule.rate_per_km ?? rule.per_km_rate ?? vehicle.per_km_rate ?? 0),
      minimum_fare: this.toNumber(rule.minimum_fare ?? vehicle.minimum_fare ?? rule.base_fare ?? vehicle.base_fare ?? 0),
      description: vehicle.description || 'Public utility transport operating across Tagum City routes.'
    };
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.initMap();

        setTimeout(() => {
          this.map?.invalidateSize();
        }, 200);
      }, 0);
    });
  }

  private initMap(): void {
    const container = this.routeMapContainer?.nativeElement;

    if (!container || !this.browser) {
      this.mapLoading = false;
      return;
    }

    try {
      if (this.map) {
        this.map.remove();
      }

      this.map = L.map(container, {
        zoomControl: false,
        attributionControl: true
      }).setView(this.pickupCoords, 14);

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }
      ).addTo(this.map);

      L.control.zoom({ position: 'topright' }).addTo(this.map);

      this.updateMarkersAndRoute();

      this.map.on('click', (event: L.LeafletMouseEvent) => {
        this.ngZone.run(() => {
          const coords: [number, number] = [event.latlng.lat, event.latlng.lng];

          this.destinationCoords = coords;
          this.destinationLocation = `Map pin (${coords[0].toFixed(5)}, ${coords[1].toFixed(5)})`;

          this.estimatedFareAmount = null;
          this.estimatedFuelExpense = null;
          this.driverFare = null;

          this.updateMarkersAndRoute();
          this.fetchRouteDistance();
          this.cdr.detectChanges();
        });
      });

      this.ngZone.run(() => {
        this.mapLoading = false;
        this.cdr.detectChanges();
      });

      setTimeout(() => this.map?.invalidateSize(), 200);

      this.fetchRouteDistance();
    } catch (error) {
      console.error('Leaflet initialization failed:', error);

      this.ngZone.run(() => {
        this.mapLoading = false;
        this.routeError = 'Hindi ma-load ang mapa. I-refresh ang page at subukan muli.';
        this.cdr.detectChanges();
      });
    }
  }

  private updateMarkersAndRoute(): void {
    if (!this.map) {
      return;
    }

    if (this.pickupMarker) {
      this.map.removeLayer(this.pickupMarker);
    }

    if (this.destinationMarker) {
      this.map.removeLayer(this.destinationMarker);
    }

    this.removeRouteLine();

    const pickupIcon = L.divIcon({
      className: 'custom-pin-icon',
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
          <div style="background:linear-gradient(135deg,#10b981,#059669);color:white;font-size:11px;font-weight:700;padding:3px 8px;border-radius:12px;box-shadow:0 2px 8px rgba(16,185,129,0.4);white-space:nowrap">Pickup</div>
          <img src="/icons/icon-indicator.png" style="width:36px;height:36px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.3))"/>
        </div>
      `,
      iconSize: [36, 56],
      iconAnchor: [18, 56]
    });

    const destinationIcon = L.divIcon({
      className: 'custom-pin-icon',
      html: '<div style="background:#dc2626;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 3px 6px rgba(0,0,0,.4)"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    this.pickupMarker = L.marker(this.pickupCoords, { icon: pickupIcon, interactive: false }).addTo(this.map);
    this.destinationMarker = L.marker(this.destinationCoords, { icon: destinationIcon }).addTo(this.map);

    this.map.fitBounds(
      L.latLngBounds([this.pickupCoords, this.destinationCoords]),
      { padding: [35, 35], maxZoom: 16 }
    );
  }

  private fetchRouteDistance(): void {
    if (!this.browser) {
      return;
    }

    const requestId = ++this.routeRequestId;

    this.routeLoading = true;
    this.routeError = null;
    this.distanceKm = null;
    this.estimatedFareAmount = null;
    this.estimatedFuelExpense = null;
    this.driverFare = null;

    this.cdr.detectChanges();

    const [pickupLat, pickupLng] = this.pickupCoords;
    const [destinationLat, destinationLng] = this.destinationCoords;

    const url = `https://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${destinationLng},${destinationLat}?alternatives=2&overview=full&geometries=geojson&steps=false`;

    this.http.get<any>(url).subscribe({
      next: response => {
        if (requestId !== this.routeRequestId) {
          return;
        }

        this.routeLoading = false;

        if (response?.code !== 'Ok' || !response.routes?.length) {
          this.distanceKm = null;
          this.suggestedRoutes = [];
          this.selectedRouteIndex = 0;
          this.routeError = 'Walang road route na nakita para sa napiling locations.';
          this.removeRouteLine();
          this.cdr.detectChanges();
          return;
        }

        this.suggestedRoutes = (response.routes || [])
          .map((route: any): SuggestedRoute | null => {
            const coordinates = route.geometry?.coordinates;
            const distanceKm = Number(route.distance) / 1000;
            const durationMinutes = Number(route.duration) / 60;

            if (!Array.isArray(coordinates) || !coordinates.length || !Number.isFinite(distanceKm)) {
              return null;
            }

            return {
              distanceKm,
              durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : 0,
              coordinates: coordinates.map(
                (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
              )
            };
          })
          .filter((route: SuggestedRoute | null): route is SuggestedRoute => route !== null);

        if (!this.suggestedRoutes.length) {
          this.distanceKm = null;
          this.routeError = 'Walang road route na nakita para sa napiling locations.';
          this.removeRouteLine();
          this.cdr.detectChanges();
          return;
        }

        this.selectedRouteIndex = 0;
        this.distanceKm = this.suggestedRoutes[0].distanceKm;
        this.drawSuggestedRoutes(true);
        this.cdr.detectChanges();
        if (this.pickupLocation && this.destinationLocation) {
          this.autoCalculateFare();
        }
      },
      error: () => {
        if (requestId !== this.routeRequestId) {
          return;
        }
        this.routeLoading = false;
        this.distanceKm = null;
        this.suggestedRoutes = [];
        this.selectedRouteIndex = 0;
        this.routeError = 'Hindi makuha ang road distance ngayon.';
        this.removeRouteLine();
        this.cdr.detectChanges();
      }
    });
  }

  private removeRouteLine(): void {
    if (this.map) {
      this.routePolylines.forEach(polyline => this.map?.removeLayer(polyline));
    }
    this.routePolylines = [];
  }

  private drawSuggestedRoutes(fitBounds = false): void {
    if (!this.map) {
      return;
    }

    this.removeRouteLine();

    const routeOrder = this.suggestedRoutes
      .map((_, index) => index)
      .sort((first, second) => Number(first === this.selectedRouteIndex) - Number(second === this.selectedRouteIndex));

    routeOrder.forEach(index => {
      const route = this.suggestedRoutes[index];
      const isSelected = index === this.selectedRouteIndex;
      const line = L.polyline(route.coordinates, {
        color: isSelected ? '#15803d' : '#86efac',
        weight: isSelected ? 6 : 5,
        opacity: isSelected ? 1 : 0.95,
        bubblingMouseEvents: false
      }).addTo(this.map!);

      line.on('click', () => {
        this.ngZone.run(() => this.selectSuggestedRoute(index));
      });

      this.routePolylines.push(line);
    });

    if (fitBounds && this.routePolylines.length) {
      const bounds = L.featureGroup(this.routePolylines).getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [35, 35], maxZoom: 16 });
      }
    }
  }

  selectSuggestedRoute(index: number): void {
    const route = this.suggestedRoutes[index];
    if (!route) {
      return;
    }

    this.selectedRouteIndex = index;
    this.distanceKm = route.distanceKm;
    this.estimatedFareAmount = null;
    this.estimatedFuelExpense = null;
    this.driverFare = null;
    this.drawSuggestedRoutes();
    this.cdr.detectChanges();

    if (this.pickupLocation && this.destinationLocation) {
      this.autoCalculateFare();
    }
  }

  openLocationModal(target: 'pickup' | 'destination'): void {
    this.modalTargetType = target;
    this.modalDragOffset = 0;
    this.isDraggingLocationModal = false;
    this.modalDragStartY = null;
    this.searchQuery = '';
    this.remoteLocations = [];
    this.placeSearchError = null;
    this.showLocationModal = true;
    this.searchTerms$.next('');
    this.cdr.detectChanges();
  }

  closeLocationModal(): void {
    this.showLocationModal = false;
    this.modalDragStartY = null;
    this.modalDragOffset = 0;
    this.isDraggingLocationModal = false;
  }

  startLocationModalDrag(event: PointerEvent): void {
    if (
      event.button !== 0 ||
      (event.target instanceof Element && event.target.closest('button'))
    ) {
      return;
    }

    this.modalDragStartY = event.clientY;
    this.modalDragOffset = 0;
    this.isDraggingLocationModal = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  moveLocationModalDrag(event: PointerEvent): void {
    if (this.modalDragStartY === null || !this.isDraggingLocationModal) {
      return;
    }

    this.modalDragOffset = Math.max(0, event.clientY - this.modalDragStartY);
  }

  endLocationModalDrag(): void {
    if (this.modalDragOffset > 90) {
      this.closeLocationModal();
      return;
    }

    this.modalDragStartY = null;
    this.modalDragOffset = 0;
    this.isDraggingLocationModal = false;
  }

  selectPlace(location: TagumLocation): void {
    if (this.modalTargetType === 'pickup') {
      this.pickupLocation = location.name;
      this.pickupCoords = [...location.coords] as [number, number];
    } else {
      this.destinationLocation = location.name;
      this.destinationCoords = [...location.coords] as [number, number];
    }

    this.showLocationModal = false;
    this.estimatedFareAmount = null;
    this.estimatedFuelExpense = null;
    this.driverFare = null;

    this.updateMarkersAndRoute();
    this.fetchRouteDistance();
    this.cdr.detectChanges();
  }

  clearRoute(): void {
    this.pickupCoords = [7.4478, 125.8083];
    this.destinationCoords = [7.4400, 125.8115];
    this.pickupLocation = '';
    this.destinationLocation = '';
    this.selectionMode = 'pickup';
    this.estimatedFareAmount = null;
    this.estimatedFuelExpense = null;
    this.driverFare = null;

    this.updateMarkersAndRoute();
    this.fetchRouteDistance();
  }

  private autoCalculateFare(): void {
    if (!this.selectedVehicle || this.routeLoading || this.distanceKm === null || this.distanceKm <= 0) {
      return;
    }

    this.isCalculatingFare = true;
    this.routeError = null;
    this.cdr.detectChanges();

    setTimeout(() => {
      const vehicleId = Number(this.selectedVehicle.id);
      const rule = this.fareRulesMap[vehicleId];

      if (!rule) {
        this.isCalculatingFare = false;
        this.routeError = 'Walang fare rule para sa napiling vehicle.';
        this.cdr.detectChanges();
        return;
      }

      const baseFare = this.toNumber(rule.base_fare);
      const includedDistance = this.toNumber(rule.included_distance_km);
      const ratePerKm = this.toNumber(rule.rate_per_km);
      const minimumFare = this.toNumber(rule.minimum_fare);

      const currentDistance = this.distanceKm ?? 0;
      const extraDistance = Math.max(0, currentDistance - includedDistance);
      const standardFare = baseFare + extraDistance * ratePerKm;

      // Apply weighted fuel-indexed formula:
      // FuelFactor = CurrentFuel / BaselineFuel
      // EffectiveMultiplier = 1 + FuelWeight * (FuelFactor - 1)
      const fuelFactor = this.fuelPricePerLiter / this.baselineFuelPrice;
      const effectiveMultiplier = 1.0 + this.fuelWeight * (fuelFactor - 1.0);

      const rawAdjustedFare = standardFare * effectiveMultiplier;
      this.estimatedFareAmount = Math.max(
        minimumFare,
        Math.round((rawAdjustedFare + Number.EPSILON) * 100) / 100
      );

      // Save calculation metrics for display
      const fuelAdjustment = Math.round((this.estimatedFareAmount - standardFare) * 100) / 100;
      const efficiency = this.toNumber(this.selectedVehicle.fuel_efficiency_km_per_liter);
      const liters = efficiency > 0 ? currentDistance / efficiency : 0;

      this.calcDetails = {
        standardFare: Math.round((standardFare + Number.EPSILON) * 100) / 100,
        fuelFactor: Math.round((fuelFactor + Number.EPSILON) * 1000) / 1000,
        effectiveMultiplier: Math.round((effectiveMultiplier + Number.EPSILON) * 1000) / 1000,
        fuelAdjustment: fuelAdjustment,
        litersConsumed: Math.round((liters + Number.EPSILON) * 1000) / 1000
      };

      // Also persist/send to backend API if needed
      const token = localStorage.getItem('token');
      const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

      this.http.post('http://127.0.0.1:8000/api/fare_estimates', {
        vehicle_id: vehicleId,
        pickup_name: this.pickupLocation,
        pickup_latitude: this.pickupCoords[0],
        pickup_longitude: this.pickupCoords[1],
        destination_name: this.destinationLocation,
        destination_latitude: this.destinationCoords[0],
        destination_longitude: this.destinationCoords[1],
        distance_km: this.distanceKm
      }, { headers }).subscribe({
        next: (res: any) => {
          if (res?.data?.total_fare) {
            this.estimatedFareAmount = Number(res.data.total_fare);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.warn('Backend fare estimate sync fallback used local calculation:', err);
        }
      });

      const fuelType = String(this.selectedVehicle.fuel_type || '').toLowerCase();

      if (efficiency > 0 && !fuelType.includes('electric')) {
        const fuelExpense = liters * this.fuelPricePerLiter;
        this.estimatedFuelExpense = Math.round((fuelExpense + Number.EPSILON) * 100) / 100;
      } else {
        this.estimatedFuelExpense = null;
      }

      this.isCalculatingFare = false;
      this.routeError = null;
      this.cdr.detectChanges();
    }, 600);
  }

  estimateFare(): void {
    this.autoCalculateFare();
  }

  closeModal(): void {
    this.successModal = false;
  }

  openFuelCosts(): void {
    this.router.navigate(['/main-dashboard/fuels']);
  }

  toNumber(value: any): number {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.searchTerms$.complete();

    if (this.browser && this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }

    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
