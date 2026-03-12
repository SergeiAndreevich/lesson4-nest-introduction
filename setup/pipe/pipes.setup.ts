import {ValidationError} from "class-validator";
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {DomainException, DomainExceptionCode, Extension} from "../types/domain-exception";

export const errorFormatter = (
    errors: ValidationError[],
    errorMessage?: any,
): Extension[] => {
    const errorsForResponse = errorMessage || [];

    for (const error of errors) {
        if (!error.constraints && error.children?.length) {
            errorFormatter(error.children, errorsForResponse);
        } else if (error.constraints) {
            const constrainKeys = Object.keys(error.constraints);

            for (const key of constrainKeys) {
                errorsForResponse.push({
                    message: error.constraints[key]
                        ? `${error.constraints[key]}; Received value: ${error?.value}`
                        : '',
                    key: error.property,
                });
            }
        }
    }

    return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
    //Глобальный пайп для валидации и трансформации входящих данных.
    app.useGlobalPipes(
        //new ObjectIdValidationTransformationPipe(),
        new ValidationPipe({
            //class-transformer создает экземпляр dto
            //соответственно применятся значения по-умолчанию
            //и методы классов dto
            transform: true,

            whitelist: true,
            //Выдавать первую ошибку для каждого поля
            stopAtFirstError: true,
            //Для преобразования ошибок класс валидатора в необходимый вид
            exceptionFactory: (errors) => {
                const formattedErrors = errorFormatter(errors);

                throw new DomainException({
                    code: DomainExceptionCode.ValidationError,
                    message: 'Validation failed',
                    extensions: formattedErrors,
                });
            },
        }),
    );
}

//короче суть такая: создаем экземпляр приложения, накидываем ему setupApp для настройки (туда входит pipe)
//внутри этого пайпа логика такая, мы задаем условия валидации и с помощью свойства exceptionFactory, которое принимает callback
//задаем вид ошибок валидации. С помощью errorFormatter приводим ошибки к виду [{message: 'msg1', key: 'key1'}, {message: 'msg2', key: 'key2'}]
//и потом уже этот массив объектов с ошибками с помощью throw new DomainError выкидываем
//вид выкинутой ошибки будет следующий {code: 5, message: 'Validation failed', extensions: [{message: 'msg1', key: 'key1'}, {message: 'msg2', key: 'key2'}]}
//далее нужно будет все ошибки привести к такому виду и сделать exceptionFilter, чтобы ошибки отдавались в нужном формате