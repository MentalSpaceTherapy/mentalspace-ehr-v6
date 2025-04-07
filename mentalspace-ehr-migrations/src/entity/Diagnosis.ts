import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { Staff } from "./Staff";

@Entity("diagnoses")
export class Diagnosis {
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

    @Column({ nullable: false })
    code: string;

    @Column({ nullable: false })
    description: string;

    @Column({
        type: "enum",
        enum: ["PRIMARY", "SECONDARY", "TERTIARY", "PROVISIONAL", "RULE_OUT"],
        default: "PRIMARY"
    })
    diagnosis_type: string;

    @Column({ type: "date", nullable: false })
    diagnosis_date: Date;

    @Column({ type: "date", nullable: true })
    resolution_date: Date;

    @Column({ type: "text", nullable: true })
    notes: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
