import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { Staff } from "./Staff";

@Entity("risk_assessments")
export class RiskAssessment {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    client_id: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: "client_id" })
    client: Client;

    @Column({ nullable: false })
    provider_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "provider_id" })
    provider: Staff;

    @Column({ type: "date", nullable: false })
    assessment_date: Date;

    @Column({ type: "int", default: 0 })
    suicide_risk_level: number;

    @Column({ type: "int", default: 0 })
    homicide_risk_level: number;

    @Column({ type: "int", default: 0 })
    self_harm_risk_level: number;

    @Column({ type: "boolean", default: false })
    has_suicide_plan: boolean;

    @Column({ type: "boolean", default: false })
    has_suicide_means: boolean;

    @Column({ type: "boolean", default: false })
    has_suicide_intent: boolean;

    @Column({ type: "text", nullable: true })
    risk_factors: string;

    @Column({ type: "text", nullable: true })
    protective_factors: string;

    @Column({ type: "text", nullable: true })
    safety_plan: string;

    @Column({ type: "text", nullable: true })
    clinical_notes: string;

    @Column({ nullable: true })
    related_note_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
