import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNoteTemplatesTable1712416000000 implements MigrationInterface {
    name = 'CreateNoteTemplatesTable1712416000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create note_templates table
        await queryRunner.query(`
            CREATE TABLE "note_templates" (
                "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
                "name" VARCHAR NOT NULL,
                "template_type" "note_type_enum" NOT NULL,
                "content" TEXT NOT NULL,
                "created_by" UUID NOT NULL,
                "is_active" BOOLEAN NOT NULL DEFAULT true,
                "is_global" BOOLEAN NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_note_templates" PRIMARY KEY ("id"),
                CONSTRAINT "FK_note_templates_created_by" FOREIGN KEY ("created_by") 
                    REFERENCES "staff"("id") ON DELETE SET NULL
            )
        `);

        // Create indexes for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_note_templates_template_type" ON "note_templates" ("template_type")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_note_templates_is_active" ON "note_templates" ("is_active")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_note_templates_is_global" ON "note_templates" ("is_global")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_note_templates_created_by" ON "note_templates" ("created_by")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_note_templates_created_by"`);
        await queryRunner.query(`DROP INDEX "IDX_note_templates_is_global"`);
        await queryRunner.query(`DROP INDEX "IDX_note_templates_is_active"`);
        await queryRunner.query(`DROP INDEX "IDX_note_templates_template_type"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "note_templates"`);
    }
}
