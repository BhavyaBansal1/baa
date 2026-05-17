import { TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup-component';
import { AuthService } from '../auth-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('SignupComponent - Pure TestBed ', () => {
  let component: SignupComponent;

  let callCount = 0;
  let lastArgs: any[] = [];

  const authServiceMock = {
    signup: (email: string, password: string, role: string) => {
      callCount++;
      lastArgs = [email, password, role];

      return email !== 'exists@test.com';
    }
  };

  const routerMock = {
    navigatedTo: '',
    navigate: (commands: any[]) => {
      routerMock.navigatedTo = commands.join('/');
    }
  };

  beforeEach(async () => {
    callCount = 0;
    lastArgs = [];
    routerMock.navigatedTo = '';

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, SignupComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should signup successfully and navigate to login', () => {
    component.email = 'new@test.com';
    component.password = '123456';
    component.Role = 'user';
    component.signup();
    expect(component.success).toBe('Signup successful! Please login.');
    expect(component.error).toBe('');

    expect(routerMock.navigatedTo).toBe('/');
  });

  it('should fail signup when user already exists', () => {
    component.email = 'exists@test.com';
    component.password = '123456';
    component.Role = 'admin';
    component.signup();
expect(component.error).toBe('User already exists');

expect(component.success).toBe('');

expect(routerMock.navigatedTo).toBe('');
  });

  //   it('should pass correct values to AuthService', () => {
  //     component.email = 'a@b.com';
  //     component.password = 'pass123';
  //     component.Role = 'user';

  //     component.signup();

  //     if (callCount !== 1) {
  //       throw new Error(`Expected 1 call, got ${callCount}`);
  //     }
  //     if (
  //       lastArgs[0] !== 'a@b.com' ||
  //       lastArgs[1] !== 'pass123' ||
  //       lastArgs[2] !== 'user'
  //     ) {
  //       throw new Error('Arguments mismatch in signup call');
  //     }
  //   });
});