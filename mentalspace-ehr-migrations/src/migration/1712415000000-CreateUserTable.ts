import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1712415000000 implements MigrationInterface {
    name = 'CreateUserTable1712415000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for user roles
        await queryRunner.query(`
            CREATE TYPE "user_role_enum" AS ENUM (
                'PRACTICE_ADMIN', 
                'CLINICIAN', 
                'INTERN', 
                'SUPERVISOR', 
                'SCHEDULER', 
                'BILLER'
            )
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
                "email" VARCHAR NOT NULL,
                "password_hash" VARCHAR NOT NULL,
                "role" "user_role_enum" NOT NULL,
                "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // Create index on email for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_users_email" ON "users" ("email")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index
        await queryRunner.query(`DROP INDEX "IDX_users_email"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "users"`);
        
        // Drop enum
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }
}
