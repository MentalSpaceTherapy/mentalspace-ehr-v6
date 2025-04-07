import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUUIDExtension1712414900000 implements MigrationInterface {
    name = 'CreateUUIDExtension1712414900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create UUID extension for PostgreSQL
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // We don't drop the extension in down migration as it might be used by other tables
        // If needed, uncomment the following line:
        // await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }
}
