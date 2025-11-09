# CRM Platform

A modern, scalable Customer Relationship Management (CRM) platform built with the MERN stack (MongoDB replaced with PostgreSQL), designed for fast-scaling startups that need real-time insights, automated follow-ups, and collaborative workflows.

## Features

### ✅ Core Features

- **Authentication & Role Management** - JWT-based authentication with role-based access control (Admin, Manager, Sales Executive)
- **Lead Management** - Complete CRUD operations for leads with ownership tracking and history trail
- **Activity Timeline** - Detailed log of notes, calls, meetings, and status changes per lead
- **Email & Notification System** - Real-time WebSocket notifications and automated email triggers
- **Dashboard & Analytics** - Visualize performance metrics using Recharts
- **Real-time Updates** - Socket.io integration for live updates across the platform

### 🎯 Key Capabilities

- **Role-Based Access Control**: Different permissions for Admin, Manager, and Sales Executive roles
- **Real-time Notifications**: WebSocket-based notifications for lead assignments, status changes, and activities
- **Activity Tracking**: Comprehensive activity timeline for each lead
- **Lead History**: Complete audit trail of all status changes and ownership transfers
- **Dashboard Analytics**: Visual charts showing lead status distribution and activity types
- **Email Integration**: Automated email notifications for important events

## Tech Stack

### Backend

- **Node.js** + **Express** - RESTful API server
- **PostgreSQL** - Relational database
- **Prisma** - Modern ORM for database management
- **Socket.io** - Real-time WebSocket communication
- **JWT** + **Bcrypt** - Authentication and password hashing
- **TypeScript** - Type-safe development

### Frontend

- **React** - UI library
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Socket.io Client** - Real-time updates
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe development

### Deployment

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy for frontend

## Project Structure

```
crm/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Auth, error handling
│   ├── routes/           # API routes
│   ├── services/         # Business logic (email, notifications)
│   ├── prisma/           # Database schema
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilities (JWT, logger, errors)
│   └── __tests__/        # Test files
├── frontend/
│   ├── src/
│   │   ├── api/          # API client functions
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store and slices
│   │   └── utils/        # Utilities (Socket client)
│   └── public/           # Static assets
└── docker-compose.yml    # Docker configuration
```

## Database Schema (ER Diagram)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │         │     Lead     │         │  Activity   │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │◄──┐     │ id (PK)      │◄──┐     │ id (PK)     │
│ email       │   │     │ title        │   │     │ leadId (FK) │
│ name        │   │     │ company      │   │     │ type        │
│ password    │   │     │ email        │   │     │ note        │
│ role        │   │     │ phone        │   │     │ meta        │
│ createdAt   │   │     │ status       │   │     │ createdBy   │
└─────────────┘   │     │ ownerId (FK) │   │     │ createdAt   │
                  │     │ createdAt    │   │     └─────────────┘
                  │     │ updatedAt    │   │
┌─────────────┐   │     └──────────────┘   │
│Notification │   │                        │
├─────────────┤   │     ┌──────────────┐   │
│ id (PK)     │   │     │ LeadHistory  │   │
│ userId (FK) │   │     ├──────────────┤   │
│ title       │   │     │ id (PK)      │   │
│ message     │   │     │ leadId (FK)  │───┘
│ type        │   │     │ from         │
│ read        │   │     │ to           │
│ createdAt   │   │     │ changedBy    │
└─────────────┘   │     │ createdAt    │
                  │     └──────────────┘
                  │
                  └──────────────────────┐
                                         │
                            (One-to-Many relationships)
