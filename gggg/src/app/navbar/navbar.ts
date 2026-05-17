import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth-service';
import { CommonModule } from '@angular/common';
import { dashboard } from '../dashboard/dashboard';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [dashboard, RouterLink,RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  user: any;

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.user = this.auth.get_user(); 
  }

  get_user() {
    return this.user;
  }
}