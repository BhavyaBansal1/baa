import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth-service';
import { Router } from '@angular/router';
class MockRouter {
  navigatedTo: any = null;

  navigate(path: string[]) {
    this.navigatedTo = path;
  }
}
describe('AuthService', () => {
  let service: AuthService;
  let router: MockRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useClass: MockRouter }
      ]
    });
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router) as unknown as MockRouter;
    localStorage.clear();
    service.users = [];
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should signup a new user', () => {
    const result = service.signup('test@mail.com', '123', 'user');
    expect(result).toBeTrue();
    expect(service.users.length).toBe(1);
  });

  it('should not allow duplicate signup', () => {
    service.signup('test@mail.com', '123', 'user');
    const result = service.signup('test@mail.com', '123', 'user');

    expect(result).toBeFalse();
  });
  it('should login with correct credentials', () => {
    service.signup('test@mail.com', '123', 'user');

    const result = service.login('test@mail.com', '123', 'user');

    expect(result).toBeTrue();
    expect(localStorage.getItem('token')).toBeTruthy();
  });
  it('should fail login with wrong credentials', () => {
    const result = service.login('wrong@mail.com', '123', 'user');

    expect(result).toBeFalse();
  });
  it('should return true if token exists', () => {
    service.signup('test@mail.com', '123', 'user');
    service.login('test@mail.com', '123', 'user');

    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should logout and clear token', () => {
    service.signup('test@mail.com', '123', 'user');
    service.login('test@mail.com', '123', 'user');

    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigatedTo).toEqual(['/']);
  });

});