```

### Relationships

- **User ↔ Lead**: One-to-Many (User owns multiple Leads)
- **Lead ↔ Activity**: One-to-Many (Lead has multiple Activities)
- **Lead ↔ LeadHistory**: One-to-Many (Lead has multiple history entries)
- **User ↔ Activity**: One-to-Many (User creates multiple Activities)
- **User ↔ Notification**: One-to-Many (User receives multiple Notifications)
- **User ↔ LeadHistory**: One-to-Many (User makes multiple history changes)

## API Documentation

### Authentication Endpoints

#### Register

```
POST /api/v1/auth/register
Body: {
  email: string,
  name: string,
  password: string,
  role?: 'ADMIN' | 'MANAGER' | 'SALES_EXEC'
}
```

#### Login

```
POST /api/v1/auth/login
Body: {
  email: string,
  password: string
}
```

#### Get Current User

```
GET /api/v1/auth/me
Headers: Authorization: Bearer <token>
```

### Lead Endpoints

#### Get All Leads

```
GET /api/v1/leads?status=NEW&ownerId=1&page=1&limit=10
Headers: Authorization: Bearer <token>
```

#### Get Lead by ID

```
GET /api/v1/leads/:id
Headers: Authorization: Bearer <token>
```

#### Create Lead

```
POST /api/v1/leads
Headers: Authorization: Bearer <token>
Body: {
  title: string,
  company?: string,
  email?: string,
  phone?: string,
  status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST',
  ownerId?: number
}
```

#### Update Lead

```
PUT /api/v1/leads/:id
Headers: Authorization: Bearer <token>
Body: {
  title?: string,
  company?: string,
  email?: string,
  phone?: string,
  status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST',
  ownerId?: number
}
```

#### Delete Lead

```
DELETE /api/v1/leads/:id
Headers: Authorization: Bearer <token>
(Admin/Manager only)
```

### Activity Endpoints

#### Get Activities

```
GET /api/v1/activities?leadId=1
Headers: Authorization: Bearer <token>
```

#### Create Activity

```
POST /api/v1/activities
Headers: Authorization: Bearer <token>
Body: {
  leadId: number,
  type: 'NOTE' | 'CALL' | 'MEETING' | 'EMAIL' | 'STATUS_CHANGE',
  note?: string,
  meta?: object
}
```

### Notification Endpoints

#### Get Notifications

```
GET /api/v1/notifications?read=false
Headers: Authorization: Bearer <token>
```

#### Mark Notification as Read

```
PUT /api/v1/notifications/:id/read
Headers: Authorization: Bearer <token>
```

#### Mark All as Read

```
PUT /api/v1/notifications/read-all
Headers: Authorization: Bearer <token>
```

### Dashboard Endpoints

#### Get Dashboard Stats

```
GET /api/v1/dashboard/stats
Headers: Authorization: Bearer <token>
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker and Docker Compose (optional, for containerized deployment)

### Local Development Setup

#### 1. Clone the repository

```bash
git clone <repository-url>
cd crm
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

### Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

## Testing

### Backend Tests

```bash
cd backend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage

- Authentication controller tests
- More tests can be added following the same pattern

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/crm_db
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
EMAIL=abc@gmail.com
EMAIL_PASSWORD=jyijjftnkvhxkofkj
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

## Role-Based Access Control

### Admin

- Full access to all features
- Can create, read, update, and delete leads
- Can manage users
- Can view all leads across the organization

### Manager

- Can create, read, update leads
- Can delete leads
- Can view all leads in their team
- Cannot manage users

### Sales Executive

- Can create and read leads
- Can update only their own leads
- Can view only their own leads
- Cannot delete leads

## Real-time Features

### WebSocket Events

#### Client → Server

- `join:lead` - Join a lead room for real-time updates
- `leave:lead` - Leave a lead room

#### Server → Client

- `notification` - New notification received
- `lead:created` - New lead created
- `lead:updated` - Lead updated
- `lead:statusChanged` - Lead status changed
- `lead:ownerChanged` - Lead owner changed
- `activity:created` - New activity added

## Deployment

### Production Considerations

1. **Environment Variables**: Set secure environment variables
2. **Database**: Use managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
3. **JWT Secret**: Use a strong, random JWT secret
4. **HTTPS**: Enable HTTPS for production
5. **CORS**: Configure CORS properly for your domain
6. **Email Service**: Integrate with a real email service (SendGrid, AWS SES, etc.)
7. **Monitoring**: Set up error monitoring and logging
8. **Backup**: Regular database backups

### Deployment Options

#### Heroku

```bash
# Backend
heroku create crm-backend
heroku addons:create heroku-postgresql
heroku config:set JWT_SECRET=your-secret
git push heroku main

# Frontend
heroku create crm-frontend
# Build and deploy frontend
```

#### AWS/DigitalOcean

- Use Docker Compose on a VPS
- Or use container services (ECS, Kubernetes)

## Future Enhancements

### Integration Layer (Bonus Feature)

- REST API webhooks for third-party integrations
- HubSpot integration
- Slack integration
- Calendar integration (Google Calendar, Outlook)
- Email integration (Gmail, Outlook)

### Additional Features

- Advanced analytics and reporting
- Custom fields for leads
- Lead scoring
- Pipeline management
- Document management
- Team collaboration features
- Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

## Authors

Built as a comprehensive CRM platform assessment project.
