import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCampaignsTable1712416900000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE campaign_type AS ENUM ('email', 'sms', 'social_media', 'direct_mail', 'event', 'other')`);
        await queryRunner.query(`CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')`);
        
        await queryRunner.createTable(
            new Table({
                name: "campaigns",
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
                        name: "campaign_type",
                        type: "campaign_type",
                        default: "'email'",
                    },
                    {
                        name: "status",
                        type: "campaign_status",
                        default: "'draft'",
                    },
                    {
                        name: "owner_id",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "start_date",
                        type: "date",
                        isNullable: true,
                    },
                    {
                        name: "end_date",
                        type: "date",
                        isNullable: true,
                    },
                    {
                        name: "target_criteria",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "metrics",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "total_recipients",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "total_responses",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "conversion_rate",
                        type: "decimal",
                        precision: 5,
                        scale: 2,
                        default: 0,
                    },
                    {
                        name: "budget",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        default: 0,
                    },
                    {
                        name: "actual_cost",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        default: 0,
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

        // Add foreign key for owner_id
        await queryRunner.createForeignKey(
            "campaigns",
            new TableForeignKey({
                columnNames: ["owner_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "staff",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("campaigns");
        
        // Drop foreign key
        const ownerForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("owner_id") !== -1);
        if (ownerForeignKey) {
            await queryRunner.dropForeignKey("campaigns", ownerForeignKey);
        }
        
        await queryRunner.dropTable("campaigns");
        await queryRunner.query(`DROP TYPE campaign_status`);
        await queryRunner.query(`DROP TYPE campaign_type`);
    }
}
