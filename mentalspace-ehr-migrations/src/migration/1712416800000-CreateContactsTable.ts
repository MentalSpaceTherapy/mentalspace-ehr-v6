import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateContactsTable1712416800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE contact_type AS ENUM ('referral_source', 'partner', 'vendor', 'other')`);
        
        await queryRunner.createTable(
            new Table({
                name: "contacts",
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
                        name: "organization",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "contact_type",
                        type: "contact_type",
                        default: "'other'",
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
                        name: "address_line1",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "address_line2",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "city",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                    },
                    {
                        name: "state",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                    },
                    {
                        name: "postal_code",
                        type: "varchar",
                        length: "20",
                        isNullable: true,
                    },
                    {
                        name: "country",
                        type: "varchar",
                        length: "100",
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
            "contacts",
            new TableForeignKey({
                columnNames: ["assigned_to"],
                referencedColumnNames: ["id"],
                referencedTableName: "staff",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("contacts");
        
        // Drop foreign key
        const assignedToForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("assigned_to") !== -1);
        if (assignedToForeignKey) {
            await queryRunner.dropForeignKey("contacts", assignedToForeignKey);
        }
        
        await queryRunner.dropTable("contacts");
        await queryRunner.query(`DROP TYPE contact_type`);
    }
}
