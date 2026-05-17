import { Component } from '@angular/core';
import { AuthService } from '../auth-service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup-component',
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink],
  templateUrl: './signup-component.html',
  styleUrl: './signup-component.css',
})
export class SignupComponent {

  email = '';
  password = '';
  error = '';
  Role = '';
  success = '';

  constructor(private auth: AuthService, private router: Router) { }

  signup() {
    this.auth.signup(this.email, this.password, this.Role).subscribe({
      next: () => {
        this.success = 'Signup successful! Please login.';
        this.error = '';
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error || 'Signup failed';
        this.success = '';
      }
    });
  }
}