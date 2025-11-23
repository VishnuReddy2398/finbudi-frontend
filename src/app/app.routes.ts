import { Routes } from '@angular/router';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { DashboardComponent } from './components/dashboard/dashboard';
import { TransactionFormComponent } from './components/transaction-form/transaction-form';
import { ReportsComponent } from './components/reports/reports';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { HomeComponent } from './components/home/home';
import { MfaSetupComponent } from './components/mfa-setup/mfa-setup';
import { SessionListComponent } from './components/session-list/session-list';
import { EmailVerificationComponent } from './components/email-verification/email-verification.component';
import { authGuard } from './guards/auth.guard';

import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'verify-email', component: EmailVerificationComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'add-transaction', component: TransactionFormComponent, canActivate: [authGuard] },
    { path: 'transactions', component: TransactionsComponent, canActivate: [authGuard] },
    { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
    { path: 'mfa-setup', component: MfaSetupComponent, canActivate: [authGuard] },
    { path: 'sessions', component: SessionListComponent, canActivate: [authGuard] },
    { path: 'goals', loadComponent: () => import('./components/goals/goals.component').then(m => m.GoalsComponent), canActivate: [authGuard] },
    { path: 'planning', loadComponent: () => import('./components/planning/planning.component').then(m => m.PlanningComponent), canActivate: [authGuard] },
    { path: '', redirectTo: 'home', pathMatch: 'full' }
];
