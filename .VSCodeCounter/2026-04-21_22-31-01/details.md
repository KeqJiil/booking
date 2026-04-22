# Details

Date : 2026-04-21 22:31:01

Directory c:\\Users\\Andriisav\\Desktop\\portfolio projects\\booking

Total : 126 files,  23753 codes, 93 comments, 685 blanks, all 24531 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [README.md](/README.md) | Markdown | 0 | 0 | 1 | 1 |
| [backend/.dockerignore](/backend/.dockerignore) | Ignore | 11 | 0 | 3 | 14 |
| [backend/.prettierrc](/backend/.prettierrc) | JSON | 4 | 0 | 1 | 5 |
| [backend/Dockerfile](/backend/Dockerfile) | Docker | 7 | 0 | 0 | 7 |
| [backend/eslint.config.mjs](/backend/eslint.config.mjs) | JavaScript | 37 | 1 | 3 | 41 |
| [backend/jest.config.ts](/backend/jest.config.ts) | TypeScript | 12 | 0 | 1 | 13 |
| [backend/nest-cli.json](/backend/nest-cli.json) | JSON | 9 | 0 | 1 | 10 |
| [backend/package-lock.json](/backend/package-lock.json) | JSON | 16,356 | 0 | 1 | 16,357 |
| [backend/package.json](/backend/package.json) | JSON | 95 | 0 | 1 | 96 |
| [backend/prisma.config.ts](/backend/prisma.config.ts) | TypeScript | 11 | 2 | 2 | 15 |
| [backend/prisma/migrations/20260412172219\_init\_migration/migration.sql](/backend/prisma/migrations/20260412172219_init_migration/migration.sql) | MS SQL | 86 | 24 | 32 | 142 |
| [backend/prisma/migrations/20260418231805\_migration\_2/migration.sql](/backend/prisma/migrations/20260418231805_migration_2/migration.sql) | MS SQL | 74 | 56 | 41 | 171 |
| [backend/prisma/migrations/20260418231942\_add\_exclude\_constraint/migration.sql](/backend/prisma/migrations/20260418231942_add_exclude_constraint/migration.sql) | MS SQL | 8 | 2 | 2 | 12 |
| [backend/prisma/schema.prisma](/backend/prisma/schema.prisma) | Prisma | 173 | 3 | 72 | 248 |
| [backend/src/app.module.ts](/backend/src/app.module.ts) | TypeScript | 62 | 0 | 2 | 64 |
| [backend/src/common/constants/bookingStatuses.ts](/backend/src/common/constants/bookingStatuses.ts) | TypeScript | 16 | 0 | 5 | 21 |
| [backend/src/common/constants/roleLevels.ts](/backend/src/common/constants/roleLevels.ts) | TypeScript | 11 | 0 | 3 | 14 |
| [backend/src/common/decorators/accessInfo.decorator.ts](/backend/src/common/decorators/accessInfo.decorator.ts) | TypeScript | 9 | 0 | 2 | 11 |
| [backend/src/common/decorators/authorization.decorator.ts](/backend/src/common/decorators/authorization.decorator.ts) | TypeScript | 7 | 0 | 2 | 9 |
| [backend/src/common/decorators/cookies.decorator.ts](/backend/src/common/decorators/cookies.decorator.ts) | TypeScript | 8 | 0 | 2 | 10 |
| [backend/src/common/decorators/reqRole.decorator.ts](/backend/src/common/decorators/reqRole.decorator.ts) | TypeScript | 3 | 0 | 2 | 5 |
| [backend/src/common/events/globalCompleted.event.ts](/backend/src/common/events/globalCompleted.event.ts) | TypeScript | 7 | 0 | 1 | 8 |
| [backend/src/common/guards/MyAuthGuard.guard.ts](/backend/src/common/guards/MyAuthGuard.guard.ts) | TypeScript | 27 | 0 | 3 | 30 |
| [backend/src/database/prisma.module.ts](/backend/src/database/prisma.module.ts) | TypeScript | 8 | 0 | 2 | 10 |
| [backend/src/database/prisma.service.ts](/backend/src/database/prisma.service.ts) | TypeScript | 12 | 0 | 2 | 14 |
| [backend/src/main.ts](/backend/src/main.ts) | TypeScript | 12 | 0 | 5 | 17 |
| [backend/src/modules/auth/auth.controller.ts](/backend/src/modules/auth/auth.controller.ts) | TypeScript | 56 | 0 | 6 | 62 |
| [backend/src/modules/auth/auth.module.ts](/backend/src/modules/auth/auth.module.ts) | TypeScript | 23 | 0 | 2 | 25 |
| [backend/src/modules/auth/auth.service.ts](/backend/src/modules/auth/auth.service.ts) | TypeScript | 127 | 0 | 13 | 140 |
| [backend/src/modules/auth/dto/login.dto.ts](/backend/src/modules/auth/dto/login.dto.ts) | TypeScript | 8 | 0 | 3 | 11 |
| [backend/src/modules/auth/dto/register.dto.ts](/backend/src/modules/auth/dto/register.dto.ts) | TypeScript | 18 | 0 | 4 | 22 |
| [backend/src/modules/auth/spec/auth.service.spec.ts](/backend/src/modules/auth/spec/auth.service.spec.ts) | TypeScript | 152 | 0 | 35 | 187 |
| [backend/src/modules/auth/strategies/jwt.strategy.ts](/backend/src/modules/auth/strategies/jwt.strategy.ts) | TypeScript | 23 | 0 | 3 | 26 |
| [backend/src/modules/auth/types.ts](/backend/src/modules/auth/types.ts) | TypeScript | 16 | 0 | 4 | 20 |
| [backend/src/modules/booking/application/commands/booking.commands.ts](/backend/src/modules/booking/application/commands/booking.commands.ts) | TypeScript | 34 | 0 | 8 | 42 |
| [backend/src/modules/booking/application/commands/cancel-status.handler.ts](/backend/src/modules/booking/application/commands/cancel-status.handler.ts) | TypeScript | 21 | 0 | 3 | 24 |
| [backend/src/modules/booking/application/commands/complete-status.handler.ts](/backend/src/modules/booking/application/commands/complete-status.handler.ts) | TypeScript | 22 | 0 | 4 | 26 |
| [backend/src/modules/booking/application/commands/confirm-status.handler.ts](/backend/src/modules/booking/application/commands/confirm-status.handler.ts) | TypeScript | 21 | 0 | 3 | 24 |
| [backend/src/modules/booking/application/commands/create-booking.handler.ts](/backend/src/modules/booking/application/commands/create-booking.handler.ts) | TypeScript | 39 | 0 | 3 | 42 |
| [backend/src/modules/booking/application/commands/expire-status.handler.ts](/backend/src/modules/booking/application/commands/expire-status.handler.ts) | TypeScript | 21 | 0 | 3 | 24 |
| [backend/src/modules/booking/application/commands/pay-status.handler.ts](/backend/src/modules/booking/application/commands/pay-status.handler.ts) | TypeScript | 21 | 0 | 3 | 24 |
| [backend/src/modules/booking/application/commands/reject-status.handler.ts](/backend/src/modules/booking/application/commands/reject-status.handler.ts) | TypeScript | 21 | 0 | 3 | 24 |
| [backend/src/modules/booking/application/dto/create-booking.dto.ts](/backend/src/modules/booking/application/dto/create-booking.dto.ts) | TypeScript | 19 | 0 | 6 | 25 |
| [backend/src/modules/booking/application/dto/searchParams.dto.ts](/backend/src/modules/booking/application/dto/searchParams.dto.ts) | TypeScript | 31 | 0 | 7 | 38 |
| [backend/src/modules/booking/application/events/completedEvent.handler.ts](/backend/src/modules/booking/application/events/completedEvent.handler.ts) | TypeScript | 16 | 0 | 3 | 19 |
| [backend/src/modules/booking/application/interfaces.ts/TransactionRepo.interface.ts](/backend/src/modules/booking/application/interfaces.ts/TransactionRepo.interface.ts) | TypeScript | 15 | 0 | 2 | 17 |
| [backend/src/modules/booking/application/mappers/booking.mapper.ts](/backend/src/modules/booking/application/mappers/booking.mapper.ts) | TypeScript | 10 | 0 | 2 | 12 |
| [backend/src/modules/booking/application/queries/booking.query.ts](/backend/src/modules/booking/application/queries/booking.query.ts) | TypeScript | 16 | 0 | 4 | 20 |
| [backend/src/modules/booking/application/queries/getBookingById.query.ts](/backend/src/modules/booking/application/queries/getBookingById.query.ts) | TypeScript | 16 | 0 | 3 | 19 |
| [backend/src/modules/booking/application/queries/getBookingsByProperty.query.ts](/backend/src/modules/booking/application/queries/getBookingsByProperty.query.ts) | TypeScript | 19 | 0 | 3 | 22 |
| [backend/src/modules/booking/application/queries/getMyBookings.query.ts](/backend/src/modules/booking/application/queries/getMyBookings.query.ts) | TypeScript | 16 | 0 | 3 | 19 |
| [backend/src/modules/booking/booking.controller.ts](/backend/src/modules/booking/booking.controller.ts) | TypeScript | 87 | 0 | 10 | 97 |
| [backend/src/modules/booking/booking.module.ts](/backend/src/modules/booking/booking.module.ts) | TypeScript | 36 | 0 | 2 | 38 |
| [backend/src/modules/booking/domain/entities/booking.entity.ts](/backend/src/modules/booking/domain/entities/booking.entity.ts) | TypeScript | 128 | 0 | 19 | 147 |
| [backend/src/modules/booking/domain/events/booking.events.ts](/backend/src/modules/booking/domain/events/booking.events.ts) | TypeScript | 22 | 0 | 4 | 26 |
| [backend/src/modules/booking/domain/repo-interfaces/IBookingRepo.interface.ts](/backend/src/modules/booking/domain/repo-interfaces/IBookingRepo.interface.ts) | TypeScript | 52 | 0 | 7 | 59 |
| [backend/src/modules/booking/domain/value-objects/domainDate.ts](/backend/src/modules/booking/domain/value-objects/domainDate.ts) | TypeScript | 12 | 0 | 2 | 14 |
| [backend/src/modules/booking/infrastructure/bullmq/expired.worker.ts](/backend/src/modules/booking/infrastructure/bullmq/expired.worker.ts) | TypeScript | 13 | 0 | 3 | 16 |
| [backend/src/modules/booking/infrastructure/repo/PrismaBooking.repository.ts](/backend/src/modules/booking/infrastructure/repo/PrismaBooking.repository.ts) | TypeScript | 107 | 0 | 8 | 115 |
| [backend/src/modules/booking/infrastructure/repo/PrismaBooking.select.ts](/backend/src/modules/booking/infrastructure/repo/PrismaBooking.select.ts) | TypeScript | 12 | 0 | 2 | 14 |
| [backend/src/modules/booking/infrastructure/repo/PrismaBookingQuery.repository.ts](/backend/src/modules/booking/infrastructure/repo/PrismaBookingQuery.repository.ts) | TypeScript | 89 | 0 | 5 | 94 |
| [backend/src/modules/booking/infrastructure/repo/Transaction.repository.ts](/backend/src/modules/booking/infrastructure/repo/Transaction.repository.ts) | TypeScript | 18 | 0 | 3 | 21 |
| [backend/src/modules/booking/infrastructure/scheduller/complete-statuses.ts](/backend/src/modules/booking/infrastructure/scheduller/complete-statuses.ts) | TypeScript | 23 | 0 | 4 | 27 |
| [backend/src/modules/booking/spec/bookingDomain.spec.ts](/backend/src/modules/booking/spec/bookingDomain.spec.ts) | TypeScript | 50 | 0 | 8 | 58 |
| [backend/src/modules/propertyType/application/dto/propertyType.dto.ts](/backend/src/modules/propertyType/application/dto/propertyType.dto.ts) | TypeScript | 7 | 0 | 2 | 9 |
| [backend/src/modules/propertyType/application/propertyType.service.ts](/backend/src/modules/propertyType/application/propertyType.service.ts) | TypeScript | 35 | 0 | 8 | 43 |
| [backend/src/modules/propertyType/domain/repo-interface/IPropertyTypeRepo.interface.ts](/backend/src/modules/propertyType/domain/repo-interface/IPropertyTypeRepo.interface.ts) | TypeScript | 11 | 0 | 2 | 13 |
| [backend/src/modules/propertyType/infrastructure/repo/PrismaPropertyType.repository.ts](/backend/src/modules/propertyType/infrastructure/repo/PrismaPropertyType.repository.ts) | TypeScript | 44 | 0 | 7 | 51 |
| [backend/src/modules/propertyType/propertyType.controller.ts](/backend/src/modules/propertyType/propertyType.controller.ts) | TypeScript | 53 | 0 | 8 | 61 |
| [backend/src/modules/propertyType/propertyType.module.ts](/backend/src/modules/propertyType/propertyType.module.ts) | TypeScript | 14 | 0 | 2 | 16 |
| [backend/src/modules/propertyType/spec/propertyType.service.spec.ts](/backend/src/modules/propertyType/spec/propertyType.service.spec.ts) | TypeScript | 92 | 0 | 25 | 117 |
| [backend/src/modules/property/application/commands/create-property.handler.ts](/backend/src/modules/property/application/commands/create-property.handler.ts) | TypeScript | 26 | 0 | 3 | 29 |
| [backend/src/modules/property/application/commands/delete-property.handler.ts](/backend/src/modules/property/application/commands/delete-property.handler.ts) | TypeScript | 23 | 0 | 3 | 26 |
| [backend/src/modules/property/application/commands/edit-property.handler.ts](/backend/src/modules/property/application/commands/edit-property.handler.ts) | TypeScript | 21 | 0 | 3 | 24 |
| [backend/src/modules/property/application/commands/property.commands.ts](/backend/src/modules/property/application/commands/property.commands.ts) | TypeScript | 22 | 0 | 5 | 27 |
| [backend/src/modules/property/application/dto/changeProperty.dto.ts](/backend/src/modules/property/application/dto/changeProperty.dto.ts) | TypeScript | 36 | 0 | 7 | 43 |
| [backend/src/modules/property/application/dto/createProperty.dto.ts](/backend/src/modules/property/application/dto/createProperty.dto.ts) | TypeScript | 38 | 0 | 8 | 46 |
| [backend/src/modules/property/application/dto/newAddress.dto.ts](/backend/src/modules/property/application/dto/newAddress.dto.ts) | TypeScript | 12 | 0 | 4 | 16 |
| [backend/src/modules/property/application/dto/searchParams.dto.ts](/backend/src/modules/property/application/dto/searchParams.dto.ts) | TypeScript | 56 | 0 | 12 | 68 |
| [backend/src/modules/property/application/mappers/property.mapper.ts](/backend/src/modules/property/application/mappers/property.mapper.ts) | TypeScript | 21 | 0 | 3 | 24 |
| [backend/src/modules/property/application/queries/find-properties.handler.ts](/backend/src/modules/property/application/queries/find-properties.handler.ts) | TypeScript | 13 | 0 | 3 | 16 |
| [backend/src/modules/property/application/queries/find-property.handler.ts](/backend/src/modules/property/application/queries/find-property.handler.ts) | TypeScript | 13 | 0 | 3 | 16 |
| [backend/src/modules/property/application/queries/property.queries.ts](/backend/src/modules/property/application/queries/property.queries.ts) | TypeScript | 7 | 0 | 3 | 10 |
| [backend/src/modules/property/domain/entities/Property.entity.ts](/backend/src/modules/property/domain/entities/Property.entity.ts) | TypeScript | 117 | 0 | 20 | 137 |
| [backend/src/modules/property/domain/events/property.events.ts](/backend/src/modules/property/domain/events/property.events.ts) | TypeScript | 27 | 0 | 5 | 32 |
| [backend/src/modules/property/domain/repo-interface/IPropertyRepo.interface.ts](/backend/src/modules/property/domain/repo-interface/IPropertyRepo.interface.ts) | TypeScript | 40 | 0 | 7 | 47 |
| [backend/src/modules/property/domain/value-objects/address.value.ts](/backend/src/modules/property/domain/value-objects/address.value.ts) | TypeScript | 9 | 0 | 1 | 10 |
| [backend/src/modules/property/infrastructure/repo/PrismaProperty.repository.ts](/backend/src/modules/property/infrastructure/repo/PrismaProperty.repository.ts) | TypeScript | 77 | 0 | 5 | 82 |
| [backend/src/modules/property/infrastructure/repo/PrismaPropertyQuery.repository.ts](/backend/src/modules/property/infrastructure/repo/PrismaPropertyQuery.repository.ts) | TypeScript | 73 | 0 | 4 | 77 |
| [backend/src/modules/property/infrastructure/repo/prisma.property.select.ts](/backend/src/modules/property/infrastructure/repo/prisma.property.select.ts) | TypeScript | 26 | 0 | 3 | 29 |
| [backend/src/modules/property/property.controller.ts](/backend/src/modules/property/property.controller.ts) | TypeScript | 80 | 0 | 7 | 87 |
| [backend/src/modules/property/property.module.ts](/backend/src/modules/property/property.module.ts) | TypeScript | 24 | 0 | 2 | 26 |
| [backend/src/modules/property/spec/propertyDomain.spec.ts](/backend/src/modules/property/spec/propertyDomain.spec.ts) | TypeScript | 34 | 0 | 6 | 40 |
| [backend/src/modules/review/application/dto/changeReview.dto.ts](/backend/src/modules/review/application/dto/changeReview.dto.ts) | TypeScript | 22 | 0 | 4 | 26 |
| [backend/src/modules/review/application/dto/createReview.dto.ts](/backend/src/modules/review/application/dto/createReview.dto.ts) | TypeScript | 22 | 0 | 4 | 26 |
| [backend/src/modules/review/application/handlers/completedEvent.handler.ts](/backend/src/modules/review/application/handlers/completedEvent.handler.ts) | TypeScript | 20 | 0 | 3 | 23 |
| [backend/src/modules/review/application/review.service.ts](/backend/src/modules/review/application/review.service.ts) | TypeScript | 41 | 0 | 8 | 49 |
| [backend/src/modules/review/domain/interfaces/repo.interface.ts](/backend/src/modules/review/domain/interfaces/repo.interface.ts) | TypeScript | 12 | 0 | 2 | 14 |
| [backend/src/modules/review/domain/interfaces/review.interfaces.ts](/backend/src/modules/review/domain/interfaces/review.interfaces.ts) | TypeScript | 20 | 0 | 4 | 24 |
| [backend/src/modules/review/infrastructure/repo/IReview.repository.ts](/backend/src/modules/review/infrastructure/repo/IReview.repository.ts) | TypeScript | 49 | 0 | 7 | 56 |
| [backend/src/modules/review/review.controller.ts](/backend/src/modules/review/review.controller.ts) | TypeScript | 6 | 0 | 2 | 8 |
| [backend/src/modules/review/review.module.ts](/backend/src/modules/review/review.module.ts) | TypeScript | 12 | 0 | 2 | 14 |
| [backend/src/modules/user/dto/password.dto.ts](/backend/src/modules/user/dto/password.dto.ts) | TypeScript | 10 | 0 | 3 | 13 |
| [backend/src/modules/user/dto/settings.dto.ts](/backend/src/modules/user/dto/settings.dto.ts) | TypeScript | 10 | 0 | 3 | 13 |
| [backend/src/modules/user/spec/user.service.spec.ts](/backend/src/modules/user/spec/user.service.spec.ts) | TypeScript | 94 | 0 | 20 | 114 |
| [backend/src/modules/user/user.controller.ts](/backend/src/modules/user/user.controller.ts) | TypeScript | 67 | 0 | 9 | 76 |
| [backend/src/modules/user/user.module.ts](/backend/src/modules/user/user.module.ts) | TypeScript | 10 | 0 | 2 | 12 |
| [backend/src/modules/user/user.service.ts](/backend/src/modules/user/user.service.ts) | TypeScript | 81 | 0 | 8 | 89 |
| [backend/tsconfig.build.json](/backend/tsconfig.build.json) | JSON | 4 | 0 | 1 | 5 |
| [backend/tsconfig.json](/backend/tsconfig.json) | JSON with Comments | 26 | 0 | 1 | 27 |
| [docker-compose.yml](/docker-compose.yml) | YAML | 69 | 0 | 5 | 74 |
| [frontend/.dockerignore](/frontend/.dockerignore) | Ignore | 11 | 0 | 3 | 14 |
| [frontend/Dockerfile](/frontend/Dockerfile) | Docker | 6 | 0 | 0 | 6 |
| [frontend/eslint.config.js](/frontend/eslint.config.js) | JavaScript JSX | 22 | 0 | 2 | 24 |
| [frontend/index.html](/frontend/index.html) | HTML | 13 | 0 | 1 | 14 |
| [frontend/package-lock.json](/frontend/package-lock.json) | JSON | 3,443 | 0 | 1 | 3,444 |
| [frontend/package.json](/frontend/package.json) | JSON | 43 | 0 | 1 | 44 |
| [frontend/public/favicon.svg](/frontend/public/favicon.svg) | XML | 1 | 0 | 0 | 1 |
| [frontend/public/icons.svg](/frontend/public/icons.svg) | XML | 24 | 0 | 1 | 25 |
| [frontend/src/App.tsx](/frontend/src/App.tsx) | TypeScript JSX | 7 | 0 | 3 | 10 |
| [frontend/src/index.css](/frontend/src/index.css) | PostCSS | 0 | 0 | 1 | 1 |
| [frontend/src/main.tsx](/frontend/src/main.tsx) | TypeScript JSX | 9 | 0 | 2 | 11 |
| [frontend/tsconfig.app.json](/frontend/tsconfig.app.json) | JSON | 21 | 2 | 3 | 26 |
| [frontend/tsconfig.json](/frontend/tsconfig.json) | JSON with Comments | 7 | 0 | 1 | 8 |
| [frontend/tsconfig.node.json](/frontend/tsconfig.node.json) | JSON | 20 | 2 | 3 | 25 |
| [frontend/vite.config.ts](/frontend/vite.config.ts) | TypeScript | 5 | 1 | 2 | 8 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)