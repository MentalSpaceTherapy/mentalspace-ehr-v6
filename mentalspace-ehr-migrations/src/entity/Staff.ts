import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";

@Entity("staff")
export class Staff {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: false })
    user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ nullable: false })
    first_name: string;

    @Column({ nullable: false })
    last_name: string;

    @Column({ nullable: false })
    phone: string;

    @Column({ nullable: true })
    license_number: string;

    @Column({ type: "date", nullable: true })
    license_expiration_date: Date;

    @Column({ nullable: true })
    department: string;

    @Column({
        type: "enum",
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    })
    status: string;

    @Column({ nullable: true })
    supervisor_id: string;

    @ManyToOne(() => Staff, staff => staff.supervisees)
    @JoinColumn({ name: "supervisor_id" })
    supervisor: Staff;

    @OneToMany(() => Staff, staff => staff.supervisor)
    supervisees: Staff[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
