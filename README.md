# CareerReach — Cold Outreach Platform

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

A modern, production-grade, multi-user web platform designed for job seekers, recruiters, and sales engineers to send personalized, high-deliverability cold recruitment emails through their own connected Gmail accounts.

---

## Architecture & System Design

```
                     ┌─────────────────────────────────────────────────────────┐
                     │                     Browser Client                      │
                     │          (React 18 + Vite + TypeScript + Tailwind)      │
                     └────────────────────────────┬────────────────────────────┘
                                                  │ REST API / JWT
                                                  ▼
                     ┌─────────────────────────────────────────────────────────┐
                     │               Spring Boot 3.4.2 Application             │
                     │  ┌───────────────────────────────────────────────────┐  │
                     │  │ Security & Auth (JWT + BCrypt + AES-256-GCM)      │  │
                     │  ├───────────────────────────────────────────────────┤  │
                     │  │ Contact Import Engine (POI + Column Mapper)       │  │
                     │  ├───────────────────────────────────────────────────┤  │
                     │  │ Template Personalizer & Variable Engine           │  │
                     │  ├───────────────────────────────────────────────────┤  │
                     │  │ Safe Background Dispatcher (Virtual Threads +     │  │
                     │  │ Rate Limiter + Transient Exponential Backoff)     │  │
                     │  ├───────────────────────────────────────────────────┤  │
                     │  │ Recovery Listener (Automatic Orphan Healing)      │  │
                     │  └─────────────────────────┬─────────────────────────┘  │
                     └─────────────┬──────────────┴───────────────┬────────────┘
                                   │                              │
                     JDBC (Pooled) │                              │ OAuth 2.0 / HTTPS
                                   ▼                              ▼
                     ┌───────────────────────────┐  ┌───────────────────────────┐
                     │   PostgreSQL 16 Database  │  │     Google Gmail API      │
                     │  - Users & Settings       │  │  - `gmail.send` scope     │
                     │  - Contacts & Statuses    │  │  - User tokens encrypted  │
                     │  - Campaigns & Recipients │  │    at rest (AES-GCM)      │
                     │  - Audit Activity Logs    │  └───────────────────────────┘
                     └───────────────────────────┘
```

---

## Core Features

### 1. Database-Driven Analytics Dashboard
* **Real-time Metrics**: Total Contacts, Active Campaigns, Total Emails Sent, Failed Deliveries, and Global Success Rate %.
* **Recent Campaigns List**: Status badges, recipient volume, deliverability rates, and quick navigation.
* **Activity Audit Feed**: Real-time event log tracking user actions across authentication, contact imports, Gmail integrations, and campaign lifecycles.

### 2. Contact Import Wizard
* **Supported Formats**: Excel (`.xlsx`, `.xls`) and CSV (`.csv`).
* **Flexible Column Mapping**: Interactive header mapper allowing users to map source file columns to standard fields (`Full Name`, `Email`, `Company`, `Position`, `Notes`).
* **10-Row Data Preview**: Instant visual validation of mapped records before committing to the database.
* **Dry-Run Validation Summary**: Displays total detected rows, valid contacts, duplicate entries, and invalid emails with actionable warnings.

### 3. Contact Management & Unsubscribe Handling
* **Status Lifecycle**: `LEAD`, `CONTACTED`, `REPLIED`, `BOUNCED`, `UNSUBSCRIBED`.
* **Opt-Out Compliance**: Built-in unsubscribe toggle per contact. Unsubscribed contacts are automatically prevented from receiving outreach across all future campaigns.
* **Automated Email Opt-Out Footers**: Configurable footer injection in emails giving recipients an effortless unsubscribe mechanism.

### 4. Template Studio & Smart Variable Engine
* **Dynamic Merge Tags**: `{{name}}`, `{{company}}`, `{{position}}`, `{{email}}`, and custom fallback values.
* **Syntax & Variable Validation**: Live detection of undefined or misspelled variables with inline warnings.
* **Live Personalization Preview**: Render realistic subject and body previews using sample or actual contact records.
* **Character Counters & Search**: Real-time character counts, instant template search, and one-click template duplication.

