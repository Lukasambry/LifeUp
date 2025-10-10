# Security Configuration

## JWT Secrets

**CRITICAL**: This application requires JWT secrets to be configured in environment variables. The application will **fail to start** if these are not set.

### Required Environment Variables

```bash
JWT_SECRET=<your-secret-key>
JWT_REFRESH_SECRET=<your-refresh-secret-key>
```

### Generating Secure Secrets

Use the following command to generate cryptographically secure secrets:

```bash
openssl rand -base64 32
```

### Configuration

#### For Docker (Recommended)

1. Create a `.env` file in the project root:

```bash
# PostgreSQL Database
POSTGRES_DB=lifeup
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# JWT Secrets (Generate with: openssl rand -base64 32)
JWT_SECRET=<paste-generated-secret-here>
JWT_REFRESH_SECRET=<paste-generated-secret-here>
```

2. The docker-compose files will automatically load these variables.

#### For Traditional npm Setup

Create `backend/.env`:

```bash
# Copy from backend/.env.example
cp backend/.env.example backend/.env

# Then edit backend/.env and replace the JWT secrets
JWT_SECRET=<paste-generated-secret-here>
JWT_REFRESH_SECRET=<paste-generated-secret-here>
```

### Security Features

The JWT Service implements the following security measures:

1. **Fail-Fast on Missing Secrets**: The application will throw an error and refuse to start if JWT secrets are not configured.

2. **No Fallback Values**: Unlike typical defaults, there are no fallback secrets. This prevents accidental deployment with insecure default keys.

3. **Constructor Validation**: Secrets are validated when the service is instantiated, providing immediate feedback.

4. **Module Initialization Check**: Additional verification occurs during module initialization to ensure secrets are valid.

### Error Messages

If secrets are missing, you'll see:

```
FATAL: Required environment variable JWT_SECRET is not set.
Please set it in your .env file or environment configuration.
```

This is intentional and indicates the application is properly secured.

## Additional Security Measures

### Input Sanitization

All user inputs are sanitized using DOMPurify to prevent XSS attacks:

- HTML tags are stripped from all text inputs
- Script tags and event handlers are removed
- Emails are normalized to lowercase

### Password Security

- Passwords are hashed using bcrypt with 10 salt rounds
- Minimum password length: 8 characters
- Password validation enforced via Zod schemas

### Authentication

- JWT access tokens expire after 15 minutes
- JWT refresh tokens expire after 7 days
- Tokens include user ID, email, role ID, and role type

### Authorization

- Role-based access control (RBAC) with 3 tiers
- 36 granular permissions across 10 resources
- Global guards enforce authentication and authorization

### Rate Limiting

Role-based request throttling:
- SUPER_ADMIN: 1000 requests/minute
- ADMIN_LIFEUP: 500 requests/minute
- CLIENT (premium): 200 requests/minute
- CLIENT (free): 100 requests/minute

### Activity Logging

All admin actions are automatically logged with:
- User ID
- Action performed
- Resource affected
- IP address
- User agent
- Timestamp

## Production Deployment

### Checklist

- [ ] Generate unique JWT secrets for production
- [ ] Store secrets in secure environment variable management (e.g., AWS Secrets Manager, Vault)
- [ ] Never commit `.env` files to version control
- [ ] Rotate JWT secrets periodically
- [ ] Monitor failed authentication attempts
- [ ] Enable HTTPS/TLS in production
- [ ] Configure proper CORS settings
- [ ] Review and adjust rate limits based on load
- [ ] Set up monitoring and alerting for security events
- [ ] Enable database encryption at rest
- [ ] Configure secure database credentials
- [ ] Set up regular security audits

### Environment-Specific Secrets

Each environment (development, staging, production) should have its own unique JWT secrets:

```bash
# Development
JWT_SECRET=dev_secret_...
JWT_REFRESH_SECRET=dev_refresh_...

# Staging
JWT_SECRET=staging_secret_...
JWT_REFRESH_SECRET=staging_refresh_...

# Production
JWT_SECRET=prod_secret_...
JWT_REFRESH_SECRET=prod_refresh_...
```

## Security Incident Response

If JWT secrets are compromised:

1. Generate new secrets immediately
2. Update environment variables
3. Restart all application instances
4. All existing tokens will be invalidated
5. Users will need to re-authenticate
6. Review access logs for suspicious activity
7. Document the incident
8. Update incident response procedures

## Reporting Security Issues

If you discover a security vulnerability, please email: [security contact]

Do NOT create a public GitHub issue for security vulnerabilities.
