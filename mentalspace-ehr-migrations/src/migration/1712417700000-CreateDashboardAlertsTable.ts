import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateDashboardAlertsTable1712417700000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE alert_type AS ENUM ('info', 'warning', 'error', 'success')`);
        await queryRunner.query(`CREATE TYPE alert_source AS ENUM ('system', 'user', 'automated')`);
        
        await queryRunner.createTable(
            new Table({
                name: "dashboard_alerts",
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
                        name: "message",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "alert_type",
                        type: "alert_type",
                        default: "'info'",
                    },
                    {
                        name: "source",
                        type: "alert_source",
                        default: "'system'",
                    },
                    {
                        name: "metadata",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "is_dismissed",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "dismissed_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "dismissed_by",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "target_staff_id",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "related_client_id",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "action_url",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "expires_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "is_active",
                        type: "boolean",
                        default: true,
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

        // Add foreign key for dismissed_by
        await queryRunner.createForeignKey(
            "dashboard_alerts",
            new TableForeignKey({
                columnNames: ["dismissed_by"],
                referencedColumnNames: ["id"],
                referencedTableName: "staff",
                onDelete: "SET NULL",
            })
        );

        // Add foreign key for target_staff_id
        await queryRunner.createForeignKey(
            "dashboard_alerts",
            new TableForeignKey({
                columnNames: ["target_staff_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "staff",
                onDelete: "CASCADE",
            })
        );

        // Add foreign key for related_client_id
        await queryRunner.createForeignKey(
            "dashboard_alerts",
            new TableForeignKey({
                columnNames: ["related_client_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "clients",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("dashboard_alerts");
        
        // Drop foreign keys
        const dismissedByForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("dismissed_by") !== -1);
        if (dismissedByForeignKey) {
            await queryRunner.dropForeignKey("dashboard_alerts", dismissedByForeignKey);
        }
        
        const targetStaffForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("target_staff_id") !== -1);
        if (targetStaffForeignKey) {
            await queryRunner.dropForeignKey("dashboard_alerts", targetStaffForeignKey);
        }
        
        const relatedClientForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("related_client_id") !== -1);
        if (relatedClientForeignKey) {
            await queryRunner.dropForeignKey("dashboard_alerts", relatedClientForeignKey);
        }
        
        await queryRunner.dropTable("dashboard_alerts");
        await queryRunner.query(`DROP TYPE alert_source`);
        await queryRunner.query(`DROP TYPE alert_type`);
    }
}