### 5. Campaign Safety & Duplicate Protection
* **Pre-Send Duplicate Detection**: Scans candidate recipients against prior campaigns using the same template or any previous campaign.
* **One-Click Duplicate Skipping**: Default option to safely skip already contacted recipients to protect domain deliverability and sender reputation.
* **4-Step Campaign Creation Wizard**:
  1. *Basics*: Campaign title and sending window.
  2. *Template Selection*: Live template preview with duplicate statistics.
  3. *Recipient Selection*: Target list filtering by status with instant duplicate warnings.
  4. *Pre-Flight Safety Check*: Summary verification confirming connected Gmail health, valid recipients, skipped duplicates, and rate configurations.

### 6. Reliable Background Email Dispatcher
* **Thread-Safe Asynchronous Dispatching**: Uses Spring Task Execution with controlled batch intervals (default 5–15s delays) to stay within Google rate limits.
* **Transient Error Handling**: Automatic retry with exponential backoff on Google `429 Too Many Requests` and `503 Service Unavailable` responses.
* **Safe Restart Recovery (`CampaignRecoveryListener`)**: On server restart or crash, any orphaned `RUNNING` or `QUEUED` campaigns are automatically transitioned to `PAUSED`, and stranded `SENDING` recipients are reset to `PENDING` so no emails are lost or double-sent.
* **Live Execution Control**: Real-time Pause, Resume, and Cancel actions for any active campaign.

### 7. User Settings & Account Controls
* **Profile Management**: Update display name and change password securely with BCrypt validation.
* **Gmail Integration Hub**: Connect, test connection status, and securely disconnect Gmail accounts.
* **Sending Preferences**: Configure default sending delay between emails, daily sending limits, and automatic opt-out footer toggles.
* **Full Audit Log**: Filterable chronological history of all user activities with IP tracking and entity references.

---

## Security Architecture

* **Zero Client-Side Token Exposure**: Google OAuth refresh tokens and access tokens are never transmitted to the browser or logged.
* **AES-256-GCM Token Encryption**: All stored OAuth tokens are encrypted at rest using AES-256 in Galois/Counter Mode with unique IVs.
* **Stateless JWT Authentication**: Passwords hashed with BCrypt (strength 10). Access tokens signed with HMAC-SHA256.
* **Strict Tenant Isolation**: All database queries and modifications enforce `WHERE user_id = :userId` validation.
* **OWASP Best Practices**: Input validation, parameterized JPA queries, CORS restriction, and secure HTTP response headers.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | Java 21, Spring Boot 3.4.2 |
| **Data Access** | Spring Data JPA, Hibernate, HikariCP |
| **Database** | PostgreSQL 16 |
| **File Processing** | Apache POI 5.2.5 (Excel), Apache Commons CSV 1.10.0 |
| **Security** | Spring Security 6, JJWT 0.12.5, AES-256-GCM |
| **Mail & APIs** | Google API Client 2.4.0, Google OAuth Client 1.35.0, Gmail API v1 |
| **Frontend Framework** | React 18.3, Vite 5.4, TypeScript 5.5 |
| **Styling** | Tailwind CSS 3.4, Lucide React Icons |
| **State & Routing** | React Context API, React Router v6, Axios |
| **Containerization** | Docker, Multi-Stage Builds, Nginx Alpine |

---

## Local Development Setup

### Prerequisites
* **Java**: JDK 21+
* **Node.js**: 20.x+ and `npm`
* **PostgreSQL**: 16+ running locally on port 5432
* **Google Cloud Console**: OAuth 2.0 Web Application credentials

### 1. Database Setup

Create the PostgreSQL database:
```sql
CREATE DATABASE careerreach_db;
```

### 2. Google Cloud Console Configuration

To enable Gmail OAuth 2.0:
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **CareerReach**.
3. Go to **APIs & Services** > **Library** and enable the **Gmail API**.
4. Go to **APIs & Services** > **OAuth consent screen**:
   * Select **External**.
   * Fill in Application Name: `CareerReach`.
   * Add scopes: `https://www.googleapis.com/auth/gmail.send` and `https://www.googleapis.com/auth/userinfo.email`.
   * Add your Google account email under **Test users**.
