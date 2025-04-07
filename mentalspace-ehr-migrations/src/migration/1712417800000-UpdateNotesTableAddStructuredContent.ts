import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNotesTableAddStructuredContent1712417800000 implements MigrationInterface {
    name = 'UpdateNotesTableAddStructuredContent1712417800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update note_type_enum to include new note types
        await queryRunner.query(`
            ALTER TYPE "note_type_enum" ADD VALUE 'CANCELLATION' AFTER 'ASSESSMENT';
            ALTER TYPE "note_type_enum" ADD VALUE 'CONTACT' AFTER 'CANCELLATION';
        `);

        // Add structured_content column to notes table
        await queryRunner.query(`
            ALTER TABLE "notes" ADD COLUMN "structured_content" JSONB;
        `);

        // Create index for faster JSON queries
        await queryRunner.query(`
            CREATE INDEX "IDX_notes_structured_content" ON "notes" USING GIN ("structured_content");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index
        await queryRunner.query(`DROP INDEX "IDX_notes_structured_content"`);
        
        // Remove structured_content column
        await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "structured_content"`);
        
        // Note: We cannot remove values from enum types in PostgreSQL
        // The note_type_enum will retain the added values
    }
}
