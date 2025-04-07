import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateRiskAssessmentsTable1712416200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "risk_assessments",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "client_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "provider_id",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "assessment_date",
                        type: "date",
                        isNullable: false,
                    },
                    {
                        name: "suicide_risk_level",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "homicide_risk_level",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "self_harm_risk_level",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "has_suicide_plan",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "has_suicide_means",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "has_suicide_intent",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "risk_factors",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "protective_factors",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "safety_plan",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "clinical_notes",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "related_note_id",
                        type: "uuid",
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

        // Add foreign key for client_id
        await queryRunner.createForeignKey(
            "risk_assessments",
            new TableForeignKey({
                columnNames: ["client_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "clients",
                onDelete: "CASCADE",
            })
        );

        // Add foreign key for provider_id
        await queryRunner.createForeignKey(
            "risk_assessments",
            new TableForeignKey({
                columnNames: ["provider_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "staff",
                onDelete: "CASCADE",
            })
        );

        // Add foreign key for related_note_id
        await queryRunner.createForeignKey(
            "risk_assessments",
            new TableForeignKey({
                columnNames: ["related_note_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "notes",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("risk_assessments");
        
        // Drop foreign keys
        const clientForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("client_id") !== -1);
        if (clientForeignKey) {
            await queryRunner.dropForeignKey("risk_assessments", clientForeignKey);
        }
        
        const providerForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("provider_id") !== -1);
        if (providerForeignKey) {
            await queryRunner.dropForeignKey("risk_assessments", providerForeignKey);
        }
        
        const noteForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("related_note_id") !== -1);
        if (noteForeignKey) {
            await queryRunner.dropForeignKey("risk_assessments", noteForeignKey);
        }
        
        await queryRunner.dropTable("risk_assessments");
    }
}
