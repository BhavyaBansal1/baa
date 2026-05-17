import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';
import { AuthService } from '../auth-service';
import { RouterTestingModule } from '@angular/router/testing';

class MockAuthService {
  get_user() {
    return { name: 'Test User' };
  }

  isLoggedIn() {
    return true;
  }

  getrole() {
    return {role: 'user'};
  }
}

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar, RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user on init', () => {
    expect(component.auth.get_user).toBeTruthy();
    // expect(component.auth.getrole).toEqual('user');
  });

  it('should return user from get_user()', () => {
    const user = component.get_user();
    expect(user.name).toBe('Test User');
  });

  it('should show user in template', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Test User');
  });
});
