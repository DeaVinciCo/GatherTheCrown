#!/bin/bash
# Cross-Platform Build Script
# Builds Gather The Crown for Desktop (Electron), Mobile (Expo), and Web (Vite)

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

echo "🎮 Gather The Crown - Cross-Platform Build"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js."
        exit 1
    fi
    print_status "Node.js found: $(node --version)"
    
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm not found. Installing..."
        npm install -g pnpm
    fi
    print_status "pnpm found: $(pnpm --version)"
    
    if [ "$1" == "desktop" ] || [ "$1" == "all" ]; then
        if ! command -v electron-builder &> /dev/null; then
            print_info "Installing electron-builder..."
            npm install -g electron-builder
        fi
    fi
    
    if [ "$1" == "mobile" ] || [ "$1" == "all" ]; then
        if ! command -v expo &> /dev/null; then
            print_info "Installing expo-cli..."
            npm install -g expo-cli
        fi
    fi
    
    echo ""
}

# Build web version
build_web() {
    print_info "Building web version..."
    cd "$PROJECT_ROOT/packages/client"
    npm run build
    print_status "Web build complete"
    cd "$PROJECT_ROOT"
}

# Build server
build_server() {
    print_info "Building server..."
    cd "$PROJECT_ROOT/packages/server"
    npm run build
    print_status "Server build complete"
    cd "$PROJECT_ROOT"
}

# Build desktop (Electron)
build_desktop() {
    print_info "Building desktop application..."
    
    build_web
    
    cd "$PROJECT_ROOT"
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Setting up Electron..."
        npm init -y
        npm install electron electron-builder electron-is-dev --save-dev
        cp desktop-package.json package.json
    fi
    
    # Build Electron app
    npx electron-builder --win --mac --linux --publish=never
    
    print_status "Desktop build complete"
    print_info "Installers located in dist/"
}

# Build mobile (Expo)
build_mobile() {
    print_info "Building mobile application..."
    
    if [ ! -f "app.json" ]; then
        print_error "app.json not found. Setting up Expo..."
        cp mobile-app.json app.json
        expo init --name "Gather The Crown" --template blank
    fi
    
    print_info "For iOS: Run 'expo build:ios'"
    print_info "For Android: Run 'expo build:android'"
    print_status "Mobile build configuration ready"
}

# Main build function
main() {
    check_prerequisites "$1"
    
    case "$1" in
        web)
            build_web
            ;;
        server)
            build_server
            ;;
        desktop)
            build_desktop
            ;;
        mobile)
            build_mobile
            ;;
        all)
            build_web
            build_server
            build_desktop
            build_mobile
            print_status "All builds complete!"
            ;;
        *)
            echo "Usage: ./build.sh [web|server|desktop|mobile|all]"
            echo ""
            echo "Examples:"
            echo "  ./build.sh web       # Build web version"
            echo "  ./build.sh desktop   # Build desktop app (Windows/Mac/Linux)"
            echo "  ./build.sh mobile    # Prepare mobile build (iOS/Android)"
            echo "  ./build.sh all       # Build all platforms"
            exit 1
            ;;
    esac
}

main "$@"
