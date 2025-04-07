import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateLocationsTable1712417200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "locations",
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
                        name: "address_line1",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
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
                        isNullable: false,
                    },
                    {
                        name: "state",
                        type: "varchar",
                        length: "100",
                        isNullable: false,
                    },
                    {
                        name: "postal_code",
                        type: "varchar",
                        length: "20",
                        isNullable: false,
                    },
                    {
                        name: "country",
                        type: "varchar",
                        length: "100",
                        isNullable: false,
                        default: "'United States'",
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        length: "20",
                        isNullable: true,
                    },
                    {
                        name: "fax",
                        type: "varchar",
                        length: "20",
                        isNullable: true,
                    },
                    {
                        name: "email",
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
                        name: "is_active",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "operating_hours",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "services_offered",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "latitude",
                        type: "decimal",
                        precision: 10,
                        scale: 7,
                        isNullable: true,
                    },
                    {
                        name: "longitude",
                        type: "decimal",
                        precision: 10,
                        scale: 7,
                        isNullable: true,
                    },
                    {
                        name: "tax_id",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "npi",
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("locations");
    }
}
