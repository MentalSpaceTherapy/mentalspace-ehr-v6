import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateClientsTableAddAdditionalFields1712418100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add primary care provider field
        await queryRunner.addColumn(
            "clients",
            new TableColumn({
                name: "primary_care_provider",
                type: "varchar",
                isNullable: true
            })
        );

        // Add referral source field
        await queryRunner.addColumn(
            "clients",
            new TableColumn({
                name: "referral_source",
                type: "varchar",
                isNullable: true
            })
        );

        // Add case number field
        await queryRunner.addColumn(
            "clients",
            new TableColumn({
                name: "case_number",
                type: "varchar",
                isNullable: true
            })
        );

        // Add court mandated field
        await queryRunner.addColumn(
            "clients",
            new TableColumn({
                name: "court_mandated",
                type: "boolean",
                default: false
            })
        );

        // Add court mandated notes field
        await queryRunner.addColumn(
            "clients",
            new TableColumn({
                name: "court_mandated_notes",
                type: "text",
                isNullable: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("clients", "primary_care_provider");
        await queryRunner.dropColumn("clients", "referral_source");
        await queryRunner.dropColumn("clients", "case_number");
        await queryRunner.dropColumn("clients", "court_mandated");
        await queryRunner.dropColumn("clients", "court_mandated_notes");
    }
}
