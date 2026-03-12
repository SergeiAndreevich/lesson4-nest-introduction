import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {AppModule} from "../../app.module";
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
            .post('/users').auth('admin', 'qwerty')
            .send({
                login: "testuser",
                email: "test@example.com",
                password: "123456"
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe('test@example.com');

        // Сохраним для следующего теста
        global.createdUserId = res.body.id;
        //console.log(res.body);
    });

    // ---------------------
    // TEST: READ USER
    // ---------------------
    it('GET /users/:id — should return user', async () => {
        const res = await request(server).get('/users').auth('admin', 'qwerty');

        expect(res.status).toBe(200);
        expect(res.body.items).toHaveLength(1);
    });

    // ---------------------
    // TEST: DELETE USER
    // ---------------------
    it('DELETE /users/:id — should delete user', async () => {
        const res = await request(server).delete(`/users/${global.createdUserId}`).auth('admin', 'qwerty');

        expect(res.status).toBe(204);

        // Проверяем, что его нет
        const check = await request(server).get('/users').auth('admin', 'qwerty');
        expect(check.status).toBe(200);
        expect(check.body.items.length).toBe(0);
    });

});