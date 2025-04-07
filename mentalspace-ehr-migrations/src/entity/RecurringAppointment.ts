import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Staff } from "./Staff";
import { Appointment } from "./Appointment";

@Entity("recurring_appointments")
export class RecurringAppointment {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    provider_id: string;

    @ManyToOne(() => Staff)
    @JoinColumn({ name: "provider_id" })
    provider: Staff;

    @Column({
        type: "enum",
        enum: ["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"],
        nullable: false
    })
    recurrence_pattern: string;

    @Column({ type: "date", nullable: false })
    start_date: Date;

    @Column({ type: "date", nullable: true })
    end_date: Date;

    @Column({ type: "time", nullable: false })
    start_time: string;

    @Column({ type: "time", nullable: false })
    end_time: string;

    @Column({ type: "int", default: 0 })
    day_of_week_mask: number;

    @Column({ type: "int", nullable: true })
    day_of_month: number;

    @Column({ nullable: true })
    service_type: string;

    @Column({ nullable: true })
    location: string;

    @Column({ type: "boolean", default: false })
    is_telehealth: boolean;

    @Column({ type: "text", nullable: true })
    notes: string;

    @Column({ default: true })
    is_active: boolean;

    @OneToMany(() => Appointment, appointment => appointment.recurring_appointment_id)
    appointments: Appointment[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
