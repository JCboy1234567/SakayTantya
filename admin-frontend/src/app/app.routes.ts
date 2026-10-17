import { Routes } from '@angular/router';
import { Login } from './pages/auth/login/login';
import { CreateAccount } from './pages/auth/create-account/create-account';

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
    }

];
