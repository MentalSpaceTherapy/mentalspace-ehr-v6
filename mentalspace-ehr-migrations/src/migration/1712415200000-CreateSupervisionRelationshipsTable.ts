import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSupervisionRelationshipsTable1712415200000 implements MigrationInterface {
    name = 'CreateSupervisionRelationshipsTable1712415200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create supervision_relationships table
        await queryRunner.query(`
            CREATE TABLE "supervision_relationships" (
                "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
                "supervisor_id" UUID NOT NULL,
                "supervisee_id" UUID NOT NULL,
                "start_date" DATE NOT NULL,
                "end_date" DATE,
                "active" BOOLEAN NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_supervision_relationships" PRIMARY KEY ("id"),
                CONSTRAINT "FK_supervision_relationships_supervisor" FOREIGN KEY ("supervisor_id") 
                    REFERENCES "staff"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_supervision_relationships_supervisee" FOREIGN KEY ("supervisee_id") 
                    REFERENCES "staff"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_supervision_supervisor_id" ON "supervision_relationships" ("supervisor_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_supervision_supervisee_id" ON "supervision_relationships" ("supervisee_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_supervision_active" ON "supervision_relationships" ("active")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_supervision_active"`);
        await queryRunner.query(`DROP INDEX "IDX_supervision_supervisee_id"`);
        await queryRunner.query(`DROP INDEX "IDX_supervision_supervisor_id"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "supervision_relationships"`);
    }
}
