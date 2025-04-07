import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMessageThreadsTable1712416300000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE message_thread_type AS ENUM ('individual', 'group')`);
        
        await queryRunner.createTable(
            new Table({
                name: "message_threads",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "subject",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "thread_type",
                        type: "message_thread_type",
                        default: "'individual'",
                    },
                    {
                        name: "is_secure",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "is_active",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "metadata",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "staff_participants",
                        type: "uuid[]",
                        isNullable: true,
                    },
                    {
                        name: "client_participants",
                        type: "uuid[]",
                        isNullable: true,
                    },
                    {
                        name: "is_deleted",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "deleted_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("message_threads");
        await queryRunner.query(`DROP TYPE message_thread_type`);
    }
}
