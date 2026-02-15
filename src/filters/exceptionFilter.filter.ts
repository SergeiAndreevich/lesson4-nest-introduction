import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

export interface IErrorMessage {
    field: string;
    message: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorMessages: IErrorMessage[] = [];

        if (exception instanceof HttpException) {
            // Это HTTP-исключение (все, что мы бросаем через throw new ...Exception)
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            // Пытаемся привести к массиву ErrorMessage
            errorMessages = this.extractErrorMessages(exceptionResponse);
        } else {
            // Неизвестная ошибка (ошибка БД, провал в провайдере, и т.д.)
            console.error('Unhandled exception:', exception);
            errorMessages = [{ field: 'server', message: 'Internal server error' }];
        }

        // Отправляем ответ в едином формате
        response.status(status).json({ errorsMessages: errorMessages });
    }

    /**
     * Преобразует response от исключения в массив ErrorMessage.
     * Поддерживает:
     * - Массив объектов { field, message }
     * - Одиночный объект { field, message }
     * - Объект { errorsMessages: [...] } (от ValidationPipe)
     * - Стандартный ответ Nest (строка или объект с message)
     */
    private extractErrorMessages(exceptionResponse: any): IErrorMessage[] {
        // 1. Если это уже массив наших объектов — отлично
        if (Array.isArray(exceptionResponse)) {
            // Проверим, что элементы имеют нужную структуру (field, message)
            if (exceptionResponse.every(item => this.isErrorMessage(item))) {
                return exceptionResponse; // уже готовый массив
            }
        }

        // 2. Если это одиночный объект с field и message
        if (this.isErrorMessage(exceptionResponse)) {
            return [exceptionResponse];
        }

        // 3. Если это объект с errorsMessages (от ValidationPipe)
        if (exceptionResponse && typeof exceptionResponse === 'object' && 'errorsMessages' in exceptionResponse) {
            const errors = exceptionResponse.errorsMessages;
            if (Array.isArray(errors) && errors.every(item => this.isErrorMessage(item))) {
                return errors; // берём как есть
            }
        }

        // 4. Иначе — стандартное исключение Nest (строка или объект с message)
        const message = this.extractMessage(exceptionResponse);
        // Для таких случаев используем поле 'server'
        return [{ field: 'server', message }];
    }

    // Проверка, что объект соответствует ErrorMessage
    private isErrorMessage(obj: any): obj is IErrorMessage {
        return obj && typeof obj === 'object' && 'field' in obj && 'message' in obj;
    }

    // Извлечение строки сообщения из стандартного ответа исключения
    private extractMessage(exceptionResponse: string | object): string {
        if (typeof exceptionResponse === 'string') {
            return exceptionResponse;
        }
        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            if ('message' in exceptionResponse) {
                const msg = (exceptionResponse as any).message;
                return Array.isArray(msg) ? msg.join(', ') : String(msg);
            }
        }
        return 'An error occurred';
    }
}