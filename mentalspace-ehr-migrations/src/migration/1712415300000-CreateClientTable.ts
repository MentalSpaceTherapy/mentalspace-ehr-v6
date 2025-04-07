import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClientTable1712415300000 implements MigrationInterface {
    name = 'CreateClientTable1712415300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types for client status and gender
        await queryRunner.query(`
            CREATE TYPE "client_status_enum" AS ENUM (
                'ACTIVE', 
                'INACTIVE',
                'WAITLIST'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "client_gender_enum" AS ENUM (
                'MALE', 
                'FEMALE',
                'OTHER',
                'NOT_SPECIFIED'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "client_risk_flag_enum" AS ENUM (
                'NONE', 
                'LOW',
                'MEDIUM',
                'HIGH'
            )
        `);

        // Create clients table
        await queryRunner.query(`
            CREATE TABLE "clients" (
                "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" VARCHAR NOT NULL,
                "last_name" VARCHAR NOT NULL,
                "preferred_name" VARCHAR,
                "date_of_birth" DATE NOT NULL,
                "gender" "client_gender_enum" NOT NULL,
                "phone" VARCHAR NOT NULL,
                "email" VARCHAR,
                "address_line1" VARCHAR NOT NULL,
                "address_line2" VARCHAR,
                "city" VARCHAR NOT NULL,
                "state" VARCHAR NOT NULL,
                "postal_code" VARCHAR NOT NULL,
                "country" VARCHAR NOT NULL DEFAULT 'USA',
                "status" "client_status_enum" NOT NULL DEFAULT 'ACTIVE',
                "assigned_therapist_id" UUID,
                "risk_flag" "client_risk_flag_enum" NOT NULL DEFAULT 'NONE',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_clients" PRIMARY KEY ("id"),
                CONSTRAINT "FK_clients_assigned_therapist" FOREIGN KEY ("assigned_therapist_id") 
                    REFERENCES "staff"("id") ON DELETE SET NULL
            )
        `);

        // Create indexes for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_clients_name" ON "clients" ("last_name", "first_name")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_clients_assigned_therapist_id" ON "clients" ("assigned_therapist_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_clients_status" ON "clients" ("status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_clients_risk_flag" ON "clients" ("risk_flag")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_clients_email" ON "clients" ("email") WHERE "email" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_clients_email"`);
        await queryRunner.query(`DROP INDEX "IDX_clients_risk_flag"`);
        await queryRunner.query(`DROP INDEX "IDX_clients_status"`);
        await queryRunner.query(`DROP INDEX "IDX_clients_assigned_therapist_id"`);
        await queryRunner.query(`DROP INDEX "IDX_clients_name"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "clients"`);
        
        // Drop enums
        await queryRunner.query(`DROP TYPE "client_risk_flag_enum"`);
        await queryRunner.query(`DROP TYPE "client_gender_enum"`);
        await queryRunner.query(`DROP TYPE "client_status_enum"`);
    }
}
