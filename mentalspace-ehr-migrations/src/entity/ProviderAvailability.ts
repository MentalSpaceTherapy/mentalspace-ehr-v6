import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Staff } from "./Staff";

@Entity("provider_availabilities")
export class ProviderAvailability {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    provider_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "provider_id" })
    provider: Staff;

    @Column({
        type: "enum",
        enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
        nullable: false
    })
    day_of_week: string;

    @Column({ type: "time", nullable: false })
    start_time: string;

    @Column({ type: "time", nullable: false })
    end_time: string;

    @Column({ default: true })
    is_available: boolean;

    @Column({ type: "date", nullable: true })
    effective_date: Date;

    @Column({ type: "date", nullable: true })
    end_date: Date;

    @Column({ nullable: true })
    location: string;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
