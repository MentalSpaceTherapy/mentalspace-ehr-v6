import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateLeadsTable1712416700000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'closed')`);
        
        await queryRunner.createTable(
            new Table({
                name: "leads",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "first_name",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "last_name",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "email",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        length: "20",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: "lead_status",
                        default: "'new'",
                    },
                    {
                        name: "source",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "assigned_to",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "notes",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "custom_fields",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "follow_up_date",
                        type: "date",
                        isNullable: true,
                    },
                    {
                        name: "referral_source",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "service_interest",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "is_converted",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "converted_client_id",
                        type: "uuid",
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
            "leads",
            new TableForeignKey({
                columnNames: ["assigned_to"],
                referencedColumnNames: ["id"],
                referencedTableName: "staff",
                onDelete: "SET NULL",
            })
        );

        // Add foreign key for converted_client_id
        await queryRunner.createForeignKey(
            "leads",
            new TableForeignKey({
                columnNames: ["converted_client_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "clients",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("leads");
        
        // Drop foreign keys
        const assignedToForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("assigned_to") !== -1);
        if (assignedToForeignKey) {
            await queryRunner.dropForeignKey("leads", assignedToForeignKey);
        }
        
        const convertedClientForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("converted_client_id") !== -1);
        if (convertedClientForeignKey) {
            await queryRunner.dropForeignKey("leads", convertedClientForeignKey);
        }
        
        await queryRunner.dropTable("leads");
        await queryRunner.query(`DROP TYPE lead_status`);
    }
}
