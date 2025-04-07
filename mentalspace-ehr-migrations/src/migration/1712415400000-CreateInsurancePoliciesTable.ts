import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInsurancePoliciesTable1712415400000 implements MigrationInterface {
    name = 'CreateInsurancePoliciesTable1712415400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create insurance_policies table
        await queryRunner.query(`
            CREATE TABLE "insurance_policies" (
                "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
                "client_id" UUID NOT NULL,
                "carrier_name" VARCHAR NOT NULL,
                "policy_number" VARCHAR NOT NULL,
                "group_number" VARCHAR,
                "coverage_start_date" DATE,
                "coverage_end_date" DATE,
                "notes" TEXT,
                "scanned_card_front_url" VARCHAR,
                "scanned_card_back_url" VARCHAR,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_insurance_policies" PRIMARY KEY ("id"),
                CONSTRAINT "FK_insurance_policies_client" FOREIGN KEY ("client_id") 
                    REFERENCES "clients"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes for faster lookups
        await queryRunner.query(`
            CREATE INDEX "IDX_insurance_policies_client_id" ON "insurance_policies" ("client_id")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_insurance_policies_policy_number" ON "insurance_policies" ("policy_number")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_insurance_policies_policy_number"`);
        await queryRunner.query(`DROP INDEX "IDX_insurance_policies_client_id"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "insurance_policies"`);
    }
}
