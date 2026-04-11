# Terraform Security Implementation Checklist

Use this checklist to implement all 7 defense layers in infrastructure-as-code.

## Recommended Module Order
1. `org-security` (CloudTrail, Security Hub, GuardDuty, central logging)
2. `edge-security` (CloudFront, WAF, Shield, geo rules)
3. `network-security` (VPC, subnets, SG, NACL, Network Firewall)
4. `iam-security` (SSO integration, IAM roles/policies, permission boundaries)
5. `endpoint-security-integration` (SSM, device posture integration hooks)
6. `app-security` (ALB/API Gateway, TLS policies, route throttling, runtime headers)
7. `data-security` (KMS, Secrets Manager, DB private networking, backup policies)

## Layer-by-Layer Terraform Checklist

### Layer 1 - Security Operations
- [ ] Enable org-wide CloudTrail in all regions.
- [ ] Ship CloudTrail, WAF, ALB, VPC Flow logs to central log account.
- [ ] Enable Security Hub and GuardDuty in all accounts.
- [ ] Create EventBridge rules for high-severity findings.
- [ ] Create PagerDuty/Slack integrations for incident alerting.
- [ ] Define metrics dashboards: MTTD, MTTR, alert precision.

Resources to use
- `aws_cloudtrail`
- `aws_securityhub_account`
- `aws_guardduty_detector`
- `aws_cloudwatch_log_group`
- `aws_cloudwatch_metric_alarm`
- `aws_cloudwatch_event_rule`, `aws_cloudwatch_event_target`

### Layer 2 - Perimeter Security
- [ ] Deploy CloudFront in front of frontend and API domains.
- [ ] Attach AWS WAF web ACL with managed rule groups and rate-based rules.
- [ ] Add bot control and CAPTCHA for login/transfer paths.
- [ ] Enable geo and ASN restrictions for non-business regions.
- [ ] Configure Shield Advanced for protected resources.

Resources to use
- `aws_cloudfront_distribution`
- `aws_wafv2_web_acl`
- `aws_wafv2_web_acl_association`
- `aws_wafv2_ip_set`
- `aws_shield_protection`

### Layer 3 - Network Security
- [ ] Build segmented VPC: edge/public, app/private, data/private.
- [ ] Restrict DB inbound to app security groups only.
- [ ] Disable direct internet exposure for app and data subnets.
- [ ] Add egress control via Network Firewall and NAT egress policies.
- [ ] Enforce admin access via VPN/ZTNA path only.

Resources to use
- `aws_vpc`, `aws_subnet`, `aws_route_table`
- `aws_security_group`, `aws_network_acl`
- `aws_networkfirewall_firewall`
- `aws_vpc_endpoint`
- `aws_client_vpn_endpoint`

### Layer 4 - IAM
- [ ] Enforce MFA and SSO for all human identities.
- [ ] Use least-privilege IAM roles for workloads.
- [ ] Remove long-lived access keys from users.
- [ ] Add permission boundaries for admin/developer roles.
- [ ] Implement break-glass role with approval and short session duration.

Resources to use
- `aws_iam_role`, `aws_iam_policy`, `aws_iam_role_policy_attachment`
- `aws_iam_account_password_policy`
- `aws_ssoadmin_permission_set` (if using IAM Identity Center)

### Layer 5 - Endpoint Security
- [ ] Use SSM for host patch baselines and compliance reporting.
- [ ] Enforce endpoint posture checks for admin access.
- [ ] Restrict SSH; prefer SSM Session Manager.
- [ ] Record endpoint compliance metrics in CloudWatch.

Resources to use
- `aws_ssm_patch_baseline`
- `aws_ssm_association`
- `aws_ssm_document`

### Layer 6 - Application Security
- [ ] Enforce TLS 1.2+ listener policies.
- [ ] Apply ALB/API throttling and WAF route protections.
- [ ] Add security headers policy.
- [ ] Enable CI policy gates (SAST, SCA, secrets, DAST).
- [ ] Block deployment if critical findings exist.

Resources to use
- `aws_lb`, `aws_lb_listener`, `aws_lb_listener_rule`
- `aws_wafv2_web_acl` (with path rules)
- `aws_ecr_repository` with scanning enabled

### Layer 7 - Data Security
- [ ] Enable encryption at rest for data stores and backups.
- [ ] Store all app secrets in Secrets Manager.
- [ ] Rotate KMS keys and secrets on policy schedule.
- [ ] Enforce TLS to DB endpoints.
- [ ] Define data classification tags and retention policy.

Resources to use
- `aws_kms_key`, `aws_kms_alias`
- `aws_secretsmanager_secret`, `aws_secretsmanager_secret_version`
- `aws_backup_vault`, `aws_backup_plan`, `aws_backup_selection`

## Security KPIs To Track
- Layer 1: MTTD, MTTR, high-severity alert false positive rate.
- Layer 2: blocked malicious requests/day, bot challenge pass/fail.
- Layer 3: blocked lateral movement attempts, exposed service count.
- Layer 4: MFA coverage, over-privileged role count.
- Layer 5: endpoint patch compliance SLA.
- Layer 6: critical vulns reaching main branch.
- Layer 7: key rotation compliance, backup restore success rate.

## Common Misconfigurations To Avoid
- Flat VPC networks with broad security groups.
- WAF attached to frontend but not API.
- IAM wildcard permissions on production roles.
- Secrets in Terraform variables or plain env files.
- Logging enabled but never correlated in SIEM.
