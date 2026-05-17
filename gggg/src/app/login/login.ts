import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth-service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SignupComponent } from '../signup-component/signup-component';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterOutlet, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email = '';
  password = '';
  error = '';
  Role = '';

  constructor(public auth: AuthService, public router: Router) { }
login() {
  this.auth.login(this.email, this.password, this.Role).subscribe({
    next: () => {
      this.error = '';
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      this.error = err.error || 'Invalid credentials';
    }
  });
}
}