import {Inject, Injectable} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";


@Injectable()
export class EmailConfirmationSQLRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool
    ) {}

    async confirmEmail(){
        // async confirmEmail(userId: string): Promise<boolean> {
        //     const result = await this.userModel.updateOne(
        //         { _id: userId },
        //         {
        //             $set: {
        //                 "emailConfirmation.isConfirmed" : true
        //             },
        //         },
        //     );
        //
        //     return result.matchedCount === 1 && result.modifiedCount === 1;
        // }
    }

    async findUserByEmailCode(code: string){
        const result = await this.pool.query(`
        SELECT * FROM -- WHERE confirmation_code = $1
        `,[code]);
        return result.rows[0] ??  null
    }
}



