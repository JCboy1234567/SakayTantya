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
    LucideX,
    LucideTruck
  ],
  templateUrl: './plan.html',
  styleUrl: './plan.css'
})
export class Plan implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('routeMap', { static: false })
  routeMapContainer!: ElementRef<HTMLDivElement>;

  // Popular locations in Tagum City.
  // Coordinates are approximate; verify them before research deployment.
  tagumLocations: TagumLocation[] = [
    {
      name: 'Tagum City Hall',
      category: 'Government',
      coords: [7.4478, 125.8083]
    },
    {
      name: 'Tagum City Public Market',
      category: 'Commercial',
      coords: [7.4400, 125.8115]
    },
    {
      name: 'Gaisano Mall of Tagum',
      category: 'Shopping',
      coords: [7.4452, 125.8035]
    },
    {
      name: 'NCCC Mall Tagum',
      category: 'Shopping',
      coords: [7.4431, 125.8090]
    },
    {
      name: 'Robinsons Place Tagum',
      category: 'Shopping',
      coords: [7.4520, 125.7980]
    },
    {
      name: 'Tagum City National High School',
      category: 'Education',
      coords: [7.4501, 125.8120]
    },
    {
      name: 'UM Tagum College',
      category: 'Education',
      coords: [7.4420, 125.8075]
    },
    {
      name: 'Davao Regional Medical Center',
      category: 'Healthcare',
      coords: [7.4610, 125.8150]
    },
    {
      name: 'Christ the King Cathedral',
      category: 'Landmark',
      coords: [7.4445, 125.8050]
    },
    {
      name: 'New Tagum Overland Transport Terminal',
      category: 'Transport',
      coords: [7.4320, 125.8180]
    },
    {
      name: 'Energy Park, Apokon',
      category: 'Recreation',
      coords: [7.4260, 125.8250]
    },
    {
      name: 'Brgy. Apokon Hall',
      category: 'Barangay',
      coords: [7.4300, 125.8200]
    },
    {
      name: 'Brgy. Mankilam Gymnasium',
      category: 'Barangay',
      coords: [7.4650, 125.7950]
    },
    {
      name: 'Brgy. Visayan Village Market',
      category: 'Barangay',
      coords: [7.4490, 125.8010]
    },
    {
      name: 'Magugpo Poblacion',
      category: 'Barangay',
      coords: [7.4410, 125.8095]
    }
  ];

  pickupLocation = 'Tagum City Hall';
  destinationLocation = 'Tagum City Public Market';

  pickupCoords: [number, number] = [7.4478, 125.8083];
  destinationCoords: [number, number] = [7.4400, 125.8115];

  // Demonstration reference price only, not a live fuel price.
  // Connect this to the admin fuel-price API when it is available.
  fuelPricePerLiter = 60;

  get fuelPriceLabel(): string {
    return `₱${this.fuelPricePerLiter.toFixed(2)}/L`;
  }

  isDarkMode = false;

  showLocationModal = false;
  modalTargetType: 'pickup' | 'destination' = 'pickup';
  searchQuery = '';
  selectionMode: 'pickup' | 'destination' = 'pickup';

  mapLoading = true;
  routeLoading = false;
  routeError: string | null = null;
  distanceKm: number | null = null;

  isSearchingPlaces = false;
  placeSearchError: string | null = null;
  remoteLocations: TagumLocation[] = [];
  databaseLocations: TagumLocation[] = [];

  vehicles: any[] = [];
  selectedVehicleId: number | null = null;
  selectedVehicle: any = null;

  fareRulesMap: { [vehicleId: number]: any } = {};

  estimatedFareAmount: number | null = null;
  estimatedFuelExpense: number | null = null;
  successModal = false;

  private map: L.Map | null = null;
  private pickupMarker: L.Marker | null = null;
  private destinationMarker: L.Marker | null = null;
  private routePolyline: L.Polyline | null = null;

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

    // Access browser-only APIs only when running in the browser.
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

  // Search online locations using Photon geocoding.
  
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

  // Photon format: [longitude, latitude]
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

  const combined = [
    ...this.databaseLocations,
    ...this.tagumLocations,
    ...this.remoteLocations
  ];

  const unique = combined.filter(
    (location, index, list) =>
      list.findIndex(item =>
        item.name.trim().toLowerCase() ===
          location.name.trim().toLowerCase() &&
        Math.abs(item.coords[0] - location.coords[0]) < 0.0001 &&
        Math.abs(item.coords[1] - location.coords[1]) < 0.0001
      ) === index
  );

  if (!query) {
    return unique.filter(location =>
      this.tagumLocations.some(item =>
        item.name === location.name &&
        item.coords[0] === location.coords[0] &&
        item.coords[1] === location.coords[1]
      )
    );
  }

  return unique.filter(location => {
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


  // Load locations, vehicles, and fare rules from Laravel.
  fetchDynamicData(): void {
    this.authService.getLocations().subscribe({
          next: (response: any) => {
      const rawLocations = response?.data ?? response;

      if (Array.isArray(rawLocations)) {
        const mapped = rawLocations
          .map((location: any): TagumLocation => ({
            name: String(
              location.name ??
              location.location_name ??
              ''
            ),
            category: String(
              location.category ?? 'Location'
            ),
            coords: [
              Number(location.latitude ?? location.lat),
              Number(
                location.longitude ??
                location.lng ??
                location.lon
              )
            ]
          }))
          .filter(location =>
            !!location.name &&
            Number.isFinite(location.coords[0]) &&
            Number.isFinite(location.coords[1]) &&
            location.coords[0] >= -90 &&
            location.coords[0] <= 90 &&
            location.coords[1] >= -180 &&
            location.coords[1] <= 180
          );

        this.databaseLocations = mapped;
      }

      this.cdr.detectChanges();
    },
      error: error => {
        console.warn(
          'Could not load saved locations; using built-in popular places.',
          error
        );
      }
    });

    this.authService.getVehicles().subscribe({
      next: (response: any) => {
        const rawVehicles = response?.data || response;

        if (Array.isArray(rawVehicles) && rawVehicles.length) {
          this.vehicles = rawVehicles;
          this.selectedVehicleId = Number(this.vehicles[0].id);
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
              String(rule.valid_from || '') >=
                String(currentRule.valid_from || '')
            ) {
              this.fareRulesMap[vehicleId] = rule;
            }
          });

          this.updateSelectedVehicle();
        }

        this.cdr.detectChanges();
      },
      error: error => {
        console.warn(
          'Could not load fare rules. Check the Laravel API configuration.',
          error
        );
      }
    });
  }

  // Demonstration data only. Replace with actual admin/database values.
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
        description:
          'Electric vehicle; fuel expense is not calculated for this vehicle.'
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
      1: {
        base_fare: 13,
        included_distance_km: 4,
        rate_per_km: 2.2,
        minimum_fare: 13
      },
      2: {
        base_fare: 15,
        included_distance_km: 4,
        rate_per_km: 2.5,
        minimum_fare: 15
      },
      3: {
        base_fare: 30,
        included_distance_km: 1,
        rate_per_km: 5,
        minimum_fare: 30
      }
    };

    this.selectedVehicleId = this.vehicles[0].id;
    this.updateSelectedVehicle();
  }

  selectVehicle(vehicle: any): void {
    this.selectedVehicleId = Number(vehicle.id);
    this.updateSelectedVehicle();

    this.estimatedFareAmount = null;
    this.estimatedFuelExpense = null;
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

    const rule =
      this.fareRulesMap[Number(this.selectedVehicleId)] || {};

    this.selectedVehicle = {
      ...vehicle,
      name: vehicle.vehicle_name || vehicle.name || 'Vehicle',
      base_fare: this.toNumber(
        rule.base_fare ?? vehicle.base_fare ?? 0
      ),
      included_distance_km: this.toNumber(
        rule.included_distance_km ??
        vehicle.included_distance_km ??
        0
      ),
      per_km_rate: this.toNumber(
        rule.rate_per_km ??
        rule.per_km_rate ??
        vehicle.per_km_rate ??
        0
      ),
      minimum_fare: this.toNumber(
        rule.minimum_fare ??
        vehicle.minimum_fare ??
        rule.base_fare ??
        vehicle.base_fare ??
        0
      ),
      description:
        vehicle.description ||
        'Public utility transport operating across Tagum City routes.'
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
        this.getCurrentLocation();
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
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
        }
      ).addTo(this.map);

      L.control.zoom({ position: 'topright' }).addTo(this.map);

      this.updateMarkersAndRoute();

      this.map.on('click', (event: L.LeafletMouseEvent) => {
        this.ngZone.run(() => {
          const coords: [number, number] = [
            event.latlng.lat,
            event.latlng.lng
          ];

          if (this.selectionMode === 'pickup') {
            this.pickupCoords = coords;
            this.pickupLocation =
              `Map pin (${coords[0].toFixed(5)}, ${coords[1].toFixed(5)})`;
            this.selectionMode = 'destination';
          } else {
            this.destinationCoords = coords;
            this.destinationLocation =
              `Map pin (${coords[0].toFixed(5)}, ${coords[1].toFixed(5)})`;
            this.selectionMode = 'pickup';
          }

          this.estimatedFareAmount = null;
          this.estimatedFuelExpense = null;

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
        this.routeError =
          'Hindi ma-load ang mapa. I-refresh ang page at subukan muli.';
        this.cdr.detectChanges();
      });
    }
  }
  
