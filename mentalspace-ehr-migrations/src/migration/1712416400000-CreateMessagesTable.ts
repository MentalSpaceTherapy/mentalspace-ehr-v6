import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMessagesTable1712416400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'video')`);
        
        await queryRunner.createTable(
            new Table({
                name: "messages",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "thread_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "sender_staff_id",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "sender_client_id",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "content",
                        type: "text",
                        isNullable: false,
                    },
                    {
                        name: "is_system_message",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "attachments",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "message_type",
                        type: "message_type",
                        default: "'text'",
                    },
                    {
                        name: "is_encrypted",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "encryption_key_id",
                        type: "varchar",
                        length: "255",
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

        // Add foreign key for thread_id
        await queryRunner.createForeignKey(
            "messages",
            new TableForeignKey({
                columnNames: ["thread_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "message_threads",
                onDelete: "CASCADE",
            })
        );

        // Add foreign key for sender_staff_id
        await queryRunner.createForeignKey(
            "messages",
            new TableForeignKey({
                columnNames: ["sender_staff_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "staff",
                onDelete: "SET NULL",
            })
        );

        // Add foreign key for sender_client_id
        await queryRunner.createForeignKey(
            "messages",
            new TableForeignKey({
                columnNames: ["sender_client_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "clients",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("messages");
        
        // Drop foreign keys
        const threadForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("thread_id") !== -1);
        if (threadForeignKey) {
            await queryRunner.dropForeignKey("messages", threadForeignKey);
        }
        
        const staffForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("sender_staff_id") !== -1);
        if (staffForeignKey) {
            await queryRunner.dropForeignKey("messages", staffForeignKey);
        }
        
        const clientForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("sender_client_id") !== -1);
        if (clientForeignKey) {
            await queryRunner.dropForeignKey("messages", clientForeignKey);
        }
        
        await queryRunner.dropTable("messages");
        await queryRunner.query(`DROP TYPE message_type`);
    }
}
