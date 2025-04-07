import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateDashboardPreferencesTable1712417400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "dashboard_preferences",
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
                        isNullable: false,
                    },
                    {
                        name: "dashboard_type",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "layout",
                        type: "jsonb",
                        isNullable: false,
                    },
                    {
                        name: "widget_settings",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "filter_defaults",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "theme",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "is_default",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "name",
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

        // Add foreign key for staff_id
        await queryRunner.createForeignKey(
            "dashboard_preferences",
            new TableForeignKey({
                columnNames: ["staff_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "staff",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("dashboard_preferences");
        
        // Drop foreign key
        const staffForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("staff_id") !== -1);
        if (staffForeignKey) {
            await queryRunner.dropForeignKey("dashboard_preferences", staffForeignKey);
        }
        
        await queryRunner.dropTable("dashboard_preferences");
    }
}
