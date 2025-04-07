import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Staff } from "./Staff";
import { Client } from "./Client";
import { Lead } from "./Lead";

@Entity("tasks")
export class Task {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    title: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "enum", enum: ["not_started", "in_progress", "completed", "deferred", "cancelled"], default: "not_started" })
    status: string;

    @Column({ type: "enum", enum: ["low", "medium", "high", "urgent"], default: "medium" })
    priority: string;

    @Column({ nullable: true })
    assigned_to: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "assigned_to" })
    assigned_staff: Staff;

    @Column({ nullable: true })
    client_id: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: "client_id" })
    client: Client;

    @Column({ nullable: true })
    lead_id: string;

    @ManyToOne(() => Lead)
    @JoinColumn({ name: "lead_id" })
    lead: Lead;

    @Column({ type: "timestamp", nullable: false })
    due_date: Date;

    @Column({ type: "timestamp", nullable: true })
    completed_at: Date;

    @Column({ type: "varchar", length: 255, nullable: true })
    category: string;

    @Column({ type: "jsonb", nullable: true })
    custom_fields: object;

    @Column({ type: "boolean", default: false })
    is_recurring: boolean;

    @Column({ type: "varchar", length: 50, nullable: true })
    recurrence_pattern: string;

    @Column({ type: "boolean", default: false })
    is_deleted: boolean;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
