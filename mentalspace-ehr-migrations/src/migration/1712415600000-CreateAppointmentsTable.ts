import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAppointmentsTable1712415600000 implements MigrationInterface {
    name = 'CreateAppointmentsTable1712415600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for appointment status
        await queryRunner.query(`
            CREATE TYPE "appointment_status_enum" AS ENUM (
                'SCHEDULED', 
                'CONFIRMED',
                'COMPLETED',
                'CANCELLED',
                'NO_SHOW'
            )
        `);

        // Create appointments table
        await queryRunner.query(`
            CREATE TABLE "appointments" (
                "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
                "client_id" UUID NOT NULL,
                "provider_id" UUID NOT NULL,
                "start_time" TIMESTAMP NOT NULL,
                "end_time" TIMESTAMP NOT NULL,
                "status" "appointment_status_enum" NOT NULL DEFAULT 'SCHEDULED',
                "service_type" VARCHAR,
                "location" VARCHAR,
                "is_telehealth" BOOLEAN NOT NULL DEFAULT false,
                "telehealth_url" VARCHAR,
                "notes" TEXT,
                "recurring_appointment_id" UUID,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_appointments" PRIMARY KEY ("id"),
                CONSTRAINT "FK_appointments_client" FOREIGN KEY ("client_id") 
                    REFERENCES "clients"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_appointments_provider" FOREIGN KEY ("provider_id") 
                    REFERENCES "staff"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_appointments_client_id" ON "appointments" ("client_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_appointments_provider_id" ON "appointments" ("provider_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_appointments_start_time" ON "appointments" ("start_time")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_appointments_status" ON "appointments" ("status")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_appointments_recurring_id" ON "appointments" ("recurring_appointment_id") 
            WHERE "recurring_appointment_id" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_appointments_recurring_id"`);
        await queryRunner.query(`DROP INDEX "IDX_appointments_status"`);
        await queryRunner.query(`DROP INDEX "IDX_appointments_start_time"`);
        await queryRunner.query(`DROP INDEX "IDX_appointments_provider_id"`);
        await queryRunner.query(`DROP INDEX "IDX_appointments_client_id"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "appointments"`);
        
        // Drop enum
        await queryRunner.query(`DROP TYPE "appointment_status_enum"`);
    }
}
