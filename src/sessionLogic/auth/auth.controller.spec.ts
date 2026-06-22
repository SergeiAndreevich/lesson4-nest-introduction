import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {AppModule} from "../../app.module";
import request from "supertest";
import cookieParser from 'cookie-parser';

describe('Auth E2E', () => {
  let app: INestApplication;
  let connection: Connection;
  let server: any;

  beforeAll(async () => {
    // Создаём тестовый модуль, импортируя AppModule
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
        // Если какие-то глобальные гуарды мешают, можно их отключить/переопределить
        // .overrideGuard(BasicGuard).useValue({ canActivate: () => true })
        .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    // Получаем HTTP-сервер для supertest
    server = app.getHttpServer();

    // Получаем соединение с MongoDB через токен
    connection = moduleFixture.get<Connection>(getConnectionToken());

    // Очищаем коллекции перед тестами (можно через эндпоинт или напрямую)
    await clearDatabase();
  });

  // Функция очистки всех коллекций (напрямую через connection)
  const clearDatabase = async () => {
    const collections = await connection.db!.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  };

  // Закрываем приложение после всех тестов
  afterAll(async () => {
    await app.close();
  });

  // // ---------------------
  // // TEST: CREATE USER
  // // ---------------------
  // it('POST /regitration — should register user', async () => {
  //   const res = await request(server)
  //       .post('/auth/registration')
  //       .send({
  //         login: "testUser",
  //         email: "test@example.com",
  //         password: "1234567"
  //       });
  //
  //   expect(res.status).toBe(204);
  //   expect(res.body).toHaveProperty('id');
  //   expect(res.body.email).toBe('test@example.com');
  //
  //   // Сохраним для следующего теста
  //   global.createdUserId = res.body.id;
  //   global.emailCode = res.body.emailConfirmation.code;
  //   console.log(res.body);
  // });
  // //
  // // it('POST /emailConfirmation', async ()=>{
  // //   const res = await request(server)
  // //       .post('/auth/registration-confirmation')
  // //       .send({
  // //         code: global.emailCode
  // //       });
  // //   expect(res.status).toBe(204);
  // //   expect(res.body.emailConfirmation.isConfirmed).toBe(true);
  // // })
  //
  // it('DEBUG DEVICE FLOW', async () => {
  //
  //   //---------------------------------------------------
  //   // create user
  //   //---------------------------------------------------
  //
  //   await request(server)
  //       .post('/users')
  //       .auth('admin', 'qwerty')
  //       .send({
  //         login: 'testUser',
  //         password: '123456',
  //         email: 'test@test.com',
  //       })
  //       .expect(201);
  //
  //   //---------------------------------------------------
  //   // login
  //   //---------------------------------------------------
  //
  //   const loginRes = await request(server)
  //       .post('/auth/login')
  //       .send({
  //         loginOrEmail: 'testUser',
  //         password: '123456',
  //       });
  //
  //   console.log('LOGIN STATUS', loginRes.status);
  //
  //   const cookie = loginRes.headers['set-cookie'];
  //
  //   console.log('COOKIE AFTER LOGIN');
  //   console.log(cookie);
  //
  //   //---------------------------------------------------
  //   // devices
  //   //---------------------------------------------------
  //
  //   const devicesRes = await request(server)
  //       .get('/security/devices')
  //       .set('Cookie', cookie);
  //
  //   console.log('DEVICES STATUS', devicesRes.status);
  //
  //   console.log('DEVICES BODY');
  //   console.dir(devicesRes.body, { depth: 10 });
  //
  //   //---------------------------------------------------
  //   // refresh
  //   //---------------------------------------------------
  //
  //   const refreshRes = await request(server)
  //       .post('/auth/refresh-token')
  //       .set('Cookie', cookie);
  //
  //   console.log('REFRESH STATUS', refreshRes.status);
  //
  //   console.log('REFRESH BODY');
  //   console.log(refreshRes.body);
  //
  //   console.log('NEW COOKIE');
  //   console.log(refreshRes.headers['set-cookie']);
  //
  //   //---------------------------------------------------
  //   // logout with NEW token
  //   //---------------------------------------------------
  //
  //   const logoutRes = await request(server)
  //       .post('/auth/logout')
  //       .set(
  //           'Cookie',
  //           refreshRes.headers['set-cookie'],
  //       );
  //
  //   console.log('LOGOUT STATUS');
  //   console.log(logoutRes.status);
  //
  //   console.log('LOGOUT BODY');
  //   console.log(logoutRes.body);
  //
  //   expect(logoutRes.status).toBe(204);
  // });
  //
  // it('check refresh iat', async () => {
  //   const loginRes = await request(server)
  //       .post('/auth/login')
  //       .send({
  //         loginOrEmail: 'testUser',
  //         password: '123456',
  //       });
  //
  //   const cookie = loginRes.headers['set-cookie'];
  //
  //   const refreshRes = await request(server)
  //       .post('/auth/refresh-token')
  //       .set('Cookie', cookie);
  //
  //   console.log(refreshRes.headers['set-cookie']);
  // });
  //
  // it('MULTI DEVICE DEBUG', async () => {
  //
  //   await createUser();
  //
  //   const chrome = await login('Chrome');
  //   const firefox = await login('Firefox');
  //   const safari = await login('Safari');
  //   const edge = await login('Edge');
  //
  //   const devicesBefore = await request(server)
  //       .get('/security/devices')
  //       .set('Cookie', chrome.cookie);
  //
  //   console.log('BEFORE');
  //   console.dir(devicesBefore.body, { depth: 10 });
  //
  //   const logout = await request(server)
  //       .post('/auth/logout')
  //       .set('Cookie', firefox.cookie);
  //
  //   console.log('LOGOUT STATUS');
  //   console.log(logout.status);
  //
  //   const devicesAfter = await request(server)
  //       .get('/security/devices')
  //       .set('Cookie', chrome.cookie);
  //
  //   console.log('AFTER');
  //   console.dir(devicesAfter.body, { depth: 10 });
  //
  // });
  //
  // async function login(userAgent: string) {
  //   const res = await request(server)
  //       .post('/auth/login')
  //       .set('User-Agent', userAgent)
  //       .send({
  //         loginOrEmail: 'testUser',
  //         password: '123456',
  //       });
  //
  //   return {
  //     cookie: res.headers['set-cookie'],
  //   };
  // }
  it('MULTI DEVICE REAL SCENARIO', async () => {

    await request(server)
        .delete('/testing/all-data');

    await request(server)
        .post('/users')
        .auth('admin', 'qwerty')
        .send({
          login: 'testUser',
          password: '123456',
          email: 'test@test.com',
        });

    const login = async (ua: string) => {
      const res = await request(server)
          .post('/auth/login')
          .set('User-Agent', ua)
          .send({
            loginOrEmail: 'testUser',
            password: '123456',
          });

      return {
        cookie: res.headers['set-cookie'],
      };
    };

    const chrome = await login('chrome');
    const firefox = await login('firefox');
    const safari = await login('safari');
    const edge = await login('edge');

    const before = await request(server)
        .get('/security/devices')
        .set('Cookie', chrome.cookie);

    console.log('BEFORE', before.body);

    const logout = await request(server)
        .post('/auth/logout')
        .set('Cookie', firefox.cookie);

    console.log('LOGOUT', logout.status);

    const after = await request(server)
        .get('/security/devices')
        .set('Cookie', chrome.cookie);

    console.log('AFTER', after.body);
  });
});