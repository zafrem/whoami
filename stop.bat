@echo off
REM Personality Survey Platform - Stop Script for Windows
REM This script stops the application in different modes

setlocal EnableDelayedExpansion

REM Default values
set "DOCKER=false"
set "REMOVE_DATA=false"
set "FORCE=false"

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
echo   -d, --docker         Stop Docker containers
echo   -c, --clean          Remove data volumes (Docker only)
echo   -f, --force          Force stop all processes
echo   -h, --help          Show this help message
echo.
echo Examples:
echo   %0                   # Stop native processes
echo   %0 --docker          # Stop Docker containers
echo   %0 --docker --clean  # Stop Docker containers and remove data
echo   %0 --force           # Force stop all processes
exit /b

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :args_done
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
if "%~1"=="-c" (
    set "REMOVE_DATA=true"
    shift
    goto :parse_args
)
if "%~1"=="--clean" (
    set "REMOVE_DATA=true"
    shift
    goto :parse_args
)
if "%~1"=="-f" (
    set "FORCE=true"
    shift
    goto :parse_args
)
if "%~1"=="--force" (
    set "FORCE=true"
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

call :print_header
call :print_status "Stopping Personality Survey Platform"
call :print_status "Docker: %DOCKER%"
call :print_status "Remove Data: %REMOVE_DATA%"
call :print_status "Force: %FORCE%"
echo.

REM Stop Docker containers
:stop_docker
call :print_status "Stopping Docker containers..."

set "compose_cmd=docker-compose"

REM Check if docker compose (v2) is available
docker compose version >nul 2>&1
if !errorlevel! equ 0 (
    set "compose_cmd=docker compose"
)

REM Try to stop development containers first
if exist "docker-compose.dev.yml" (
    call :print_status "Stopping development containers..."
    %compose_cmd% -f docker-compose.dev.yml down 2>nul || (
        call :print_warning "Development containers may not be running"
    )
)

REM Stop production containers
if exist "docker-compose.yml" (
    call :print_status "Stopping production containers..."
    %compose_cmd% -f docker-compose.yml down 2>nul || (
        call :print_warning "Production containers may not be running"
    )
)

REM Remove data volumes if requested
if "%REMOVE_DATA%"=="true" (
    call :print_warning "Removing data volumes..."
    set /p "REPLY=Are you sure you want to remove all data? (y/N): "
    if /i "!REPLY!"=="y" (
        %compose_cmd% -f docker-compose.yml down -v 2>nul
        %compose_cmd% -f docker-compose.dev.yml down -v 2>nul
        docker volume rm personality-survey_postgres_data 2>nul
        docker volume rm personality-survey_postgres_dev_data 2>nul
        call :print_status "Data volumes removed"
    ) else (
        call :print_status "Data volumes preserved"
    )
)

REM Clean up orphaned containers
call :print_status "Cleaning up orphaned containers..."
docker container prune -f 2>nul
exit /b

REM Stop native processes
:stop_native
call :print_status "Stopping native processes..."

REM Stop Node.js processes
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo table /nh 2^>nul') do (
    taskkill /pid %%i /f >nul 2>&1
)

REM Stop npm processes
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq npm.exe" /fo table /nh 2^>nul') do (
    taskkill /pid %%i /f >nul 2>&1
)

REM Stop processes by window title
taskkill /fi "WindowTitle eq Backend Server*" /f >nul 2>&1
taskkill /fi "WindowTitle eq Frontend Server*" /f >nul 2>&1

REM Clean up temp files
del temp_start.bat 2>nul

call :print_status "Native processes stopped"
exit /b

REM Stop processes on specific ports
:stop_ports
call :print_status "Stopping processes on common ports..."

REM Kill processes on specific ports
for %%p in (3000 3001 8080 80 443) do (
    for /f "tokens=5" %%i in ('netstat -aon ^| findstr ":%%p "') do (
        taskkill /pid %%i /f >nul 2>&1
    )
)
exit /b

REM Check if anything is running
:check_running
call :print_status "Checking for running processes..."

REM Check Docker containers
docker ps --filter "name=personality-survey" --format "table {{.Names}}" 2>nul | findstr personality-survey >nul
if !errorlevel! equ 0 (
    call :print_warning "Docker containers still running"
    docker ps --filter "name=personality-survey"
)

REM Check native processes
tasklist | findstr "node.exe" >nul 2>&1
if !errorlevel! equ 0 (
    call :print_warning "Node.js processes still running"
)

REM Check ports
for %%p in (3000 3001 8080 80 443) do (
    netstat -an | findstr ":%%p " >nul 2>&1
    if !errorlevel! equ 0 (
        call :print_warning "Port %%p is still in use"
    )
)
exit /b

REM Main execution
if "%DOCKER%"=="true" (
    call :stop_docker
) else (
    call :stop_native
)

REM Always try to clean up ports if force is requested
if "%FORCE%"=="true" (
    call :stop_ports
)

REM Check what's still running
call :check_running

call :print_status "Stop completed!"
echo.
call :print_status "To start the application again, run: start.bat"