import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateIntegrationsTable1712417300000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE integration_status AS ENUM ('active', 'inactive', 'testing', 'error')`);
        await queryRunner.query(`CREATE TYPE integration_type AS ENUM ('ehr', 'billing', 'telehealth', 'calendar', 'email', 'sms', 'payment', 'other')`);
        
        await queryRunner.createTable(
            new Table({
                name: "integrations",
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
                        name: "integration_key",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: "status",
                        type: "integration_status",
                        default: "'inactive'",
                    },
                    {
                        name: "integration_type",
                        type: "integration_type",
                        default: "'other'",
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "configuration",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "credentials",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "metadata",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "api_endpoint",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "webhook_url",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "last_configured_by",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "last_sync_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "last_error",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "is_system_integration",
                        type: "boolean",
                        default: false,
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

        // Add foreign key for last_configured_by
        await queryRunner.createForeignKey(
            "integrations",
            new TableForeignKey({
                columnNames: ["last_configured_by"],
                referencedColumnNames: ["id"],
                referencedTableName: "staff",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("integrations");
        
        // Drop foreign key
        const lastConfiguredByForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("last_configured_by") !== -1);
        if (lastConfiguredByForeignKey) {
            await queryRunner.dropForeignKey("integrations", lastConfiguredByForeignKey);
        }
        
        await queryRunner.dropTable("integrations");
        await queryRunner.query(`DROP TYPE integration_type`);
        await queryRunner.query(`DROP TYPE integration_status`);
    }
}
