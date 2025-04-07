import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ nullable: false })
    password_hash: string;

    @Column({
        type: "enum",
        enum: ["PRACTICE_ADMIN", "CLINICIAN", "INTERN", "SUPERVISOR", "SCHEDULER", "BILLER"],
        nullable: false
    })
    role: string;

    @Column({ default: false })
    mfa_enabled: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
