// import {INestApplication} from "@nestjs/common";
// import {Test, TestingModule} from "@nestjs/testing";
// import {AppModule} from "../app.module";
// import {getConnectionToken} from "@nestjs/mongoose";
// import request from "supertest";
// import { Connection } from "mongoose";
//
// describe('UsersController (e2e)', () => {
//   let app: INestApplication;
//   let connection: Connection;
//   let createdUserId: string;
//
//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//     app = moduleFixture.createNestApplication();
//     await app.init();
//
//     // Получаем подключение к базе данных
//     connection = moduleFixture.get<Connection>(getConnectionToken());
//     // Очистка всех коллекций в тестовой базе данных
//     const collections = await connection.db!.listCollections().toArray();
//     for (const collection of collections) {
//       await connection.db!.collection(collection.name).deleteMany({});
//     }
//
//     // Очистка всех коллекций в тестовой базе данных
//     //await request(app.getHttpServer()).delete('/testing/all-data');
//
//     // Create a user for testing
//     const userResponse = await request(app.getHttpServer())
//         .post('/users')
//         .send({ name: 'TestUser', password: '1234567', email: 'test@example.com'});
//     createdUserId = userResponse.body._id;
//   });
//   afterAll(async () => {
//     await app.close();
//   });
//
//   it('POST /users - should create a new user', async () => {
//     const response = await request(app.getHttpServer())
//         .post('/users')
//         .send({
//           login: "Mike",
//           password: "1234567",
//           email: "mike@mail.ru"
//         });
//     expect(response.statusCode).toBe(201);
//   })
//   it('POST /users - should not create a new user', async () => {
//     const response = await request(app.getHttpServer())
//         .post('/users')
//         .send({
//           login: "Mike",
//           password: "1234567",
//           email: "mike@mail.ru"
//         });
//     expect(response.statusCode).toBe(201);
//   })
// })

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {AppModule} from "../app.module";
import request from "supertest";

describe('Users E2E', () => {
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

    // ---------------------
    // TEST: CREATE USER
    // ---------------------
    it('POST /users — should create user', async () => {
        const res = await request(server)
            .post('/users')
            .send({
                login: "testuser",
                email: "test@example.com",
                password: "123456"
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.email).toBe('test@example.com');

        // Сохраним для следующего теста
        global.createdUserId = res.body._id;
    });

    // ---------------------
    // TEST: READ USER
    // ---------------------
    it('GET /users/:id — should return user', async () => {
        const res = await request(server).get(`/users/${global.createdUserId}`);

        expect(res.status).toBe(200);
        expect(res.body._id).toBe(global.createdUserId);
    });

    // ---------------------
    // TEST: DELETE USER
    // ---------------------
    it('DELETE /users/:id — should delete user', async () => {
        const res = await request(server).delete(`/users/${global.createdUserId}`);

        expect(res.status).toBe(200);

        // Проверяем, что его нет
        const check = await request(server).get(`/users/${global.createdUserId}`);
        expect(check.status).toBe(404);
    });

});