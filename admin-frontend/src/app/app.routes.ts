import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { CreateAccount } from './auth/create-account/create-account';
import { Dashboard } from './pages/dashboard/dashboard';

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
        path: 'dashboard',
        component: Dashboard
    }

];
