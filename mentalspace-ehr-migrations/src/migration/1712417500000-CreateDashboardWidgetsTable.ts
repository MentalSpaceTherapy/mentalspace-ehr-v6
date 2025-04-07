import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateDashboardWidgetsTable1712417500000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "dashboard_widgets",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "widget_type",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "name",
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
                        name: "default_config",
                        type: "jsonb",
                        isNullable: false,
                    },
                    {
                        name: "component_name",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "allowed_roles",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "data_sources",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "default_dimensions",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "is_active",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "is_system_widget",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "icon",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "category",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "supported_filters",
                        type: "jsonb",
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
        await queryRunner.dropTable("dashboard_widgets");
    }
}
