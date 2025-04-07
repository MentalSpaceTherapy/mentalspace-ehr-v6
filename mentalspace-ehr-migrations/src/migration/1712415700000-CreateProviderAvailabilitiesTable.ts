import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProviderAvailabilitiesTable1712415700000 implements MigrationInterface {
    name = 'CreateProviderAvailabilitiesTable1712415700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for days of week
        await queryRunner.query(`
            CREATE TYPE "day_of_week_enum" AS ENUM (
                'MONDAY', 
                'TUESDAY',
                'WEDNESDAY',
                'THURSDAY',
                'FRIDAY',
                'SATURDAY',
                'SUNDAY'
            )
        `);

        // Create provider_availabilities table
        await queryRunner.query(`
            CREATE TABLE "provider_availabilities" (
                "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
                "provider_id" UUID NOT NULL,
                "day_of_week" "day_of_week_enum" NOT NULL,
                "start_time" TIME NOT NULL,
                "end_time" TIME NOT NULL,
                "is_available" BOOLEAN NOT NULL DEFAULT true,
                "effective_date" DATE,
                "end_date" DATE,
                "location" VARCHAR,
                "notes" TEXT,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_provider_availabilities" PRIMARY KEY ("id"),
                CONSTRAINT "FK_provider_availabilities_provider" FOREIGN KEY ("provider_id") 
                    REFERENCES "staff"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_provider_availabilities_provider_id" ON "provider_availabilities" ("provider_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_provider_availabilities_day_of_week" ON "provider_availabilities" ("day_of_week")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_provider_availabilities_is_available" ON "provider_availabilities" ("is_available")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_provider_availabilities_is_available"`);
        await queryRunner.query(`DROP INDEX "IDX_provider_availabilities_day_of_week"`);
        await queryRunner.query(`DROP INDEX "IDX_provider_availabilities_provider_id"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "provider_availabilities"`);
        
        // Drop enum
        await queryRunner.query(`DROP TYPE "day_of_week_enum"`);
    }
}
