#!/bin/bash

# Ждем запуска MinIO
echo "Waiting for MinIO to start..."
until curl -s http://localhost:9000/minio/health/live; do
  sleep 1
done

# Создаем бакет price-feeds
echo "Creating price-feeds bucket..."
mc alias set myminio http://localhost:9000 minioadmin minioadmin
mc mb myminio/price-feeds --ignore-existing

echo "MinIO initialization completed!"