5. Go to **APIs & Services** > **Credentials**:
   * Click **Create Credentials** > **OAuth client ID**.
   * Application type: **Web application**.
   * Name: `CareerReach Web Client`.
   * Authorized redirect URIs:
     * `http://localhost:5173/settings` (Local frontend redirect)
     * `http://localhost:80/settings` (Docker frontend redirect)
6. Copy your **Client ID** and **Client Secret**.

### 3. Backend Setup

Create a `.env` file or export environment variables in your terminal:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=careerreach_db
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Security & Secrets
JWT_SECRET=9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b
TOKEN_ENCRYPTION_SECRET=mySuperSecretEncryptionKey32Chars!

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/settings
```

Run the backend via Maven:
```bash
cd backend
./mvnw clean spring-boot:run
```
The backend starts at `http://localhost:8080`.

### 4. Frontend Setup

Install dependencies and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:5173`.

---

## Running with Docker Compose

Deploy the entire stack with a single command:

```bash
# 1. Provide your environment variables
export GOOGLE_CLIENT_ID="your_google_client_id"
export GOOGLE_CLIENT_SECRET="your_google_client_secret"
export GOOGLE_REDIRECT_URI="http://localhost/settings"
export TOKEN_ENCRYPTION_SECRET="mySuperSecretEncryptionKey32Chars!"

# 2. Build and run containers
docker-compose up --build -d
```

Services will be accessible at:
* **Frontend**: `http://localhost` (or `http://localhost:80`)
* **Backend API**: `http://localhost:8080/api`
* **PostgreSQL**: `localhost:5432`

To shut down:
```bash
docker-compose down
```

---

## Running Tests

### Backend Unit & Integration Tests
```bash
cd backend
./mvnw test
```
Runs comprehensive test suites covering:
* Application Context Bootstrapping
* Authentication & JWT Generation
* Contact Import & Excel/CSV Parsing
* Variable Substitution & Template Rendering
* Transient Error Retries & Campaign Dispatch Logic

### Frontend Production Build Test
```bash
cd frontend
npm run build
```
Executes TypeScript compilation and bundle packaging via Vite.

---

## API Documentation Reference

| Method | Endpoint | Description |
|---|---|---|
| **POST** | `/api/auth/register` | Register new user account |
| **POST** | `/api/auth/login` | Authenticate and obtain JWT token |
| **GET** | `/api/auth/me` | Fetch authenticated user profile |
| **GET** | `/api/dashboard/stats` | Database-driven KPIs, recent campaigns & activities |
| **POST** | `/api/contacts/import/preview` | Upload file for column detection & 10-row sample |
| **POST** | `/api/contacts/import` | Execute contact import with custom column mapping |
| **GET** | `/api/contacts` | Paginated contact list with search & status filters |
| **PATCH**| `/api/contacts/{id}/status` | Update contact status or unsubscribe |
| **GET** | `/api/templates` | Search and list personalized email templates |
| **POST** | `/api/templates/{id}/duplicate` | Clone template with new name |
| **POST** | `/api/campaigns/check-duplicates` | Analyze duplicate recipients before campaign launch |
| **POST** | `/api/campaigns/validate-preflight`| Pre-flight sanity check on Gmail, templates & recipients |
| **POST** | `/api/campaigns` | Create and initialize outreach campaign |
| **POST** | `/api/campaigns/{id}/start` | Launch asynchronous background email dispatch |
| **POST** | `/api/campaigns/{id}/pause` | Pause active campaign |
| **POST** | `/api/campaigns/{id}/resume` | Resume paused campaign |
| **POST** | `/api/campaigns/{id}/cancel` | Abort campaign execution |
| **GET** | `/api/oauth/gmail/url` | Generate Google OAuth authorization URL |
| **POST** | `/api/oauth/gmail/callback` | Exchange auth code for tokens and save encrypted |
| **DELETE**| `/api/oauth/gmail/disconnect` | Revoke tokens and disconnect Gmail |
| **GET** | `/api/settings` | Retrieve user sending preferences |
| **PUT** | `/api/settings` | Update sending delay, daily limits, opt-out toggles |

---

## License

This project is licensed under the MIT License — see the LICENSE file for details.
