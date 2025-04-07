import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClientFlagsTable1712415500000 implements MigrationInterface {
    name = 'CreateClientFlagsTable1712415500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for flag types
        await queryRunner.query(`
            CREATE TYPE "client_flag_type_enum" AS ENUM (
                'BILLING', 
                'CLINICAL',
                'ADMINISTRATIVE',
                'CUSTOM'
            )
        `);

        // Create client_flags table
        await queryRunner.query(`
            CREATE TABLE "client_flags" (
                "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
                "client_id" UUID NOT NULL,
                "flag_type" "client_flag_type_enum" NOT NULL,
                "flag_value" VARCHAR NOT NULL,
                "description" TEXT,
                "created_by" UUID NOT NULL,
                "active" BOOLEAN NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_client_flags" PRIMARY KEY ("id"),
                CONSTRAINT "FK_client_flags_client" FOREIGN KEY ("client_id") 
                    REFERENCES "clients"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_client_flags_staff" FOREIGN KEY ("created_by") 
                    REFERENCES "staff"("id") ON DELETE SET NULL
            )
        `);

        // Create indexes for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_client_flags_client_id" ON "client_flags" ("client_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_client_flags_flag_type" ON "client_flags" ("flag_type")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_client_flags_active" ON "client_flags" ("active")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_client_flags_active"`);
        await queryRunner.query(`DROP INDEX "IDX_client_flags_flag_type"`);
        await queryRunner.query(`DROP INDEX "IDX_client_flags_client_id"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "client_flags"`);
        
        // Drop enum
        await queryRunner.query(`DROP TYPE "client_flag_type_enum"`);
    }
}
