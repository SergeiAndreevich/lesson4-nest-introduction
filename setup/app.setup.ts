import {INestApplication} from "@nestjs/common";
import {pipesSetup} from "./pipe/pipes.setup";

export function appSetup(app: INestApplication){
    pipesSetup(app);
}