import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Staff } from "./Staff";

@Entity("settings")
export class Setting {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    key: string;

    @Column({ type: "text", nullable: true })
    value: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    category: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    display_name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "enum", enum: ["string", "number", "boolean", "json", "array"], default: "string" })
    data_type: string;

    @Column({ type: "boolean", default: false })
    is_system_setting: boolean;

    @Column({ type: "boolean", default: true })
    is_visible: boolean;

    @Column({ type: "jsonb", nullable: true })
    validation_rules: object;

    @Column({ nullable: true })
    last_modified_by: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "last_modified_by" })
    modifier: Staff;

    @Column({ type: "jsonb", nullable: true })
    allowed_values: object;

    @Column({ type: "boolean", default: false })
    requires_restart: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
