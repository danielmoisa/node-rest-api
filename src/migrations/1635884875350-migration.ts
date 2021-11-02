import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1635884875350 implements MigrationInterface {
    name = 'migration1635884875350'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_client" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "website" varchar NOT NULL, "avatar" varchar, "description" varchar, "userId" integer NOT NULL, CONSTRAINT "FK_ad3b4bf8dd18a1d467c5c0fc13a" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_client"("id", "firstName", "lastName", "website", "avatar", "description", "userId") SELECT "id", "firstName", "lastName", "website", "avatar", "description", "userId" FROM "client"`);
        await queryRunner.query(`DROP TABLE "client"`);
        await queryRunner.query(`ALTER TABLE "temporary_client" RENAME TO "client"`);
        await queryRunner.query(`CREATE TABLE "campaign" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "text" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_client" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "website" varchar NOT NULL, "avatar" varchar, "description" varchar, "userId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_client"("id", "firstName", "lastName", "website", "avatar", "description", "userId") SELECT "id", "firstName", "lastName", "website", "avatar", "description", "userId" FROM "client"`);
        await queryRunner.query(`DROP TABLE "client"`);
        await queryRunner.query(`ALTER TABLE "temporary_client" RENAME TO "client"`);
        await queryRunner.query(`CREATE TABLE "temporary_client" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "website" varchar NOT NULL, "avatar" varchar, "description" varchar, "userId" integer)`);
        await queryRunner.query(`INSERT INTO "temporary_client"("id", "firstName", "lastName", "website", "avatar", "description", "userId") SELECT "id", "firstName", "lastName", "website", "avatar", "description", "userId" FROM "client"`);
        await queryRunner.query(`DROP TABLE "client"`);
        await queryRunner.query(`ALTER TABLE "temporary_client" RENAME TO "client"`);
        await queryRunner.query(`CREATE TABLE "temporary_client" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "website" varchar NOT NULL, "avatar" varchar, "description" varchar, "userId" integer, CONSTRAINT "FK_ad3b4bf8dd18a1d467c5c0fc13a" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_client"("id", "firstName", "lastName", "website", "avatar", "description", "userId") SELECT "id", "firstName", "lastName", "website", "avatar", "description", "userId" FROM "client"`);
        await queryRunner.query(`DROP TABLE "client"`);
        await queryRunner.query(`ALTER TABLE "temporary_client" RENAME TO "client"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client" RENAME TO "temporary_client"`);
        await queryRunner.query(`CREATE TABLE "client" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "website" varchar NOT NULL, "avatar" varchar, "description" varchar, "userId" integer)`);
        await queryRunner.query(`INSERT INTO "client"("id", "firstName", "lastName", "website", "avatar", "description", "userId") SELECT "id", "firstName", "lastName", "website", "avatar", "description", "userId" FROM "temporary_client"`);
        await queryRunner.query(`DROP TABLE "temporary_client"`);
        await queryRunner.query(`ALTER TABLE "client" RENAME TO "temporary_client"`);
        await queryRunner.query(`CREATE TABLE "client" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "website" varchar NOT NULL, "avatar" varchar, "description" varchar, "userId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "client"("id", "firstName", "lastName", "website", "avatar", "description", "userId") SELECT "id", "firstName", "lastName", "website", "avatar", "description", "userId" FROM "temporary_client"`);
        await queryRunner.query(`DROP TABLE "temporary_client"`);
        await queryRunner.query(`ALTER TABLE "client" RENAME TO "temporary_client"`);
        await queryRunner.query(`CREATE TABLE "client" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "website" varchar NOT NULL, "avatar" varchar, "description" varchar, "userId" integer NOT NULL, CONSTRAINT "FK_ad3b4bf8dd18a1d467c5c0fc13a" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "client"("id", "firstName", "lastName", "website", "avatar", "description", "userId") SELECT "id", "firstName", "lastName", "website", "avatar", "description", "userId" FROM "temporary_client"`);
        await queryRunner.query(`DROP TABLE "temporary_client"`);
        await queryRunner.query(`DROP TABLE "campaign"`);
        await queryRunner.query(`ALTER TABLE "client" RENAME TO "temporary_client"`);
        await queryRunner.query(`CREATE TABLE "client" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "website" varchar NOT NULL, "avatar" varchar, "description" varchar, "userId" integer NOT NULL, CONSTRAINT "FK_ad3b4bf8dd18a1d467c5c0fc13a" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "client"("id", "firstName", "lastName", "website", "avatar", "description", "userId") SELECT "id", "firstName", "lastName", "website", "avatar", "description", "userId" FROM "temporary_client"`);
        await queryRunner.query(`DROP TABLE "temporary_client"`);
    }

}
