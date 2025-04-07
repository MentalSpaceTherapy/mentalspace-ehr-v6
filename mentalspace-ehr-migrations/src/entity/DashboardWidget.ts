import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("dashboard_widgets")
export class DashboardWidget {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    widget_type: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "jsonb", nullable: false })
    default_config: object;

    @Column({ type: "varchar", length: 255, nullable: false })
    component_name: string;

    @Column({ type: "jsonb", nullable: true })
    allowed_roles: object;

    @Column({ type: "jsonb", nullable: true })
    data_sources: object;

    @Column({ type: "jsonb", nullable: true })
    default_dimensions: object;

    @Column({ type: "boolean", default: true })
    is_active: boolean;

    @Column({ type: "boolean", default: false })
    is_system_widget: boolean;

    @Column({ type: "varchar", length: 255, nullable: true })
    icon: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    category: string;

    @Column({ type: "jsonb", nullable: true })
    supported_filters: object;

    @Column({ type: "boolean", default: false })
    is_deleted: boolean;

    @Column({ type: "timestamp", nullable: true })
    deleted_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
