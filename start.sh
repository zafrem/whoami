#!/bin/bash

# Personality Survey Platform - Start Script
# This script starts the application in different modes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
MODE="development"
DOCKER=false
DETACHED=false

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
    echo "  -m, --mode MODE      Set mode: development, production (default: development)"
    echo "  -d, --docker         Use Docker containers"
    echo "  -D, --detached       Run in detached mode (background)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                          # Start in development mode (native)"
    echo "  $0 --docker                 # Start in development mode (Docker)"
    echo "  $0 --mode production        # Start in production mode (native)"
    echo "  $0 --docker --detached      # Start in Docker detached mode"
    echo "  $0 --mode production -d -D  # Start in production Docker detached mode"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -d|--docker)
            DOCKER=true
            shift
            ;;
        -D|--detached)
            DETACHED=true
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

# Validate mode
if [[ "$MODE" != "development" && "$MODE" != "production" ]]; then
    print_error "Invalid mode: $MODE. Use 'development' or 'production'"
    exit 1
fi

print_header
print_status "Starting Personality Survey Platform"
print_status "Mode: $MODE"
print_status "Docker: $DOCKER"
print_status "Detached: $DETACHED"
echo ""

# Check prerequisites
check_prerequisites() {
    if [[ "$DOCKER" == true ]]; then
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed or not in PATH"
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
            print_error "Docker Compose is not installed or not in PATH"
            exit 1
        fi
    else
        if ! command -v node &> /dev/null; then
            print_error "Node.js is not installed or not in PATH"
            exit 1
        fi
        
        if ! command -v npm &> /dev/null; then
            print_error "npm is not installed or not in PATH"
            exit 1
        fi
        
        if ! command -v psql &> /dev/null; then
            print_warning "PostgreSQL client not found. Make sure PostgreSQL is running."
        fi
    fi
}

# Start with Docker
start_docker() {
    print_status "Starting with Docker..."
    
    # Check if .env exists, if not copy from example
    if [[ ! -f .env ]]; then
        print_warning ".env file not found, copying from .env.example"
        cp .env.example .env
        print_warning "Please edit .env file with your configuration"
    fi
    
    local compose_file=""
    local compose_cmd="docker-compose"
    
    # Check if docker compose (v2) is available
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    fi
    
    if [[ "$MODE" == "development" ]]; then
        compose_file="docker-compose.dev.yml"
        print_status "Using development Docker configuration"
    else
        compose_file="docker-compose.yml"
        print_status "Using production Docker configuration"
    fi
    
    # Build and start containers
    print_status "Building and starting containers..."
    
    if [[ "$DETACHED" == true ]]; then
        $compose_cmd -f $compose_file up --build -d
    else
        $compose_cmd -f $compose_file up --build
    fi
}

# Start PostgreSQL service (for native mode)
start_postgres() {
    print_status "Checking PostgreSQL service..."
    
    # Check if PostgreSQL is already running
    if pg_isready -q 2>/dev/null; then
        print_status "PostgreSQL is already running"
        return 0
    fi
    
    # Try to start PostgreSQL based on the system
    if command -v brew &> /dev/null && brew services list | grep -q postgresql; then
        print_status "Starting PostgreSQL via Homebrew..."
        brew services start postgresql
    elif command -v systemctl &> /dev/null; then
        print_status "Starting PostgreSQL via systemctl..."
        sudo systemctl start postgresql
    elif command -v service &> /dev/null; then
        print_status "Starting PostgreSQL via service..."
        sudo service postgresql start
    elif command -v pg_ctl &> /dev/null; then
        print_status "Starting PostgreSQL via pg_ctl..."
        pg_ctl -D /usr/local/var/postgres start
    else
        print_warning "Could not determine how to start PostgreSQL. Please start it manually."
        return 1
    fi
    
    # Wait for PostgreSQL to be ready
    local attempts=0
    while ! pg_isready -q 2>/dev/null && [ $attempts -lt 30 ]; do
        sleep 1
        attempts=$((attempts + 1))
    done
    
    if pg_isready -q 2>/dev/null; then
        print_status "PostgreSQL is now running"
        return 0
    else
        print_error "Failed to start PostgreSQL or it's not responding"
        return 1
    fi
}

