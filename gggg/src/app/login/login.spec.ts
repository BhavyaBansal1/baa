import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { AuthService } from '../auth-service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

class MockAuthService {
  shouldReturn = false;
  login(email: string, password: string, role: string) {
    return this.shouldReturn;
  }
  navigate(){
    this.shouldReturn =true;
  }
}

describe('LoginComponent (stable)', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: MockAuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login, FormsModule,RouterTestingModule    ],
      providers: [
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });
  it('should navigate to dashboard on successful login', () => {
    authService.shouldReturn = true;

    component.email = 'test@mail.com';
    component.password = '123456';
    component.Role = 'user';

    component.login();

    expect(router.url).toBeTruthy
  });

  it('should show error on failed login', () => {
    authService.shouldReturn = false;

    component.login();

    expect(component.error).toBe('Invalid credentials');
  });
});
