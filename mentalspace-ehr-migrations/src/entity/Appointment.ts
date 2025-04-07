import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Client } from "./Client";
import { Staff } from "./Staff";

@Entity("appointments")
export class Appointment {
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

    @Column({ type: "timestamp", nullable: false })
    start_time: Date;

    @Column({ type: "timestamp", nullable: false })
    end_time: Date;

    @Column({
        type: "enum",
        enum: ["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"],
        default: "SCHEDULED"
    })
    status: string;

    @Column({ nullable: true })
    service_type: string;

    @Column({ nullable: true })
    location: string;

    @Column({ type: "boolean", default: false })
    is_telehealth: boolean;

    @Column({ nullable: true })
    telehealth_url: string;

    @Column({ type: "text", nullable: true })
    notes: string;

    @Column({ nullable: true })
    recurring_appointment_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
