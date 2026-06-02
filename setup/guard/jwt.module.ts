import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ACCESS_TOKEN_TTL_SEC} from "../globalVariables";

@Global()
@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secret',
            signOptions: { expiresIn:  `${ACCESS_TOKEN_TTL_SEC}s`},
        }),
    ],
    exports: [JwtModule],
})
export class JwtGlobalModule {}
