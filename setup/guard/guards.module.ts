import {Module} from "@nestjs/common";
import {BearerGuard} from "./bearer.guard";
import {BasicGuard} from "./basic.guard";

@Module({
    providers: [BearerGuard, BasicGuard],
    exports: [BearerGuard, BasicGuard]
})
export class GuardsModule{}