@echo off
REM Personality Survey Platform - Start Script for Windows
REM This script starts the application in different modes

setlocal EnableDelayedExpansion

REM Default values
set "MODE=development"
set "DOCKER=false"
set "DETACHED=false"

REM Colors (using Windows color codes)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %GREEN%[INFO]%NC% %~1
exit /b

:print_error
echo %RED%[ERROR]%NC% %~1
exit /b

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
exit /b

:print_header
echo %BLUE%================================%NC%
echo %BLUE% Personality Survey Platform%NC%
echo %BLUE%================================%NC%
exit /b

REM Function to show usage
:show_usage
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   -m, --mode MODE      Set mode: development, production (default: development)
echo   -d, --docker         Use Docker containers
echo   -D, --detached       Run in detached mode (background)
echo   -h, --help          Show this help message
echo.
echo Examples:
echo   %0                          # Start in development mode (native)
echo   %0 --docker                 # Start in development mode (Docker)
echo   %0 --mode production        # Start in production mode (native)
echo   %0 --docker --detached      # Start in Docker detached mode
exit /b

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :args_done
if "%~1"=="-m" (
    set "MODE=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--mode" (
    set "MODE=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="-d" (
    set "DOCKER=true"
    shift
    goto :parse_args
)
if "%~1"=="--docker" (
    set "DOCKER=true"
    shift
    goto :parse_args
)
if "%~1"=="-D" (
    set "DOCKER=true"
    shift
    goto :parse_args
)
if "%~1"=="--detached" (
    set "DETACHED=true"
    shift
    goto :parse_args
)
if "%~1"=="-h" (
    call :show_usage
    exit /b 0
)
if "%~1"=="--help" (
    call :show_usage
    exit /b 0
)
echo Unknown option: %~1
call :show_usage
exit /b 1

:args_done

REM Validate mode
if not "%MODE%"=="development" if not "%MODE%"=="production" (
    call :print_error "Invalid mode: %MODE%. Use 'development' or 'production'"
    exit /b 1
)

call :print_header
call :print_status "Starting Personality Survey Platform"
call :print_status "Mode: %MODE%"
call :print_status "Docker: %DOCKER%"
call :print_status "Detached: %DETACHED%"
echo.

REM Check prerequisites
:check_prerequisites
if "%DOCKER%"=="true" (
    docker --version >nul 2>&1
    if !errorlevel! neq 0 (
        call :print_error "Docker is not installed or not in PATH"
        exit /b 1
    )
    
    docker-compose --version >nul 2>&1 || docker compose version >nul 2>&1
    if !errorlevel! neq 0 (
        call :print_error "Docker Compose is not installed or not in PATH"
        exit /b 1
    )
) else (
    node --version >nul 2>&1
    if !errorlevel! neq 0 (
        call :print_error "Node.js is not installed or not in PATH"
        exit /b 1
    )
    
    npm --version >nul 2>&1
    if !errorlevel! neq 0 (
        call :print_error "npm is not installed or not in PATH"
        exit /b 1
    )
)
exit /b

REM Start with Docker
:start_docker
call :print_status "Starting with Docker..."

REM Check if .env exists
if not exist ".env" (
    call :print_warning ".env file not found, copying from .env.example"
    copy ".env.example" ".env" >nul
    call :print_warning "Please edit .env file with your configuration"
)

set "compose_file="
set "compose_cmd=docker-compose"

REM Check if docker compose (v2) is available
docker compose version >nul 2>&1
if !errorlevel! equ 0 (
    set "compose_cmd=docker compose"
)

if "%MODE%"=="development" (
    set "compose_file=docker-compose.dev.yml"
    call :print_status "Using development Docker configuration"
) else (
    set "compose_file=docker-compose.yml"
    call :print_status "Using production Docker configuration"
)

call :print_status "Building and starting containers..."

if "%DETACHED%"=="true" (
    %compose_cmd% -f %compose_file% up --build -d
) else (
    %compose_cmd% -f %compose_file% up --build
)
exit /b

REM Start PostgreSQL service (for native mode)
:start_postgres
call :print_status "Checking PostgreSQL service..."

REM Check if PostgreSQL is already running
pg_isready -q >nul 2>&1
if !errorlevel! equ 0 (
    call :print_status "PostgreSQL is already running"
    exit /b 0
)

REM Try to start PostgreSQL service on Windows
net start postgresql-x64-13 >nul 2>&1 || net start postgresql-x64-14 >nul 2>&1 || net start postgresql-x64-15 >nul 2>&1 || (
    call :print_warning "Could not start PostgreSQL service. Please start it manually via Services or pg_ctl."
    exit /b 1
)

REM Wait for PostgreSQL to be ready
set /a attempts=0
:wait_postgres
pg_isready -q >nul 2>&1
if !errorlevel! equ 0 (
    call :print_status "PostgreSQL is now running"
    exit /b 0
)
set /a attempts+=1
if !attempts! lss 30 (
    timeout /t 1 /nobreak >nul
    goto :wait_postgres
)

call :print_error "Failed to start PostgreSQL or it's not responding"
exit /b 1

REM Start natively
:start_native
call :print_status "Starting natively..."

REM Start PostgreSQL first
call :start_postgres || call :print_warning "PostgreSQL startup failed, continuing..."

REM Check if dependencies are installed
if not exist "backend\node_modules" (
    call :print_status "Installing backend dependencies..."
    cd backend && npm install && cd ..
)

if not exist "frontend\node_modules" (
    call :print_status "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
)

REM Check environment files
if not exist "backend\.env" (
    call :print_warning "Backend .env file not found, copying from example"
    copy "backend\.env.example" "backend\.env" >nul
    call :print_warning "Please edit backend\.env file with your configuration"
)

REM Start database seeding (if needed)
if "%MODE%"=="development" (
    call :print_status "Seeding database with sample data..."
    cd backend && npm run seed && cd .. 2>nul || (
        call :print_warning "Database seeding failed, continuing..."
    )
)

REM Create batch file to start both servers
echo @echo off > temp_start.bat
echo echo Starting backend server... >> temp_start.bat
echo cd backend >> temp_start.bat
echo start "Backend Server" npm run dev >> temp_start.bat
echo cd .. >> temp_start.bat
echo echo Waiting for backend to start... >> temp_start.bat
echo timeout /t 5 /nobreak ^>nul >> temp_start.bat
echo echo Starting frontend server... >> temp_start.bat
echo cd frontend >> temp_start.bat
echo start "Frontend Server" npm run dev >> temp_start.bat
echo cd .. >> temp_start.bat
echo echo. >> temp_start.bat
echo echo ^🚀 Application started successfully! >> temp_start.bat
echo echo ^📱 Frontend: http://localhost:8080 >> temp_start.bat
echo echo ^🔗 Backend API: http://localhost:3000 >> temp_start.bat
echo echo ^📊 Health Check: http://localhost:3000/api/health >> temp_start.bat
echo echo. >> temp_start.bat
echo echo Press any key to stop all services >> temp_start.bat
echo pause >> temp_start.bat

if "%DETACHED%"=="true" (
    start /min temp_start.bat
    call :print_status "Application started in background"
    call :print_status "Frontend: http://localhost:8080"
    call :print_status "Backend: http://localhost:3000"
) else (
    temp_start.bat
)

del temp_start.bat 2>nul
exit /b

REM Main execution
call :check_prerequisites

if "%DOCKER%"=="true" (
    call :start_docker
) else (
    call :start_native
)

if !errorlevel! equ 0 (
    call :print_status "Startup completed successfully!"
    
    if "%DOCKER%"=="true" (
        if "%MODE%"=="development" (
            call :print_status "Frontend: http://localhost:8080"
            call :print_status "Backend: http://localhost:3001"
        ) else (
            call :print_status "Application: http://localhost"
            call :print_status "Backend: http://localhost:3000"
        )
    )
    
    echo.
    call :print_status "To stop the application, run: stop.bat"
) else (
    call :print_error "Startup failed!"
    exit /b 1
)

REM Parse command line arguments
:parse_args
shift
goto :parse_args