FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf
COPY certs/nginx.key /etc/ssl/certs
COPY certs/nginx.csr /etc/ssl/certs
COPY certs/nginx.crt /etc/ssl/certs
COPY certs/dhparam.pem /etc/ssl/certs

EXPOSE 443