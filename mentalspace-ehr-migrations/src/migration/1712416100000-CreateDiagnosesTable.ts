import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDiagnosesTable1712416100000 implements MigrationInterface {
    name = 'CreateDiagnosesTable1712416100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for diagnosis types
        await queryRunner.query(`
            CREATE TYPE "diagnosis_type_enum" AS ENUM (
                'PRIMARY', 
                'SECONDARY',
                'TERTIARY',
                'PROVISIONAL',
                'RULE_OUT'
            )
        `);

        // Create diagnoses table
        await queryRunner.query(`
            CREATE TABLE "diagnoses" (
                "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
                "client_id" UUID NOT NULL,
                "provider_id" UUID NOT NULL,
                "code" VARCHAR NOT NULL,
                "description" VARCHAR NOT NULL,
                "diagnosis_type" "diagnosis_type_enum" NOT NULL DEFAULT 'PRIMARY',
                "diagnosis_date" DATE NOT NULL,
                "resolution_date" DATE,
                "notes" TEXT,
                "is_active" BOOLEAN NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_diagnoses" PRIMARY KEY ("id"),
                CONSTRAINT "FK_diagnoses_client" FOREIGN KEY ("client_id") 
                    REFERENCES "clients"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_diagnoses_provider" FOREIGN KEY ("provider_id") 
                    REFERENCES "staff"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_diagnoses_client_id" ON "diagnoses" ("client_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_diagnoses_provider_id" ON "diagnoses" ("provider_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_diagnoses_code" ON "diagnoses" ("code")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_diagnoses_diagnosis_type" ON "diagnoses" ("diagnosis_type")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_diagnoses_is_active" ON "diagnoses" ("is_active")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_diagnoses_is_active"`);
        await queryRunner.query(`DROP INDEX "IDX_diagnoses_diagnosis_type"`);
        await queryRunner.query(`DROP INDEX "IDX_diagnoses_code"`);
        await queryRunner.query(`DROP INDEX "IDX_diagnoses_provider_id"`);
        await queryRunner.query(`DROP INDEX "IDX_diagnoses_client_id"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "diagnoses"`);
        
        // Drop enum
        await queryRunner.query(`DROP TYPE "diagnosis_type_enum"`);
    }
}
