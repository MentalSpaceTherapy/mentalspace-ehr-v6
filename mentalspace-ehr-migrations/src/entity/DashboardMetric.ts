import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("dashboard_metrics")
export class DashboardMetric {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    metric_key: string;

    @Column({ type: "enum", enum: ["count", "sum", "average", "percentage", "custom"], default: "count" })
    calculation_type: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    data_source: string;

    @Column({ type: "jsonb", nullable: true })
    query_parameters: object;

    @Column({ type: "varchar", length: 255, nullable: true })
    display_format: string;

    @Column({ type: "jsonb", nullable: true })
    thresholds: object;

    @Column({ type: "boolean", default: true })
    is_active: boolean;

    @Column({ type: "jsonb", nullable: true })
    allowed_roles: object;

    @Column({ type: "varchar", length: 255, nullable: true })
    category: string;

    @Column({ type: "int", default: 0 })
    cache_duration_minutes: number;

    @Column({ type: "timestamp", nullable: true })
    last_calculated_at: Date;

    @Column({ type: "boolean", default: false })
    is_deleted: boolean;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
