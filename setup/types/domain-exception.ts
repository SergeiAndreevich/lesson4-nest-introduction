
//если специфических кодов будет много лучше разнести их в соответствующие модули
export enum DomainExceptionCode {
    //common
    NotFound = 1,
    BadRequest = 2,
    InternalServerError = 3,
    Forbidden = 4,
    ValidationError = 5,
    //auth
    Unauthorized = 11,
    EmailNotConfirmed = 12,
    ConfirmationCodeExpired = 13,
    PasswordRecoveryCodeExpired = 14,
    //...
}
export class Extension {
    constructor(
        public message: string,
        public key: string,
    ) {}
}

export class DomainException extends Error {
    message: string;
    code: DomainExceptionCode;
    extensions: Extension[];

    constructor(errorInfo: {
        code: DomainExceptionCode;
        message: string;
        extensions?: Extension[];
    }) {
        super(errorInfo.message);
        this.message = errorInfo.message;
        this.code = errorInfo.code;
        this.extensions = errorInfo.extensions || [];
    }
}

//здесь мы описываем нашу кастомную ошибку DomainException
//наша ошибка наследуется от Error, мы прописываем что у неё будут поля message, code, extensions
//обязательно вызываем конструктор, чтобы произошло корректное наследование поведения
//без super(errorInfo.message) не будет корректного поведения (сам Error это {name=Error, message, stack})