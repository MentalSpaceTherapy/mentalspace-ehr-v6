import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Staff } from "./Staff";

@Entity("dashboard_preferences")
export class DashboardPreference {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    staff_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "staff_id" })
    staff: Staff;

    @Column({ type: "varchar", length: 255, nullable: false })
    dashboard_type: string;

    @Column({ type: "jsonb", nullable: false })
    layout: object;

    @Column({ type: "jsonb", nullable: true })
    widget_settings: object;

    @Column({ type: "jsonb", nullable: true })
    filter_defaults: object;

    @Column({ type: "varchar", length: 255, nullable: true })
    theme: string;

    @Column({ type: "boolean", default: false })
    is_default: boolean;

    @Column({ type: "varchar", length: 255, nullable: true })
    name: string;

    @Column({ type: "boolean", default: false })
    is_deleted: boolean;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
