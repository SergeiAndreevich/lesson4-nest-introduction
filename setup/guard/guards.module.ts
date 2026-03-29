import {Module} from "@nestjs/common";
import {BearerGuard} from "./bearer.guard";
import {BasicGuard} from "./basic.guard";
import {OptionalBearerGuard} from "./optionalBearer.guard";

@Module({
    providers: [BearerGuard, BasicGuard, OptionalBearerGuard],
    exports: [BearerGuard, BasicGuard, OptionalBearerGuard]
})
export class GuardsModule{}