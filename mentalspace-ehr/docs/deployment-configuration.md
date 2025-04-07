# Deployment Configuration Guide for MentalSpace EHR

This document provides detailed instructions for deploying the MentalSpace EHR system in various environments.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- PostgreSQL 14+ (if not using Docker)
- SMTP server for email notifications
- AWS account (for production deployment)
- Domain name with DNS access

## Environment Configurations

The system uses environment variables for configuration, with separate files for different environments:

- `.env.development`: Development environment
- `.env.staging`: Staging environment
- `.env.production`: Production environment

## Local Development Deployment

### Step 1: Clone the repositories

```bash
git clone https://github.com/mentalspace/mentalspace-ehr.git
git clone https://github.com/mentalspace/mentalspace-ehr-frontend.git
git clone https://github.com/mentalspace/mentalspace-ehr-migrations.git
```

### Step 2: Install dependencies

```bash
# Backend
cd mentalspace-ehr
npm install

# Frontend
cd ../mentalspace-ehr-frontend
npm install

# Migrations
cd ../mentalspace-ehr-migrations
npm install
```

### Step 3: Configure environment variables

Copy the example environment files and update them with your local settings:

```bash
# Backend
cd mentalspace-ehr
cp .env.example .env.development

# Frontend
cd ../mentalspace-ehr-frontend
cp .env.example .env.development
```

### Step 4: Run database migrations

```bash
cd ../mentalspace-ehr-migrations
npm run typeorm:run
```

### Step 5: Start the development servers

```bash
# Backend
cd ../mentalspace-ehr
npm run dev

# Frontend (in a separate terminal)
cd ../mentalspace-ehr-frontend
npm run dev
```

## Docker Deployment

### Step 1: Configure environment variables

Create a `.env` file in the root directory with the necessary environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file to set the appropriate values for your environment.

### Step 2: Build and start the Docker containers

```bash
docker-compose up -d
```

This will start the following containers:
- PostgreSQL database
- Backend API
- Frontend application
- Migrations service
- Prometheus for metrics
- Grafana for visualization
- ELK stack for logging

### Step 3: Verify the deployment

- Backend API: http://localhost:5000/api/health
- Frontend: http://localhost:80
- Grafana: http://localhost:3000
- Kibana: http://localhost:5601
- Prometheus: http://localhost:9090

## Staging Deployment

### Step 1: Configure AWS infrastructure

1. Create an AWS account if you don't have one
2. Set up an EC2 instance with the following specifications:
   - Ubuntu 22.04 LTS
   - t3.large instance type (minimum)
   - 30GB SSD storage
   - Security group allowing ports 22, 80, 443, and 5000

3. Set up an RDS PostgreSQL instance:
   - PostgreSQL 14+
   - db.t3.medium instance type (minimum)
   - 50GB storage
   - Enable automated backups

4. Set up an S3 bucket for file storage:
   - Enable versioning
   - Configure lifecycle policies
   - Set up appropriate IAM permissions

### Step 2: Configure DNS

1. Create DNS records for your staging environment:
   - staging.mentalspace-ehr.com -> EC2 instance IP
   - api-staging.mentalspace-ehr.com -> EC2 instance IP

2. Set up SSL certificates using Let's Encrypt or AWS Certificate Manager

### Step 3: Deploy the application

1. SSH into the EC2 instance
2. Install Docker and Docker Compose
3. Clone the repositories
4. Configure environment variables for staging
5. Run the Docker Compose deployment:

```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

### Step 4: Set up monitoring and alerts

1. Configure Grafana alerts for critical metrics
2. Set up email notifications for system issues
3. Configure log retention policies

## Production Deployment

### Step 1: Set up AWS infrastructure

1. Create a VPC with public and private subnets
2. Set up an Auto Scaling Group for EC2 instances
3. Configure an Application Load Balancer
4. Set up an RDS PostgreSQL instance with Multi-AZ deployment
5. Configure S3 buckets for file storage and backups
6. Set up CloudFront for content delivery
7. Configure Route 53 for DNS management

### Step 2: Configure CI/CD pipeline

1. Set up GitHub Actions for automated deployment
2. Configure AWS credentials in GitHub Secrets
3. Set up deployment environments in GitHub

### Step 3: Deploy the application

1. Merge code to the main branch to trigger deployment
2. Monitor the CI/CD pipeline in GitHub Actions
3. Verify the deployment in AWS

### Step 4: Configure monitoring and alerts

1. Set up CloudWatch alarms for AWS resources
2. Configure Grafana alerts for application metrics
3. Set up PagerDuty or similar for on-call notifications

## Backup and Disaster Recovery

### Database Backups

1. Configure automated RDS snapshots
2. Set up point-in-time recovery
3. Implement logical backups using pg_dump

### Application Backups

1. Configure S3 versioning for file storage
2. Set up cross-region replication for S3 buckets
3. Implement regular backups of configuration files

### Disaster Recovery Plan

1. Document recovery procedures
2. Set up recovery time objectives (RTO) and recovery point objectives (RPO)
3. Conduct regular disaster recovery drills

## Security Considerations

### Network Security

1. Configure security groups to restrict access
2. Implement a Web Application Firewall (WAF)
3. Set up VPC flow logs for network monitoring

### Application Security

1. Ensure all communications use HTTPS
2. Implement proper authentication and authorization
3. Configure secure headers and CORS policies

### Compliance

1. Ensure HIPAA compliance for all deployments
2. Implement audit logging for all sensitive operations
3. Configure data encryption at rest and in transit

## Scaling Considerations

### Horizontal Scaling

1. Configure Auto Scaling Groups for EC2 instances
2. Implement stateless application design
3. Use Redis or similar for session management

### Database Scaling

1. Configure RDS read replicas for read-heavy workloads
2. Implement connection pooling
3. Consider database sharding for very large deployments

### Content Delivery

1. Use CloudFront for static asset delivery
2. Implement proper caching strategies
3. Configure CDN for global distribution

## Troubleshooting

### Common Issues

1. Database connection problems
   - Check security group settings
   - Verify database credentials
   - Check network connectivity

2. Application startup failures
   - Check environment variables
   - Verify file permissions
   - Check for port conflicts

3. Performance issues
   - Monitor resource utilization
   - Check database query performance
   - Analyze application logs

### Logging and Monitoring

1. Access application logs:
   ```bash
   docker-compose logs -f backend
   ```

2. Check database logs:
   ```bash
   docker-compose logs -f postgres
   ```

3. Monitor system metrics in Grafana

## Maintenance Procedures

### System Updates

1. Schedule regular maintenance windows
2. Implement blue-green deployments for zero downtime
3. Test updates in staging before production

### Database Maintenance

1. Schedule regular vacuum operations
2. Monitor and optimize slow queries
3. Implement index maintenance procedures

### Security Updates

1. Regularly update dependencies
2. Apply security patches promptly
3. Conduct regular security audits
