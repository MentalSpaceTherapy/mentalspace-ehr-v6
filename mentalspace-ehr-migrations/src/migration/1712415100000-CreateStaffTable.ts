import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStaffTable1712415100000 implements MigrationInterface {
    name = 'CreateStaffTable1712415100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for staff status
        await queryRunner.query(`
            CREATE TYPE "staff_status_enum" AS ENUM (
                'ACTIVE', 
                'INACTIVE'
            )
        `);

        // Create staff table
        await queryRunner.query(`
            CREATE TABLE "staff" (
                "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" UUID NOT NULL,
                "first_name" VARCHAR NOT NULL,
                "last_name" VARCHAR NOT NULL,
                "phone" VARCHAR NOT NULL,
                "license_number" VARCHAR,
                "license_expiration_date" DATE,
                "department" VARCHAR,
                "status" "staff_status_enum" NOT NULL DEFAULT 'ACTIVE',
                "supervisor_id" UUID,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_staff" PRIMARY KEY ("id"),
                CONSTRAINT "FK_staff_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_staff_supervisor" FOREIGN KEY ("supervisor_id") REFERENCES "staff"("id") ON DELETE SET NULL
            )
        `);

        // Create indexes for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_staff_user_id" ON "staff" ("user_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_staff_supervisor_id" ON "staff" ("supervisor_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_staff_name" ON "staff" ("last_name", "first_name")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_staff_name"`);
        await queryRunner.query(`DROP INDEX "IDX_staff_supervisor_id"`);
        await queryRunner.query(`DROP INDEX "IDX_staff_user_id"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "staff"`);
        
        // Drop enum
        await queryRunner.query(`DROP TYPE "staff_status_enum"`);
    }
}
