import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Client } from "./Client";

@Entity("emergency_contacts")
export class EmergencyContact {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    client_id: string;

    @ManyToOne(() => Client)
    @JoinColumn({ name: "client_id" })
    client: Client;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    relationship: string;

    @Column({ nullable: false })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    notes: string;

    @Column({ default: true })
    is_primary: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
