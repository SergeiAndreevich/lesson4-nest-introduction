import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secret',
            signOptions: { expiresIn: '5m' },
        }),
    ],
    exports: [JwtModule],
})
export class JwtGlobalModule {}
