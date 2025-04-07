import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateFileUploadsTable1712418200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "file_uploads",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "uuid"
                    },
                    {
                        name: "entity_type",
                        type: "varchar",
                        isNullable: false,
                        comment: "Type of entity this file is associated with (e.g., insurance_policy, client)"
                    },
                    {
                        name: "entity_id",
                        type: "uuid",
                        isNullable: false,
                        comment: "ID of the entity this file is associated with"
                    },
                    {
                        name: "file_type",
                        type: "varchar",
                        isNullable: false,
                        comment: "Type of file (e.g., insurance_card_front, insurance_card_back, profile_photo)"
                    },
                    {
                        name: "original_filename",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "file_path",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "file_size",
                        type: "integer",
                        isNullable: false
                    },
                    {
                        name: "mime_type",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "uploaded_by",
                        type: "uuid",
                        isNullable: true
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()"
                    }
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("file_uploads");
    }
}
