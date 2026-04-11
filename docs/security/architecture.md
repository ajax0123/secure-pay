# SecurePay 7-Layer Security Architecture

This architecture is opinionated for a Node.js + React + MongoDB fintech workload deployed on AWS.

## Recommended Stack
- Edge: CloudFront + AWS WAF + Shield Advanced
- API: ALB or API Gateway -> Node.js services (ECS/Fargate)
- Data: MongoDB Atlas (private endpoint)
- Identity: IAM Identity Center + IdP (Okta/Entra)
- Security Ops: CloudTrail + Security Hub + GuardDuty + OpenSearch SIEM + PagerDuty
- Secrets: AWS Secrets Manager + KMS

## Layered Architecture Diagram
```mermaid
flowchart TB
    U[Users and Mobile Clients]
    B[Botnets and Attackers]

    subgraph L2[Layer 2 Perimeter Security]
      CF[CloudFront CDN]
      WAF[AWS WAF Managed Rules and Bot Control]
      SH[Shield Advanced DDoS]
      GEO[Geo and ASN Filters]
    end

    subgraph L3[Layer 3 Network Security]
      ALB[ALB or API Gateway]
      APPNET[Private App Subnets]
      DATANET[Private Data Subnets]
      FW[AWS Network Firewall]
      ZTNA[ZTNA and VPN for Admin Access]
    end

    subgraph L6[Layer 6 Application Security]
      API[Node.js API Services]
      WEB[React Frontend Build]
      CI[CI Security Gates SAST DAST SCA Secrets]
      TEST[Security Unit and Integration Tests]
    end

    subgraph L4[Layer 4 IAM]
      SSO[SSO and MFA]
      RBAC[RBAC and Least Privilege]
      PAM[PAM and JIT Access]
      SA[Scoped Service Accounts]
    end

    subgraph L7[Layer 7 Data Security]
      DB[(MongoDB Atlas)]
      KMS[KMS Managed Keys and Rotation]
      VAULT[Secrets Manager]
      BK[Encrypted Backups and Restore Tests]
      DLP[DLP and Data Classification]
    end

    subgraph L1[Layer 1 Security Operations]
      SIEM[SIEM Correlation Rules]
      SOAR[SOAR Playbooks]
      IR[Incident Response]
      TI[Threat Intelligence Feeds]
      MET[KPIs MTTD MTTR Alert Precision]
    end

    U --> CF
    B --> CF
    CF --> WAF --> SH --> GEO --> ALB
    ALB --> APPNET --> API
    API --> DATANET --> DB
    API --> VAULT
    DB --> BK
    API --> KMS

    SSO --> RBAC --> PAM --> SA
    RBAC -.authorizes.-> API
    SA -.authorizes.-> DB

    CI --> API
    CI --> WEB
    TEST --> API

    CF -.logs.-> SIEM
    WAF -.logs.-> SIEM
    ALB -.logs.-> SIEM
    API -.audit events.-> SIEM
    DB -.audit logs.-> SIEM
    SIEM --> SOAR --> IR
    TI --> SIEM
    SIEM --> MET
```

## Layer Interaction Summary
- Layer 2 blocks volumetric and known-bad traffic before it reaches your app.
- Layer 3 limits lateral movement and enforces private-only east-west paths.
- Layer 4 controls who can do what, including admin break-glass access.
- Layer 6 prevents exploitable code from shipping and enforces runtime guardrails.
- Layer 7 keeps financial and identity data protected even if app controls fail.
- Layer 1 gives detection, triage, and automated response across all layers.

## Top 3 Attack Paths and Countermeasures
1. Account takeover and session abuse
- Controls: MFA, login throttling, bot defense, impossible-travel detection, JIT admin access.
2. API fraud automation on transfer endpoints
- Controls: WAF bot rules, route-level rate limits, fraud scoring, SIEM anomaly alerts.
3. Data exfiltration after foothold
- Controls: private network segmentation, least-privilege IAM, encryption at rest/in transit, DLP.
