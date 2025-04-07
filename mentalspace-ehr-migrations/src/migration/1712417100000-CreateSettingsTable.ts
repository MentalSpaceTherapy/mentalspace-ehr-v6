import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateSettingsTable1712417100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE setting_data_type AS ENUM ('string', 'number', 'boolean', 'json', 'array')`);
        
        await queryRunner.createTable(
            new Table({
                name: "settings",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "key",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: "value",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "category",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "display_name",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "data_type",
                        type: "setting_data_type",
                        default: "'string'",
                    },
                    {
                        name: "is_system_setting",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "is_visible",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "validation_rules",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "last_modified_by",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "allowed_values",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "requires_restart",
                        type: "boolean",
                        default: false,
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

        // Add foreign key for last_modified_by
        await queryRunner.createForeignKey(
            "settings",
            new TableForeignKey({
                columnNames: ["last_modified_by"],
                referencedColumnNames: ["id"],
                referencedTableName: "staff",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("settings");
        
        // Drop foreign key
        const lastModifiedByForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("last_modified_by") !== -1);
        if (lastModifiedByForeignKey) {
            await queryRunner.dropForeignKey("settings", lastModifiedByForeignKey);
        }
        
        await queryRunner.dropTable("settings");
        await queryRunner.query(`DROP TYPE setting_data_type`);
    }
}
