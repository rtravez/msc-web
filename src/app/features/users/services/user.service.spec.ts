import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { User, UserRequest } from '../models/user.interface';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch user by identification using the query parameter endpoint', () => {
    let result: User | undefined;
    service.getUserByIdentification('1712345678').subscribe((user) => result = user);

    const req = httpMock.expectOne('/mscServices/api/users/identification?identification=1712345678');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('identification')).toBe('1712345678');
    req.flush({
      code: 200,
      message: 'Usuario encontrado',
      data: {
        userId: 7,
        username: 'jdoe',
        identification: '1712345678',
        name: 'John',
        lastname: 'Doe',
        address: 'Main St',
        telephone: '0999999999',
        status: true,
      },
    });

    expect(result).toMatchObject({ userId: 7, username: 'jdoe' });
  });

  it('should send update request to the user id URL', () => {
    const request: UserRequest = {
      userId: 7,
      username: 'jdoe',
      identification: '1712345678',
      name: 'John',
      lastname: 'Doe',
      address: 'Main St',
      telephone: '0999999999',
      status: true,
    };

    let result: User | undefined;
    service.updateUser(7, request).subscribe((user) => result = user);

    const req = httpMock.expectOne('/mscServices/api/users/7');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush({
      code: 200,
      message: 'Usuario actualizado con éxito',
      data: {
        userId: 7,
        username: 'jdoe',
        identification: '1712345678',
        name: 'John',
        lastname: 'Doe',
        address: 'Main St',
        telephone: '0999999999',
        status: true,
      },
    });

    expect(result).toMatchObject({ userId: 7, username: 'jdoe' });
    expect(result).not.toHaveProperty('data');
  });
});
