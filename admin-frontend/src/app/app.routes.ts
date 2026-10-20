import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { CreateAccount } from './auth/create-account/create-account';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import { roleGuardGuard } from './core/guards/role.guard-guard';

import { Overview } from './pages/overview/overview';
import { RoutesEstimates } from './pages/routes-estimates/routes-estimates';
import { FareConfigurations } from './pages/fare-configurations/fare-configurations';
import { FuelpriceReference } from './pages/fuelprice-reference/fuelprice-reference';
import { VehiclesEfficiency } from './pages/vehicles-efficiency/vehicles-efficiency';
import { TestingFeedback } from './pages/testing-feedback/testing-feedback';
import { Settings } from './pages/settings/settings';
import { UnderWork } from './pages/under-work/under-work';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'create-account',
        component: CreateAccount
    },
    {
        path: '',
        component: DashboardLayout,
        canActivate: [roleGuardGuard],
        data: { role: 'admin' }, // Admin role lamang ang pinapayagan dito
        children: [
            {
                path: 'dashboard',
                component: Overview
            },
            {
                path: 'overview',
                component: Overview
            },
            {
                path: 'routes-estimates',
                component: RoutesEstimates
            },
            {
                path: 'fare-configurations',
                component: FareConfigurations
            },
            {
                path: 'fuelprice-reference',
                component: FuelpriceReference
            },
            {
                path: 'vehicles-efficiency',
                component: VehiclesEfficiency
            },
            {
                path: 'testing-feedback',
                component: TestingFeedback
            },
            {
                path: 'settings',
                component: Settings
            },
            {
                path: 'under-work',
                component: UnderWork
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
