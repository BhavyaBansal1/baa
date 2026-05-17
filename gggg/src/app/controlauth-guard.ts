import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth-service';
@Injectable({
  providedIn: 'root'
})
export class controlauthGuard implements CanActivate {
  constructor(public auth: AuthService, public router: Router) { }

  canActivate(): boolean {
    const check = this.auth.getrole();
    if (check === 'Trader') {
      return true;
    }
    this.router.navigate(['/dashboard']);
    return false;
  }

}
