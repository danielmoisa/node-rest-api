import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1635856446425 implements MigrationInterface {
    name = 'migration1635856446425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "email" varchar NOT NULL, "avatar" varchar, "phoneNumber" varchar, "password" varchar NOT NULL, "isVerified" boolean NOT NULL DEFAULT (0), "emailConfirmationCode" varchar NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_482055bf04ef270e3e8d97037ee" UNIQUE ("emailConfirmationCode"))`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "firstName", "lastName", "email", "avatar", "phoneNumber", "password") SELECT "id", "firstName", "lastName", "email", "avatar", "phoneNumber", "password" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "email" varchar NOT NULL, "avatar" varchar, "phoneNumber" varchar, "password" varchar NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "user"("id", "firstName", "lastName", "email", "avatar", "phoneNumber", "password") SELECT "id", "firstName", "lastName", "email", "avatar", "phoneNumber", "password" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
    }

}
