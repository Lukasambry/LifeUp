# Architecture Overview

## Onion Architecture - Backend

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│         (Controllers, Pipes, Filters, Guards)           │
│                src/presentation/                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTP Requests/Responses
                       ▼
┌─────────────────────────────────────────────────────────┐
│               Infrastructure Layer                       │
│     (Prisma, Repositories, Database, Modules)           │
│              src/infrastructure/                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Implements Interfaces
                       ▼
┌─────────────────────────────────────────────────────────┐
│                Application Layer                         │
│          (Use Cases, DTOs, Services)                    │
│               src/application/                           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Uses Entities
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Domain Layer                           │
│      (Entities, Value Objects, Repository Interfaces)   │
│                   src/domain/                            │
│              (PURE BUSINESS LOGIC)                       │
└─────────────────────────────────────────────────────────┘
```

## Data Flow Example: Create User

### Request Flow (Inward):
```
1. HTTP POST /api/users
   ↓
2. UserController (@presentation/controllers/user.controller.ts)
   - Validates input with ZodValidationPipe
   ↓
3. CreateUserUseCase (@application/use-cases/create-user.use-case.ts)
   - Business logic orchestration
   - Creates User entity
   ↓
4. IUserRepository Interface (@domain/repositories/user.repository.interface.ts)
   - Defines contract
   ↓
5. UserRepository (@infrastructure/repositories/user.repository.ts)
   - Implements interface
   - Persists via Prisma
   ↓
6. PostgreSQL Database
```

### Response Flow (Outward):
```
6. Database returns data
   ↓
5. UserRepository transforms to Domain Entity
   ↓
4. Returns User entity
   ↓
3. CreateUserUseCase returns UserResponseDto
   ↓
2. UserController returns JSON
   ↓
1. HTTP 201 Created
```

## Layer Responsibilities

### Domain Layer
**What it does:**
- Defines core business entities (User, Product, etc.)
- Contains business rules and validation
- Defines repository interfaces

**What it CANNOT do:**
- Depend on any other layer
- Know about HTTP, database, or framework
- Import NestJS decorators

**Example:**
```typescript
// ✅ Good - Pure business logic
export class User extends BaseEntity<string> {
  public updateEmail(email: string): void {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email');
    }
    this._email = email;
    this.touch();
  }
}

// ❌ Bad - Infrastructure concern
export class User {
  @PrimaryKey()
  id: string; // Don't use ORM decorators here
}
```

### Application Layer
**What it does:**
- Orchestrates use cases
- Defines DTOs with Zod schemas
- Coordinates between entities

**What it CANNOT do:**
- Know about HTTP/controllers
- Know about database implementation
- Import infrastructure code

**Example:**
```typescript
// ✅ Good - Pure use case
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    const user = User.create({ ... });
    const saved = await this.userRepository.create(user);
    return this.toDto(saved);
  }
}
```

### Infrastructure Layer
**What it does:**
- Implements repository interfaces
- Handles database operations with Prisma
- Wires dependencies in NestJS modules

**Example:**
```typescript
// ✅ Good - Implements domain interface
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({ ... });
    return this.toDomain(created);
  }
}
```

### Presentation Layer
**What it does:**
- Handles HTTP requests/responses
- Validates input with Zod
- Returns JSON responses

**Example:**
```typescript
// ✅ Good - Thin controller
@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(dto);
  }
}
```

## Dependency Injection

NestJS modules wire everything together:

```typescript
@Module({
  controllers: [UserController],           // Presentation
  providers: [
    {
      provide: USER_REPOSITORY,            // Interface token
      useClass: UserRepository,            // Infrastructure implementation
    },
    CreateUserUseCase,                     // Application
    GetUserUseCase,
    ListUsersUseCase,
  ],
})
export class UserModule {}
```

## Validation Flow

1. **Presentation Layer**: ZodValidationPipe validates HTTP input
2. **Application Layer**: Zod schemas define DTO structure
3. **Domain Layer**: Entity methods validate business rules
4. **Database Layer**: Prisma schema enforces constraints

## Frontend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
│                      (app/)                              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Uses Components
                       ▼
┌─────────────────────────────────────────────────────────┐
│              React Components                            │
│         (components/ + components/ui/)                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Calls API
                       ▼
┌─────────────────────────────────────────────────────────┐
│                 API Client                               │
│            (lib/api-client.ts)                          │
│              Type-safe HTTP calls                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTP Requests
                       ▼
                   Backend API
```

## Key Principles

1. **Dependency Inversion**: Inner layers define interfaces, outer layers implement them
2. **Separation of Concerns**: Each layer has a single responsibility
3. **Testability**: Pure business logic is easy to unit test
4. **Maintainability**: Changes in one layer don't cascade
5. **Framework Independence**: Domain logic works with any framework

## Common Mistakes to Avoid

❌ **DON'T:**
- Import infrastructure code in domain layer
- Put business logic in controllers
- Mix Prisma models with domain entities
- Skip use cases and put logic directly in controllers

✅ **DO:**
- Keep domain layer pure and framework-agnostic
- Use dependency injection via interfaces
- Create one use case per business operation
- Transform between layers (Prisma → Domain → DTO)
