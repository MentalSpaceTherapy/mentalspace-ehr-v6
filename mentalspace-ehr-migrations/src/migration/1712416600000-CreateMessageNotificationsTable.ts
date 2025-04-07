import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMessageNotificationsTable1712416600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE notification_type AS ENUM ('email', 'sms', 'in_app', 'push')`);
        
        await queryRunner.createTable(
            new Table({
                name: "message_notifications",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "staff_id",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "client_id",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "message_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "thread_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "is_read",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "read_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "notification_type",
                        type: "notification_type",
                        default: "'in_app'",
                    },
                    {
                        name: "is_delivered",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "delivered_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "delivery_metadata",
                        type: "jsonb",
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

        // Add foreign key for staff_id
        await queryRunner.createForeignKey(
            "message_notifications",
            new TableForeignKey({
                columnNames: ["staff_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "staff",
                onDelete: "CASCADE",
            })
        );

        // Add foreign key for client_id
        await queryRunner.createForeignKey(
            "message_notifications",
            new TableForeignKey({
                columnNames: ["client_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "clients",
                onDelete: "CASCADE",
            })
        );

        // Add foreign key for message_id
        await queryRunner.createForeignKey(
            "message_notifications",
            new TableForeignKey({
                columnNames: ["message_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "messages",
                onDelete: "CASCADE",
            })
        );

        // Add foreign key for thread_id
        await queryRunner.createForeignKey(
            "message_notifications",
            new TableForeignKey({
                columnNames: ["thread_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "message_threads",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("message_notifications");
        
        // Drop foreign keys
        const staffForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("staff_id") !== -1);
        if (staffForeignKey) {
            await queryRunner.dropForeignKey("message_notifications", staffForeignKey);
        }
        
        const clientForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("client_id") !== -1);
        if (clientForeignKey) {
            await queryRunner.dropForeignKey("message_notifications", clientForeignKey);
        }
        
        const messageForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("message_id") !== -1);
        if (messageForeignKey) {
            await queryRunner.dropForeignKey("message_notifications", messageForeignKey);
        }
        
        const threadForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("thread_id") !== -1);
        if (threadForeignKey) {
            await queryRunner.dropForeignKey("message_notifications", threadForeignKey);
        }
        
        await queryRunner.dropTable("message_notifications");
        await queryRunner.query(`DROP TYPE notification_type`);
    }
}
