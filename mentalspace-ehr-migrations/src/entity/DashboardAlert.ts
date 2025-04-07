import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Staff } from "./Staff";
import { Client } from "./Client";

@Entity("dashboard_alerts")
export class DashboardAlert {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    title: string;

    @Column({ type: "text", nullable: true })
    message: string;

    @Column({ type: "enum", enum: ["info", "warning", "error", "success"], default: "info" })
    alert_type: string;

    @Column({ type: "enum", enum: ["system", "user", "automated"], default: "system" })
    source: string;

    @Column({ type: "jsonb", nullable: true })
    metadata: object;

    @Column({ type: "boolean", default: false })
    is_dismissed: boolean;

    @Column({ type: "timestamp", nullable: true })
    dismissed_at: Date;

    @Column({ nullable: true })
    dismissed_by: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "dismissed_by" })
    dismisser: Staff;

    @Column({ nullable: true })
    target_staff_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "target_staff_id" })
    target_staff: Staff;

    @Column({ nullable: true })
    related_client_id: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: "related_client_id" })
    related_client: Client;

    @Column({ type: "varchar", length: 255, nullable: true })
    action_url: string;

    @Column({ type: "timestamp", nullable: true })
    expires_at: Date;

    @Column({ type: "boolean", default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
