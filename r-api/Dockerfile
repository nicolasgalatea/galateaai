FROM rocker/r-ver:4.3.2

# Install system dependencies for plotting
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libpng-dev \
    libfontconfig1-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# Install R packages
COPY install_packages.R /tmp/install_packages.R
RUN Rscript /tmp/install_packages.R

# Copy API code
COPY plumber.R /app/plumber.R

EXPOSE 8000

CMD ["R", "-e", "plumber::plumb('/app/plumber.R')$run(host='0.0.0.0', port=as.integer(Sys.getenv('PORT', 8000)))"]
