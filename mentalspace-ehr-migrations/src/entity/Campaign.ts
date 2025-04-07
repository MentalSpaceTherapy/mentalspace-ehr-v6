import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Staff } from "./Staff";

@Entity("campaigns")
export class Campaign {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "enum", enum: ["email", "sms", "social_media", "direct_mail", "event", "other"], default: "email" })
    campaign_type: string;

    @Column({ type: "enum", enum: ["draft", "scheduled", "active", "paused", "completed", "cancelled"], default: "draft" })
    status: string;

    @Column({ nullable: true })
    owner_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "owner_id" })
    owner: Staff;

    @Column({ type: "date", nullable: true })
    start_date: Date;

    @Column({ type: "date", nullable: true })
    end_date: Date;

    @Column({ type: "jsonb", nullable: true })
    target_criteria: object;

    @Column({ type: "jsonb", nullable: true })
    metrics: object;

    @Column({ type: "int", default: 0 })
    total_recipients: number;

    @Column({ type: "int", default: 0 })
    total_responses: number;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    conversion_rate: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    budget: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    actual_cost: number;

    @Column({ type: "boolean", default: false })
    is_deleted: boolean;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
