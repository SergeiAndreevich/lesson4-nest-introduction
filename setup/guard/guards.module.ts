import {Module} from "@nestjs/common";
import {BearerGuard} from "./bearer.guard";
import {BasicGuard} from "./basic.guard";
import {OptionalBearerGuard} from "./optionalBearer.guard";
import {RefreshTokenCookieGuard} from "./refreshTokenFromCookies.guard";

@Module({
    providers: [BearerGuard, BasicGuard, OptionalBearerGuard, RefreshTokenCookieGuard],
    exports: [BearerGuard, BasicGuard, OptionalBearerGuard, RefreshTokenCookieGuard],
})
export class GuardsModule{}