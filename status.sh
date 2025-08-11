#!/bin/bash

# Personality Survey Platform - Status Script
# This script checks the status of the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} Personality Survey Platform${NC}"
    echo -e "${BLUE}        STATUS CHECK${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_separator() {
    echo -e "${BLUE}--------------------------------${NC}"
}

# Function to check if a service is responding
check_url() {
    local url=$1
    local service_name=$2
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|404"; then
        print_status "$service_name is responding at $url"
        return 0
    else
        print_error "$service_name is not responding at $url"
        return 1
    fi
}

# Function to check Docker containers
check_docker() {
    print_separator
    echo "🐳 Docker Containers Status:"
    echo ""
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        return
    fi
    
    local containers=$(docker ps --filter "name=personality-survey" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true)
    
    if [[ -n "$containers" ]]; then
        echo "$containers"
        echo ""
        
        # Check specific containers
        local db_status=$(docker ps --filter "name=personality-survey-db" --format "{{.Status}}" 2>/dev/null || echo "Not running")
        local api_status=$(docker ps --filter "name=personality-survey-api" --format "{{.Status}}" 2>/dev/null || echo "Not running")
        local web_status=$(docker ps --filter "name=personality-survey-web" --format "{{.Status}}" 2>/dev/null || echo "Not running")
        
        echo "Database: $db_status"
        echo "Backend API: $api_status"
        echo "Frontend Web: $web_status"
    else
        print_warning "No Docker containers running"
    fi
}

# Function to check native processes
check_native() {
    print_separator
    echo "💻 Native Processes Status:"
    echo ""
    
    # Check Node.js processes
    local node_processes=$(ps aux | grep -E "(node.*server.js|npm.*dev|vite)" | grep -v grep || true)
    
    if [[ -n "$node_processes" ]]; then
        echo "Running Node.js processes:"
        echo "$node_processes"
    else
        print_warning "No Node.js development processes found"
    fi
    
    echo ""
    
    # Check specific processes
    if pgrep -f "server.js" >/dev/null 2>&1; then
        print_status "Backend server process is running"
    else
        print_error "Backend server process is not running"
    fi
    
    if pgrep -f "vite" >/dev/null 2>&1; then
        print_status "Frontend development server is running"
    else
        print_error "Frontend development server is not running"
    fi
}

# Function to check ports
check_ports() {
    print_separator
    echo "🔌 Port Status:"
    echo ""
    
    local ports=("3000:Backend API" "3001:Backend API (Dev)" "8080:Frontend (Dev)" "80:Frontend (Prod)" "443:Frontend (SSL)" "5432:PostgreSQL" "5433:PostgreSQL (Dev)")
    
    for port_info in "${ports[@]}"; do
        local port=$(echo "$port_info" | cut -d: -f1)
        local service=$(echo "$port_info" | cut -d: -f2)
        
        if lsof -ti:$port >/dev/null 2>&1; then
            local pid=$(lsof -ti:$port)
            local process=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
            print_status "Port $port ($service) is in use by $process (PID: $pid)"
        else
            echo "Port $port ($service) is free"
        fi
    done
}

# Function to check services
check_services() {
    print_separator
    echo "🌐 Service Health Check:"
    echo ""
    
    # Check backend health endpoint
    if check_url "http://localhost:3000/api/health" "Backend API (Production)"; then
        # Get additional info from health endpoint
        local health_info=$(curl -s "http://localhost:3000/api/health" 2>/dev/null || echo "{}")
        echo "  Health: $health_info"
    fi
    
    if check_url "http://localhost:3001/api/health" "Backend API (Development)"; then
        local health_info=$(curl -s "http://localhost:3001/api/health" 2>/dev/null || echo "{}")
        echo "  Health: $health_info"
    fi
    
    # Check frontend
    check_url "http://localhost:8080" "Frontend (Development)" || true
    check_url "http://localhost" "Frontend (Production)" || true
    
    # Check database connectivity (if backend is running)
    if curl -s "http://localhost:3000/api/surveys" >/dev/null 2>&1 || curl -s "http://localhost:3001/api/surveys" >/dev/null 2>&1; then
        print_status "Database connectivity is working (surveys endpoint accessible)"
    else
        print_error "Database connectivity issues (surveys endpoint not accessible)"
    fi
}

# Function to check database
check_database() {
    print_separator
    echo "🗄️  Database Status:"
    echo ""
    
    # Check if PostgreSQL is running
    if command -v pg_isready &> /dev/null; then
        if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
            print_status "PostgreSQL is running on port 5432"
        else
            print_error "PostgreSQL is not responding on port 5432"
        fi
        
        if pg_isready -h localhost -p 5433 >/dev/null 2>&1; then
            print_status "PostgreSQL is running on port 5433 (dev)"
        else
            echo "PostgreSQL is not running on port 5433 (dev)"
        fi
    else
        print_warning "pg_isready not available, cannot check PostgreSQL status"
    fi
    
    # Check Docker PostgreSQL
    if docker ps --filter "name=personality-survey-db" --format "{{.Status}}" 2>/dev/null | grep -q "Up"; then
        print_status "Docker PostgreSQL container is running"
    else
        echo "Docker PostgreSQL container is not running"
    fi
}

# Function to check logs
check_logs() {
    print_separator
    echo "📋 Recent Logs:"
    echo ""
    
    # Check Docker logs
    if docker ps --filter "name=personality-survey" --format "{{.Names}}" 2>/dev/null | head -1 >/dev/null; then
        echo "Recent Docker logs:"
        for container in $(docker ps --filter "name=personality-survey" --format "{{.Names}}" 2>/dev/null); do
            echo "--- $container ---"
            docker logs --tail 5 "$container" 2>/dev/null || echo "No logs available"
            echo ""
        done
    fi
    
    # Check native logs
    if [[ -f app.log ]]; then
        echo "Recent native app logs:"
        tail -10 app.log
    fi
}

# Function to show URLs
show_urls() {
    print_separator
    echo "🔗 Access URLs:"
    echo ""
    
    # Check which services are running and show appropriate URLs
    if lsof -ti:8080 >/dev/null 2>&1; then
        print_status "Frontend (Development): http://localhost:8080"
    fi
    
    if lsof -ti:80 >/dev/null 2>&1; then
        print_status "Frontend (Production): http://localhost"
    fi
    
    if lsof -ti:3000 >/dev/null 2>&1; then
        print_status "Backend API (Production): http://localhost:3000"
        print_status "API Health Check: http://localhost:3000/api/health"
        print_status "API Documentation: http://localhost:3000/api/surveys"
    fi
    
    if lsof -ti:3001 >/dev/null 2>&1; then
        print_status "Backend API (Development): http://localhost:3001"
        print_status "API Health Check: http://localhost:3001/api/health"
    fi
}

# Main execution
main() {
    print_header
    
    check_docker
    check_native
    check_ports
    check_services
    check_database
    show_urls
    
    # Optional: show logs if verbose flag is set
    if [[ "$1" == "--logs" || "$1" == "-l" ]]; then
        check_logs
    fi
    
    print_separator
    print_status "Status check complete!"
    echo ""
    echo "💡 Use './status.sh --logs' to see recent logs"
    echo "🚀 Use './start.sh --help' to see start options"
    echo "🛑 Use './stop.sh --help' to see stop options"
}

# Handle help
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -l, --logs           Show recent logs"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "This script checks the status of all Personality Survey Platform services."
    exit 0
fi

# Run main function
main "$@"