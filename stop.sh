#!/bin/bash

# Personality Survey Platform - Stop Script
# This script stops the application in different modes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DOCKER=false
REMOVE_DATA=false
FORCE=false

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
    echo -e "${BLUE}================================${NC}"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --docker         Stop Docker containers"
    echo "  -c, --clean          Remove data volumes (Docker only)"
    echo "  -f, --force          Force stop all processes"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                   # Stop native processes"
    echo "  $0 --docker          # Stop Docker containers"
    echo "  $0 --docker --clean  # Stop Docker containers and remove data"
    echo "  $0 --force           # Force stop all processes"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--docker)
            DOCKER=true
            shift
            ;;
        -c|--clean)
            REMOVE_DATA=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

print_header
print_status "Stopping Personality Survey Platform"
print_status "Docker: $DOCKER"
print_status "Remove Data: $REMOVE_DATA"
print_status "Force: $FORCE"
echo ""

# Stop Docker containers
stop_docker() {
    print_status "Stopping Docker containers..."
    
    local compose_cmd="docker-compose"
    
    # Check if docker compose (v2) is available
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    fi
    
    # Try to stop development containers first
    if [[ -f "docker-compose.dev.yml" ]]; then
        print_status "Stopping development containers..."
        $compose_cmd -f docker-compose.dev.yml down || print_warning "Development containers may not be running"
    fi
    
    # Stop production containers
    if [[ -f "docker-compose.yml" ]]; then
        print_status "Stopping production containers..."
        $compose_cmd -f docker-compose.yml down || print_warning "Production containers may not be running"
    fi
    
    # Remove data volumes if requested
    if [[ "$REMOVE_DATA" == true ]]; then
        print_warning "Removing data volumes..."
        read -p "Are you sure you want to remove all data? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            $compose_cmd -f docker-compose.yml down -v || true
            $compose_cmd -f docker-compose.dev.yml down -v || true
            docker volume rm personality-survey_postgres_data || true
            docker volume rm personality-survey_postgres_dev_data || true
            print_status "Data volumes removed"
        else
            print_status "Data volumes preserved"
        fi
    fi
    
    # Clean up orphaned containers
    print_status "Cleaning up orphaned containers..."
    docker container prune -f || true
}

# Stop native processes
stop_native() {
    print_status "Stopping native processes..."
    
    # Stop processes using PID files (from improved start script)
    if [ -f .pids/main.pid ]; then
        print_status "Stopping main process..."
        kill $(cat .pids/main.pid) 2>/dev/null || true
        rm -f .pids/main.pid
    fi

    if [ -f .pids/backend.pid ]; then
        print_status "Stopping backend server..."
        kill $(cat .pids/backend.pid) 2>/dev/null || true
        rm -f .pids/backend.pid
    fi

    if [ -f .pids/frontend.pid ]; then
        print_status "Stopping frontend server..."
        kill $(cat .pids/frontend.pid) 2>/dev/null || true
        rm -f .pids/frontend.pid
    fi
    
    # Find and kill Node.js processes running our application
    local pids=$(pgrep -f "personality-survey" 2>/dev/null || true)
    local node_pids=$(pgrep -f "node.*server.js\|npm.*dev\|vite" 2>/dev/null || true)
    
    # Stop background processes
    if [[ -f app.log ]]; then
        print_status "Found background process log file"
        # Try to find the parent process
        local bg_pids=$(ps aux | grep -E "(node|npm)" | grep -v grep | awk '{print $2}' || true)
        if [[ -n "$bg_pids" ]]; then
            print_status "Stopping background processes..."
            echo "$bg_pids" | xargs kill -TERM 2>/dev/null || true
            sleep 2
            echo "$bg_pids" | xargs kill -KILL 2>/dev/null || true
        fi
    fi
    
    # Kill specific processes
    if [[ -n "$pids" ]]; then
        print_status "Stopping personality-survey processes: $pids"
        echo "$pids" | xargs kill -TERM 2>/dev/null || true
        sleep 2
        echo "$pids" | xargs kill -KILL 2>/dev/null || true
    fi
    
    if [[ -n "$node_pids" ]]; then
        print_status "Stopping Node.js development processes: $node_pids"
        echo "$node_pids" | xargs kill -TERM 2>/dev/null || true
        sleep 2
        echo "$node_pids" | xargs kill -KILL 2>/dev/null || true
    fi
    
    # Force kill if requested
    if [[ "$FORCE" == true ]]; then
        print_warning "Force killing all Node.js and npm processes..."
        pkill -f "node" 2>/dev/null || true
        pkill -f "npm" 2>/dev/null || true
    fi
    
    # Clean up temp files and PID directory
    rm -f temp_start.sh app.log nohup.out
    if [ -d .pids ]; then
        rm -rf .pids
    fi
    
    print_status "Native processes stopped"
}

# Stop processes on specific ports
stop_ports() {
    local ports=("3000" "3001" "8080" "80" "443")
    
    for port in "${ports[@]}"; do
        local pid=$(lsof -ti:$port 2>/dev/null || true)
        if [[ -n "$pid" ]]; then
            print_status "Stopping process on port $port (PID: $pid)"
            kill -TERM "$pid" 2>/dev/null || true
            sleep 1
            kill -KILL "$pid" 2>/dev/null || true
        fi
    done
}

# Check if anything is running
check_running() {
    print_status "Checking for running processes..."
    
    # Check Docker containers
    local docker_containers=$(docker ps --filter "name=personality-survey" --format "table {{.Names}}" 2>/dev/null | tail -n +2 || true)
    if [[ -n "$docker_containers" ]]; then
        print_warning "Docker containers still running:"
        echo "$docker_containers"
    fi
    
    # Check native processes
    local node_processes=$(pgrep -f "node.*server.js\|npm.*dev\|vite" 2>/dev/null || true)
    if [[ -n "$node_processes" ]]; then
        print_warning "Node.js processes still running: $node_processes"
    fi
    
    # Check ports
    local ports_in_use=""
    for port in 3000 3001 8080 80 443; do
        if lsof -ti:$port >/dev/null 2>&1; then
            ports_in_use="$ports_in_use $port"
        fi
    done
    
    if [[ -n "$ports_in_use" ]]; then
        print_warning "Ports still in use:$ports_in_use"
    fi
}

# Main execution
main() {
    if [[ "$DOCKER" == true ]]; then
        stop_docker
    else
        stop_native
    fi
    
    # Always try to clean up ports if force is requested
    if [[ "$FORCE" == true ]]; then
        stop_ports
    fi
    
    # Check what's still running
    check_running
    
    print_status "Stop completed!"
    echo ""
    print_status "To start the application again, run: ./start.sh"
}

# Handle Ctrl+C
trap 'print_warning "Stop interrupted"; exit 1' INT

# Run main function
main