FROM rocker/r-ver:4.3.2

# System dependencies in a single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcurl4-openssl-dev libssl-dev libxml2-dev \
    libpng-dev libfontconfig1-dev libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# Use Posit Package Manager for pre-compiled binaries (Ubuntu 22.04 / Jammy)
RUN echo 'options(repos = c(CRAN = "https://packagemanager.posit.co/cran/__linux__/jammy/latest"))' >> /usr/local/lib/R/etc/Rprofile.site

# Install all R packages as binaries (fast, no compilation)
RUN install2.r --error --skipinstalled \
    plumber metafor ggplot2 jsonlite base64enc

# Copy API code
COPY plumber.R /app/plumber.R

EXPOSE 8000

CMD ["R", "-e", "plumber::plumb('/app/plumber.R')$run(host='0.0.0.0', port=as.integer(Sys.getenv('PORT', 8000)))"]
