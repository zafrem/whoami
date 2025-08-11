@echo off
REM Personality Survey Platform - Status Script for Windows
REM This script checks the status of the application

setlocal EnableDelayedExpansion

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
echo %BLUE%        STATUS CHECK%NC%
echo %BLUE%================================%NC%
exit /b

:print_separator
echo %BLUE%--------------------------------%NC%
exit /b

REM Function to check if a service is responding
:check_url
set "url=%~1"
set "service_name=%~2"

curl -s -o nul -w "%%{http_code}" "%url%" | findstr "200 404" >nul
if !errorlevel! equ 0 (
    call :print_status "%service_name% is responding at %url%"
    exit /b 0
) else (
    call :print_error "%service_name% is not responding at %url%"
    exit /b 1
)

REM Function to check Docker containers
:check_docker
call :print_separator
echo 🐳 Docker Containers Status:
echo.

docker --version >nul 2>&1
if !errorlevel! neq 0 (
    call :print_error "Docker is not installed"
    exit /b
)

docker ps --filter "name=personality-survey" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>nul | findstr personality-survey >nul
if !errorlevel! equ 0 (
    docker ps --filter "name=personality-survey" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>nul
    echo.
    
    REM Check specific containers
    for /f "delims=" %%i in ('docker ps --filter "name=personality-survey-db" --format "{{.Status}}" 2^>nul') do set "db_status=%%i"
    for /f "delims=" %%i in ('docker ps --filter "name=personality-survey-api" --format "{{.Status}}" 2^>nul') do set "api_status=%%i"
    for /f "delims=" %%i in ('docker ps --filter "name=personality-survey-web" --format "{{.Status}}" 2^>nul') do set "web_status=%%i"
    
    if not defined db_status set "db_status=Not running"
    if not defined api_status set "api_status=Not running"
    if not defined web_status set "web_status=Not running"
    
    echo Database: !db_status!
    echo Backend API: !api_status!
    echo Frontend Web: !web_status!
) else (
    call :print_warning "No Docker containers running"
)
exit /b

REM Function to check native processes
:check_native
call :print_separator
echo 💻 Native Processes Status:
echo.

REM Check Node.js processes
tasklist | findstr "node.exe" >nul 2>&1
if !errorlevel! equ 0 (
    echo Running Node.js processes:
    tasklist /fi "imagename eq node.exe" /fo table
) else (
    call :print_warning "No Node.js processes found"
)

echo.

REM Check specific processes by looking for common patterns
tasklist | findstr "node.exe" | findstr "server" >nul 2>&1
if !errorlevel! equ 0 (
    call :print_status "Backend server process appears to be running"
) else (
    call :print_error "Backend server process is not running"
)

REM Check if any process is using development ports
netstat -an | findstr ":8080 " >nul 2>&1
if !errorlevel! equ 0 (
    call :print_status "Frontend development server appears to be running"
) else (
    call :print_error "Frontend development server is not running"
)
exit /b

REM Function to check ports
:check_ports
call :print_separator
echo 🔌 Port Status:
echo.

for %%p in (3000 3001 8080 80 443 5432 5433) do (
    set "service_name=Unknown"
    if %%p==3000 set "service_name=Backend API"
    if %%p==3001 set "service_name=Backend API (Dev)"
    if %%p==8080 set "service_name=Frontend (Dev)"
    if %%p==80 set "service_name=Frontend (Prod)"
    if %%p==443 set "service_name=Frontend (SSL)"
    if %%p==5432 set "service_name=PostgreSQL"
    if %%p==5433 set "service_name=PostgreSQL (Dev)"
    
    netstat -an | findstr ":%%p " >nul 2>&1
    if !errorlevel! equ 0 (
        call :print_status "Port %%p (!service_name!) is in use"
    ) else (
        echo Port %%p (!service_name!) is free
    )
)
exit /b

REM Function to check services
:check_services
call :print_separator
echo 🌐 Service Health Check:
echo.

REM Check backend health endpoints
call :check_url "http://localhost:3000/api/health" "Backend API (Production)"
call :check_url "http://localhost:3001/api/health" "Backend API (Development)"

REM Check frontend
call :check_url "http://localhost:8080" "Frontend (Development)"
call :check_url "http://localhost" "Frontend (Production)"

REM Check database connectivity
curl -s "http://localhost:3000/api/surveys" >nul 2>&1 || curl -s "http://localhost:3001/api/surveys" >nul 2>&1
if !errorlevel! equ 0 (
    call :print_status "Database connectivity is working (surveys endpoint accessible)"
) else (
    call :print_error "Database connectivity issues (surveys endpoint not accessible)"
)
exit /b

REM Function to show URLs
:show_urls
call :print_separator
echo 🔗 Access URLs:
echo.

netstat -an | findstr ":8080 " >nul 2>&1
if !errorlevel! equ 0 (
    call :print_status "Frontend (Development): http://localhost:8080"
)

netstat -an | findstr ":80 " >nul 2>&1
if !errorlevel! equ 0 (
    call :print_status "Frontend (Production): http://localhost"
)

netstat -an | findstr ":3000 " >nul 2>&1
if !errorlevel! equ 0 (
    call :print_status "Backend API (Production): http://localhost:3000"
    call :print_status "API Health Check: http://localhost:3000/api/health"
    call :print_status "API Documentation: http://localhost:3000/api/surveys"
)

netstat -an | findstr ":3001 " >nul 2>&1
if !errorlevel! equ 0 (
    call :print_status "Backend API (Development): http://localhost:3001"
    call :print_status "API Health Check: http://localhost:3001/api/health"
)
exit /b

REM Handle help
if "%~1"=="--help" (
    echo Usage: %0 [OPTIONS]
    echo.
    echo Options:
    echo   -h, --help          Show this help message
    echo.
    echo This script checks the status of all Personality Survey Platform services.
    exit /b 0
)

if "%~1"=="-h" (
    echo Usage: %0 [OPTIONS]
    echo.
    echo Options:
    echo   -h, --help          Show this help message
    echo.
    echo This script checks the status of all Personality Survey Platform services.
    exit /b 0
)

REM Main execution
call :print_header

call :check_docker
call :check_native
call :check_ports
call :check_services
call :show_urls

call :print_separator
call :print_status "Status check complete!"
echo.
echo 💡 Use 'start.bat --help' to see start options
echo 🛑 Use 'stop.bat --help' to see stop options