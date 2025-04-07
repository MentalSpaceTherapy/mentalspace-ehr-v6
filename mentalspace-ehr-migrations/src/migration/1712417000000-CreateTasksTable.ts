import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTasksTable1712417000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE task_status AS ENUM ('not_started', 'in_progress', 'completed', 'deferred', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent')`);
        
        await queryRunner.createTable(
            new Table({
                name: "tasks",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: "task_status",
                        default: "'not_started'",
                    },
                    {
                        name: "priority",
                        type: "task_priority",
                        default: "'medium'",
                    },
                    {
                        name: "assigned_to",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "client_id",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "lead_id",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "due_date",
                        type: "timestamp",
                        isNullable: false,
                    },
                    {
                        name: "completed_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "category",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "custom_fields",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "is_recurring",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "recurrence_pattern",
                        type: "varchar",
                        length: "50",
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

        // Add foreign key for assigned_to
        await queryRunner.createForeignKey(
            "tasks",
            new TableForeignKey({
                columnNames: ["assigned_to"],
                referencedColumnNames: ["id"],
                referencedTableName: "staff",
                onDelete: "SET NULL",
            })
        );

        // Add foreign key for client_id
        await queryRunner.createForeignKey(
            "tasks",
            new TableForeignKey({
                columnNames: ["client_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "clients",
                onDelete: "SET NULL",
            })
        );

        // Add foreign key for lead_id
        await queryRunner.createForeignKey(
            "tasks",
            new TableForeignKey({
                columnNames: ["lead_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "leads",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("tasks");
        
        // Drop foreign keys
        const assignedToForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("assigned_to") !== -1);
        if (assignedToForeignKey) {
            await queryRunner.dropForeignKey("tasks", assignedToForeignKey);
        }
        
        const clientForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("client_id") !== -1);
        if (clientForeignKey) {
            await queryRunner.dropForeignKey("tasks", clientForeignKey);
        }
        
        const leadForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("lead_id") !== -1);
        if (leadForeignKey) {
            await queryRunner.dropForeignKey("tasks", leadForeignKey);
        }
        
        await queryRunner.dropTable("tasks");
        await queryRunner.query(`DROP TYPE task_priority`);
        await queryRunner.query(`DROP TYPE task_status`);
    }
}
