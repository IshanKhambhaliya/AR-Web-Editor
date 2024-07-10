import http.server
import ssl

# Define the server address and port
server_address = ('192.0.0.2', 8000)

# Create the HTTP server
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

# Load the SSL certificates
httpd.socket = ssl.wrap_socket(httpd.socket,keyfile="localhost-key.pem",certfile='localhost.pem',server_side=True)

# Start the HTTPS server
print("Serving on https://192.0.0.2:8000")
httpd.serve_forever()