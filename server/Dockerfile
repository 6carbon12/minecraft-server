FROM arm64v8/ubuntu:22.04

# Install dependencies
RUN apt update && apt install -y \
    curl unzip libcurl4 openssl ca-certificates gpg \
    && curl https://ryanfortner.github.io/box64-debs/box64.list -o /etc/apt/sources.list.d/box64.list \
    && curl -s https://ryanfortner.github.io/box64-debs/KEY.gpg | gpg --dearmor -o /etc/apt/trusted.gpg.d/box64-debs.gpg \
    && apt update && apt install -y box64 \
    && apt clean && rm -rf /var/lib/apt/lists/*

WORKDIR /minecraft
COPY server.sh /server.sh
RUN chmod +x /server.sh

# Minecraft Ports
EXPOSE 19132/udp
EXPOSE 19133/udp

ENTRYPOINT ["/bin/bash", "/server.sh"]
