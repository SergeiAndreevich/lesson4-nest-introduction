import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import {UsersRepository} from "./users.repository";
import {UsersQueryRepository} from "./usersQuery.repository";
import {EmailSenderHelper} from "../helpers/emailSender.helper";
import {CreateUserDto} from "./dto/create-user.dto";
import {User} from "./schemas/user.schema";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
import {BadRequestException} from "@nestjs/common";

// Моки
const mockUsersRepository = {
  createUser: jest.fn(),
};

const mockUsersQueryRepository = {
  findUserByLogin: jest.fn(),
  findUserByEmail: jest.fn(),
};

const mockJwtService = {
  // если используются методы, добавь их
};

const mockEmailSenderHelper = {
  sendEmailConfirmation: jest.fn(),
};
// Мок для статического метода User.createNewUser
jest.mock('./schemas/user.schema', () => ({
  User: {
    createNewUser: jest.fn(),
  },
}));


describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: UsersRepository;
  let usersQueryRepo: UsersQueryRepository;
  let emailSenderHelper: EmailSenderHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService,
          {provide: UsersRepository, useValue: mockUsersRepository},
          {provide: UsersQueryRepository, useValue: mockUsersQueryRepository},
          {provide: EmailSenderHelper, useValue: mockEmailSenderHelper},

      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepo = module.get<UsersRepository>(UsersRepository);
    usersQueryRepo = module.get<UsersQueryRepository>(UsersQueryRepository);
    emailSenderHelper = module.get<EmailSenderHelper>(EmailSenderHelper);

    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreateUser', () => {
    const  createUserDto: CreateUserDto = {
      login: 'john',
      email: 'john@mail.ru',
      password: '123456'
    }
    const mockCreatedUser = {
      accountData: {
        login: 'john',
        email: 'john@mail.ru',
        password: '123456' // лучше хэшировать в сервисе
      },
      passwordRecovery: {
        code: null,
        isConfirmed: false,
        expiresAt: new Date(),
      },
      emailConfirmation: {
        code: '1234-5678-91011',
        isConfirmed: false,
        expiresAt: add(new Date(),{hours: 1}),
      }
    }
    const mockUserToView = {
      id: '1',
      login:'john',
      email: 'john@mail.ru',
      createdAt: new Date(),
    }


    it('should create a user successfully', async () => {
      // 1. Настраиваем моки: говорим им, что они должны вернуть
      mockUsersQueryRepository.findUserByLogin.mockResolvedValue(null); // пользователь с таким логином не найден
      mockUsersQueryRepository.findUserByEmail.mockResolvedValue(null); // пользователь с таким email не найден
      (User.createNewUser as jest.Mock).mockReturnValue({ ...mockCreatedUser }); // статический метод вернёт данные
      mockUsersRepository.createUser.mockResolvedValue(mockCreatedUser); // репозиторий создаст пользователя

      // 2. Вызываем реальный метод сервиса
      const result = await service.createUser(createUserDto);

      // 3. Проверяем, что все нужные методы моков были вызваны с правильными параметрами
      expect(mockUsersQueryRepository.findUserByLogin).toHaveBeenCalledWith(createUserDto.login);
      expect(mockUsersQueryRepository.findUserByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(User.createNewUser).toHaveBeenCalledWith(createUserDto);
      expect(mockUsersRepository.createUser).toHaveBeenCalledWith(mockCreatedUser);
      expect(mockEmailSenderHelper.sendEmailConfirmation).toHaveBeenCalledWith(
          mockCreatedUser.accountData.email,
          mockCreatedUser.emailConfirmation.code,
      );

      // 4. Проверяем, что результат совпадает с ожидаемым
      expect(result).toEqual(mockUserToView);
    });

    it('should throw BadRequestException if login already exists', async () => {
      // Настраиваем мок так, будто пользователь с таким логином уже есть
      mockUsersQueryRepository.findUserByLogin.mockResolvedValue({ id: 'existing' });

      // Вызываем метод и ожидаем, что он выбросит исключение
      await expect(service.createUser(createUserDto)).rejects.toThrow(BadRequestException);

      // Проверяем, что сервис даже не пошёл проверять email и не пытался создать пользователя
      expect(mockUsersQueryRepository.findUserByEmail).not.toHaveBeenCalled();
      expect(mockUsersRepository.createUser).not.toHaveBeenCalled();
      expect(mockEmailSenderHelper.sendEmailConfirmation).not.toHaveBeenCalled();
    });
  })
});
