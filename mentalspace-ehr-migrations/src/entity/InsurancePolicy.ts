import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Client } from "./Client";

@Entity("insurance_policies")
export class InsurancePolicy {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    client_id: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: "client_id" })
    client: Client;

    @Column({ nullable: false })
    carrier_name: string;

    @Column({ nullable: false })
    policy_number: string;

    @Column({ nullable: true })
    group_number: string;

    @Column({ type: "date", nullable: true })
    coverage_start_date: Date;

    @Column({ type: "date", nullable: true })
    coverage_end_date: Date;

    @Column({ type: "text", nullable: true })
    notes: string;

    @Column({ nullable: true })
    scanned_card_front_url: string;

    @Column({ nullable: true })
    scanned_card_back_url: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