getCurrentLocation(): void {
  if (!isPlatformBrowser(this.platformId)) {
    return;
  }

  if (!navigator.geolocation) {
    this.routeError = 'Hindi suportado ng browser ang GPS location.';
    return;
  }

  this.mapLoading = true;
  this.routeError = null;

  navigator.geolocation.getCurrentPosition(
    position => {
      this.ngZone.run(() => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Update pickup coordinates to your actual current location.
        this.pickupCoords = [latitude, longitude];
        this.pickupLocation = 'My Current Location';

        // Move the map to your current location.
        if (this.map) {
          this.map.setView(this.pickupCoords, 15);
          this.map.invalidateSize();
        }

        // IMPORTANT: Refresh the pickup and destination markers.
        this.updateMarkersAndRoute();

        // Recalculate the road distance from your location
        // to the selected destination.
        this.fetchRouteDistance();

        this.mapLoading = false;
        this.cdr.detectChanges();
      });
    },
    error => {
      this.ngZone.run(() => {
        this.mapLoading = false;

        if (error.code === error.PERMISSION_DENIED) {
          this.routeError =
            'Payagan ang location access sa browser para makuha ang pickup location mo.';
        } else if (error.code === error.TIMEOUT) {
          this.routeError =
            'Nag-timeout ang pagkuha ng location. Subukan ulit.';
        } else {
          this.routeError =
            'Hindi makuha ang kasalukuyang location mo. Subukan ulit.';
        }

        this.cdr.detectChanges();
      });
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
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
        <div style="
          background:#155b32;
          width:16px;
          height:16px;
          border-radius:50%;
          border:3px solid white;
          box-shadow:0 3px 6px rgba(0,0,0,.4)
        "></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const destinationIcon = L.divIcon({
      className: 'custom-pin-icon',
      html: `
        <div style="
          background:#dc2626;
          width:16px;
          height:16px;
          border-radius:50%;
          border:3px solid white;
          box-shadow:0 3px 6px rgba(0,0,0,.4)
        "></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    this.pickupMarker = L.marker(this.pickupCoords, {
      icon: pickupIcon
    }).addTo(this.map);

    this.destinationMarker = L.marker(this.destinationCoords, {
      icon: destinationIcon
    }).addTo(this.map);

    this.map.fitBounds(
      L.latLngBounds([this.pickupCoords, this.destinationCoords]),
      {
        padding: [35, 35],
        maxZoom: 16
      }
    );
  }

  // OSRM road route. No straight-line fallback is presented as road distance.
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

    this.cdr.detectChanges();

    const [pickupLat, pickupLng] = this.pickupCoords;
    const [destinationLat, destinationLng] = this.destinationCoords;

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${pickupLng},${pickupLat};${destinationLng},${destinationLat}` +
      `?overview=full&geometries=geojson`;

    this.http.get<any>(url).subscribe({
      next: response => {
        if (requestId !== this.routeRequestId) {
          return;
        }

        this.routeLoading = false;

        if (
          response?.code !== 'Ok' ||
          !response.routes?.length
        ) {
          this.distanceKm = null;
          this.routeError =
            'Walang road route na nakita para sa napiling locations. Subukan ang ibang pins.';
          this.removeRouteLine();
          this.cdr.detectChanges();
          return;
        }

        const route = response.routes[0];
        this.distanceKm = Number(route.distance) / 1000;

        if (route.geometry?.coordinates && this.map) {
          this.removeRouteLine();

          const routeCoords: [number, number][] =
            route.geometry.coordinates.map(
              (coord: [number, number]) => [coord[1], coord[0]]
            );

          this.routePolyline = L.polyline(routeCoords, {
            color: '#15803d',
            weight: 5,
            opacity: 0.9
          }).addTo(this.map);

          this.map.fitBounds(this.routePolyline.getBounds(), {
            padding: [35, 35],
            maxZoom: 16
          });
        }

        this.cdr.detectChanges();
      },
      error: error => {
        if (requestId !== this.routeRequestId) {
          return;
        }

        console.warn('OSRM route request failed:', error);

        this.routeLoading = false;
        this.distanceKm = null;
        this.routeError =
          'Hindi makuha ang road distance ngayon. Tingnan ang internet connection at subukan muli.';

        this.removeRouteLine();
        this.cdr.detectChanges();
      }
    });
  }

  private removeRouteLine(): void {
    if (this.map && this.routePolyline) {
      this.map.removeLayer(this.routePolyline);
    }

    this.routePolyline = null;
  }

  openLocationModal(target: 'pickup' | 'destination'): void {
    this.modalTargetType = target;
    this.searchQuery = '';
    this.remoteLocations = [];
    this.placeSearchError = null;
    this.showLocationModal = true;

    this.searchTerms$.next('');
    this.cdr.detectChanges();
  }

  closeLocationModal(): void {
    this.showLocationModal = false;
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

    this.updateMarkersAndRoute();
    this.fetchRouteDistance();
    this.cdr.detectChanges();
  }

  selectLocation(type: 'pickup' | 'destination'): void {
    this.openLocationModal(type);
  }

  clearRoute(): void {
    this.pickupCoords = [7.4478, 125.8083];
    this.destinationCoords = [7.4400, 125.8115];

    this.pickupLocation = 'Tagum City Hall';
    this.destinationLocation = 'Tagum City Public Market';

    this.selectionMode = 'pickup';
    this.estimatedFareAmount = null;
    this.estimatedFuelExpense = null;

    this.updateMarkersAndRoute();
    this.fetchRouteDistance();
  }

  
estimateFare(): void {
  if (!this.selectedVehicle) {
    this.routeError = 'Pumili muna ng transport vehicle.';
    return;
  }

  if (
    this.routeLoading ||
    this.distanceKm === null ||
    !Number.isFinite(this.distanceKm) ||
    this.distanceKm <= 0
  ) {
    this.routeError =
      'Hintayin munang makuha ang valid road distance bago mag-estimate ng fare.';
    return;
  }

  const vehicleId = Number(this.selectedVehicle.id);
  const rule = this.fareRulesMap[vehicleId];

  // Siguraduhing may fare rule para sa vehicle.
  if (!rule) {
    this.routeError =
      'Walang fare rule para sa napiling vehicle. Tingnan ang admin fare rules.';
    return;
  }

  // Kunin ang values mula sa fare rule na galing sa Laravel API.
  const baseFare = this.toNumber(rule.base_fare);
  const includedDistance = this.toNumber(
    rule.included_distance_km
  );
  const ratePerKm = this.toNumber(rule.rate_per_km);
  const minimumFare = this.toNumber(rule.minimum_fare);

  const extraDistance = Math.max(
    0,
    this.distanceKm - includedDistance
  );

  const fare = Math.max(
    minimumFare,
    baseFare + extraDistance * ratePerKm
  );

  this.estimatedFareAmount =
    Math.round((fare + Number.EPSILON) * 100) / 100;

  // Separate calculation para sa fuel expense.
  const efficiency = this.toNumber(
    this.selectedVehicle.fuel_efficiency_km_per_liter
  );

  const fuelType = String(
    this.selectedVehicle.fuel_type || ''
  ).toLowerCase();

  if (efficiency > 0 && !fuelType.includes('electric')) {
    const fuelExpense =
      (this.distanceKm / efficiency) * this.fuelPricePerLiter;

    this.estimatedFuelExpense =
      Math.round((fuelExpense + Number.EPSILON) * 100) / 100;
  } else {
    this.estimatedFuelExpense = null;
  }

  console.log('Fare calculation details:', {
    vehicleId,
    vehicleName: this.selectedVehicle.name,
    distanceKm: this.distanceKm,
    baseFare,
    includedDistance,
    ratePerKm,
    minimumFare,
    extraDistance,
    estimatedFare: this.estimatedFareAmount,
    source: 'fareRulesMap / Laravel API'
  });

  this.routeError = null;
  this.successModal = true;
  this.cdr.detectChanges();
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