# Start natively
start_native() {
    print_status "Starting natively..."
    
    # Start PostgreSQL first
    start_postgres || print_warning "PostgreSQL startup failed, continuing..."
    
    # Check if dependencies are installed
    if [[ ! -d "backend/node_modules" ]]; then
        print_status "Installing backend dependencies..."
        cd backend && npm install && cd ..
    fi
    
    if [[ ! -d "frontend/node_modules" ]]; then
        print_status "Installing frontend dependencies..."
        cd frontend && npm install && cd ..
    fi
    
    # Check environment files
    if [[ ! -f "backend/.env" ]]; then
        print_warning "Backend .env file not found, copying from example"
        cp backend/.env.example backend/.env
        print_warning "Please edit backend/.env file with your configuration"
    fi
    
    # Start database seeding (if needed)
    if [[ "$MODE" == "development" ]]; then
        print_status "Seeding database with sample data..."
        cd backend && npm run seed && cd .. || print_warning "Database seeding failed, continuing..."
    fi
    
    # Create PID directory if it doesn't exist
    mkdir -p .pids
    
    # Kill any existing processes
    print_status "Stopping any existing processes..."
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    pkill -f "nodemon" 2>/dev/null || true
    sleep 2
    
    # Create improved start script
    cat > temp_start.sh << 'EOF'
#!/bin/bash

# Get the base directory
BASE_DIR=$(pwd)

# Cleanup function
cleanup() {
    echo "Stopping all services..."
    if [ -f "$BASE_DIR/.pids/backend.pid" ]; then
        kill $(cat "$BASE_DIR/.pids/backend.pid") 2>/dev/null || true
        rm -f "$BASE_DIR/.pids/backend.pid"
    fi
    if [ -f "$BASE_DIR/.pids/frontend.pid" ]; then
        kill $(cat "$BASE_DIR/.pids/frontend.pid") 2>/dev/null || true
        rm -f "$BASE_DIR/.pids/frontend.pid"
    fi
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    pkill -f "nodemon" 2>/dev/null || true
    echo "All services stopped."
    exit 0
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Create PID directory
mkdir -p "$BASE_DIR/.pids"

echo "Starting backend server..."
if [ -d "$BASE_DIR/backend" ]; then
    cd "$BASE_DIR/backend" && npm run dev &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$BASE_DIR/.pids/backend.pid"
    cd "$BASE_DIR"
else
    echo "Error: backend directory not found"
    exit 1
fi

echo "Waiting for backend to start..."
sleep 5

# Check if backend is actually running
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo "Warning: Backend may not be running properly"
fi

echo "Starting frontend server..."
if [ -d "$BASE_DIR/frontend" ]; then
    cd "$BASE_DIR/frontend" && npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$BASE_DIR/.pids/frontend.pid"
    cd "$BASE_DIR"
else
    echo "Error: frontend directory not found"
    exit 1
fi

echo ""
echo "🚀 Application started successfully!"
echo "📱 Frontend: http://localhost:8080"
echo "🔗 Backend API: http://localhost:3000"
echo "📊 Health Check: http://localhost:3000/api/health"
echo ""
echo "PIDs stored in .pids/ directory"
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait
EOF

    chmod +x temp_start.sh
    
    if [[ "$DETACHED" == true ]]; then
        nohup ./temp_start.sh > app.log 2>&1 &
        echo $! > .pids/main.pid
        print_status "Application started in background. Check app.log for output"
        print_status "Frontend: http://localhost:8080"
        print_status "Backend: http://localhost:3000"
        print_status "To stop: ./stop.sh"
    else
        ./temp_start.sh
    fi
    
    rm -f temp_start.sh
}

# Main execution
main() {
    check_prerequisites
    
    if [[ "$DOCKER" == true ]]; then
        start_docker
    else
        start_native
    fi
    
    if [[ "$?" -eq 0 ]]; then
        print_status "Startup completed successfully!"
        
        if [[ "$DOCKER" == true ]]; then
            if [[ "$MODE" == "development" ]]; then
                print_status "Frontend: http://localhost:8080"
                print_status "Backend: http://localhost:3001"
            else
                print_status "Application: http://localhost"
                print_status "Backend: http://localhost:3000"
            fi
        fi
        
        echo ""
        print_status "To stop the application, run: ./stop.sh"
    else
        print_error "Startup failed!"
        exit 1
    fi
}

# Run main function
main