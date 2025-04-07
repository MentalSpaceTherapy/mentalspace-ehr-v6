import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateDashboardMetricsTable1712417600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE calculation_type AS ENUM ('count', 'sum', 'average', 'percentage', 'custom')`);
        
        await queryRunner.createTable(
            new Table({
                name: "dashboard_metrics",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
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
                        name: "metric_key",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "calculation_type",
                        type: "calculation_type",
                        default: "'count'",
                    },
                    {
                        name: "data_source",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "query_parameters",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "display_format",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "thresholds",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "is_active",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "allowed_roles",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "category",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "cache_duration_minutes",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "last_calculated_at",
                        type: "timestamp",
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
        await queryRunner.dropTable("dashboard_metrics");
        await queryRunner.query(`DROP TYPE calculation_type`);
    }
}
