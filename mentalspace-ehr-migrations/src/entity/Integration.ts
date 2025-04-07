import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Staff } from "./Staff";

@Entity("integrations")
export class Integration {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    name: string;

    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    integration_key: string;

    @Column({ type: "enum", enum: ["active", "inactive", "testing", "error"], default: "inactive" })
    status: string;

    @Column({ type: "enum", enum: ["ehr", "billing", "telehealth", "calendar", "email", "sms", "payment", "other"], default: "other" })
    integration_type: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "jsonb", nullable: true })
    configuration: object;

    @Column({ type: "jsonb", nullable: true })
    credentials: object;

    @Column({ type: "jsonb", nullable: true })
    metadata: object;

    @Column({ type: "varchar", length: 255, nullable: true })
    api_endpoint: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    webhook_url: string;

    @Column({ nullable: true })
    last_configured_by: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "last_configured_by" })
    configurator: Staff;

    @Column({ type: "timestamp", nullable: true })
    last_sync_at: Date;

    @Column({ type: "text", nullable: true })
    last_error: string;

    @Column({ type: "boolean", default: false })
    is_system_integration: boolean;

    @Column({ type: "boolean", default: false })
    is_deleted: boolean;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
