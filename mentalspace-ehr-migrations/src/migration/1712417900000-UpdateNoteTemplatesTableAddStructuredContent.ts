import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNoteTemplatesTableAddStructuredContent1712417900000 implements MigrationInterface {
    name = 'UpdateNoteTemplatesTableAddStructuredContent1712417900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add structured_content column to note_templates table
        await queryRunner.query(`
            ALTER TABLE "note_templates" ADD COLUMN "structured_content" JSONB;
        `);

        // Create index for faster JSON queries
        await queryRunner.query(`
            CREATE INDEX "IDX_note_templates_structured_content" ON "note_templates" USING GIN ("structured_content");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index
        await queryRunner.query(`DROP INDEX "IDX_note_templates_structured_content"`);
        
        // Remove structured_content column
        await queryRunner.query(`ALTER TABLE "note_templates" DROP COLUMN "structured_content"`);
    }
}
