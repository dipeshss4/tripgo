#!/bin/bash

# Generate self-signed SSL certificate for TripGo
# This is for development/testing purposes only

echo "🔐 Generating self-signed SSL certificate for TripGo..."

# Create the certificate with SAN (Subject Alternative Names) for multiple domains
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout server.key \
    -out server.crt \
    -config <(
        echo '[req]'
        echo 'default_bits = 2048'
        echo 'prompt = no'
        echo 'distinguished_name = req_distinguished_name'
        echo 'req_extensions = v3_req'
        echo ''
        echo '[req_distinguished_name]'
        echo 'C=US'
        echo 'ST=CA'
        echo 'L=San Francisco'
        echo 'O=TripGo'
        echo 'OU=IT'
        echo 'CN=tripgo.local'
        echo ''
        echo '[v3_req]'
        echo 'keyUsage = keyEncipherment, dataEncipherment'
        echo 'extendedKeyUsage = serverAuth'
        echo 'subjectAltName = @alt_names'
        echo ''
        echo '[alt_names]'
        echo 'DNS.1=tripgo.local'
        echo 'DNS.2=www.tripgo.local'
        echo 'DNS.3=admin.tripgo.local'
        echo 'DNS.4=api.tripgo.local'
        echo 'DNS.5=localhost'
        echo 'IP.1=127.0.0.1'
        echo 'IP.2=75.119.151.132'
    ) 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate generated successfully!"
    echo "📁 Certificate: server.crt"
    echo "🔑 Private key: server.key"
    echo ""
    echo "⚠️  Note: This is a self-signed certificate for development/testing."
    echo "   For production, use a certificate from a trusted CA like Let's Encrypt."
    echo ""
    echo "🔧 Certificate details:"
    openssl x509 -in server.crt -text -noout | grep -A 1 "Subject:"
    openssl x509 -in server.crt -text -noout | grep -A 5 "Subject Alternative Name:"
else
    echo "❌ Failed to generate SSL certificate"
    exit 1
fi