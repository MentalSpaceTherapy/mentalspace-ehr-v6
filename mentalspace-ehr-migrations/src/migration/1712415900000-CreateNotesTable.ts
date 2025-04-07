import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotesTable1712415900000 implements MigrationInterface {
    name = 'CreateNotesTable1712415900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types for notes
        await queryRunner.query(`
            CREATE TYPE "note_type_enum" AS ENUM (
                'INTAKE', 
                'PROGRESS',
                'DISCHARGE',
                'TREATMENT_PLAN',
                'ASSESSMENT',
                'OTHER'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "note_status_enum" AS ENUM (
                'DRAFT', 
                'COMPLETED',
                'SIGNED',
                'LOCKED'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "supervision_status_enum" AS ENUM (
                'PENDING', 
                'APPROVED',
                'REJECTED'
            )
        `);

        // Create notes table
        await queryRunner.query(`
            CREATE TABLE "notes" (
                "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
                "client_id" UUID NOT NULL,
                "provider_id" UUID NOT NULL,
                "appointment_id" UUID,
                "note_type" "note_type_enum" NOT NULL,
                "content" TEXT NOT NULL,
                "template_id" UUID,
                "status" "note_status_enum" NOT NULL DEFAULT 'DRAFT',
                "signed_by" UUID,
                "signed_at" TIMESTAMP,
                "supervisor_id" UUID,
                "supervision_status" "supervision_status_enum",
                "supervision_date" TIMESTAMP,
                "supervision_comments" TEXT,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notes" PRIMARY KEY ("id"),
                CONSTRAINT "FK_notes_client" FOREIGN KEY ("client_id") 
                    REFERENCES "clients"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_notes_provider" FOREIGN KEY ("provider_id") 
                    REFERENCES "staff"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_notes_signed_by" FOREIGN KEY ("signed_by") 
                    REFERENCES "staff"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_notes_supervisor" FOREIGN KEY ("supervisor_id") 
                    REFERENCES "staff"("id") ON DELETE SET NULL
            )
        `);

        // Create indexes for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_notes_client_id" ON "notes" ("client_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_notes_provider_id" ON "notes" ("provider_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_notes_appointment_id" ON "notes" ("appointment_id") 
            WHERE "appointment_id" IS NOT NULL
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_notes_note_type" ON "notes" ("note_type")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_notes_status" ON "notes" ("status")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_notes_supervision_status" ON "notes" ("supervision_status") 
            WHERE "supervision_status" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_notes_supervision_status"`);
        await queryRunner.query(`DROP INDEX "IDX_notes_status"`);
        await queryRunner.query(`DROP INDEX "IDX_notes_note_type"`);
        await queryRunner.query(`DROP INDEX "IDX_notes_appointment_id"`);
        await queryRunner.query(`DROP INDEX "IDX_notes_provider_id"`);
        await queryRunner.query(`DROP INDEX "IDX_notes_client_id"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "notes"`);
        
        // Drop enums
        await queryRunner.query(`DROP TYPE "supervision_status_enum"`);
        await queryRunner.query(`DROP TYPE "note_status_enum"`);
        await queryRunner.query(`DROP TYPE "note_type_enum"`);
    }
}
