import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRecurringAppointmentsTable1712415800000 implements MigrationInterface {
    name = 'CreateRecurringAppointmentsTable1712415800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for recurrence pattern
        await queryRunner.query(`
            CREATE TYPE "recurrence_pattern_enum" AS ENUM (
                'DAILY', 
                'WEEKLY',
                'BIWEEKLY',
                'MONTHLY'
            )
        `);

        // Create recurring_appointments table
        await queryRunner.query(`
            CREATE TABLE "recurring_appointments" (
                "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
                "provider_id" UUID NOT NULL,
                "recurrence_pattern" "recurrence_pattern_enum" NOT NULL,
                "start_date" DATE NOT NULL,
                "end_date" DATE,
                "start_time" TIME NOT NULL,
                "end_time" TIME NOT NULL,
                "day_of_week_mask" INTEGER NOT NULL DEFAULT 0,
                "day_of_month" INTEGER,
                "service_type" VARCHAR,
                "location" VARCHAR,
                "is_telehealth" BOOLEAN NOT NULL DEFAULT false,
                "notes" TEXT,
                "is_active" BOOLEAN NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_recurring_appointments" PRIMARY KEY ("id"),
                CONSTRAINT "FK_recurring_appointments_provider" FOREIGN KEY ("provider_id") 
                    REFERENCES "staff"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_recurring_appointments_provider_id" ON "recurring_appointments" ("provider_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_recurring_appointments_pattern" ON "recurring_appointments" ("recurrence_pattern")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_recurring_appointments_is_active" ON "recurring_appointments" ("is_active")
        `);

        // Add foreign key to appointments table for recurring_appointment_id
        await queryRunner.query(`
            ALTER TABLE "appointments" 
            ADD CONSTRAINT "FK_appointments_recurring_appointment" 
            FOREIGN KEY ("recurring_appointment_id") 
            REFERENCES "recurring_appointments"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key from appointments table
        await queryRunner.query(`
            ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_recurring_appointment"
        `);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_recurring_appointments_is_active"`);
        await queryRunner.query(`DROP INDEX "IDX_recurring_appointments_pattern"`);
        await queryRunner.query(`DROP INDEX "IDX_recurring_appointments_provider_id"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "recurring_appointments"`);
        
        // Drop enum
        await queryRunner.query(`DROP TYPE "recurrence_pattern_enum"`);
    }
}
