# Puertos
- 80: Vue (5173) (Cloud run)
- 3000: grafana
- 3100: api
- 5000: grpcClient
- 5001: grpcServer
- 5002: consumergo
- 5003: rustClient
- 5004: rustServer
- 9092: kafka
- 6379: redis
- 27017: mongo

# Locust
```bash
locust -f traffic.py
```
# Ingress
```bash
kubectl apply -f ingress.app.yaml -n so1-p2
```
34.133.48.217
http://35.192.158.55.nip.io/grpc
http://35.192.158.55.nip.io/rust

# Conexion
```bash
gcloud container clusters get-credentials cluster-so1p2 --zone us-central1-a --project so1-1s2024-202000343
```
# Rust deploy
```bash
kubectl apply -f rustdeploy.yaml -n so1-p2
```
34.122.155.86

# GRCP Deploy
```bash
kubectl apply -f grcpdeploy.yaml -n so1-p2
```

# Kafka
```bash
kubectl apply -f https://strimzi.io/install/latest?namespace=so1-p2 -n so1-p2
kubectl apply -f kafka.yaml -n so1-p2
kubectl apply -f kafkatopic.yaml -n so1-p2 # No funciono

# Por medio de consola
kubectl apply -f create-kafka-topic.yaml
kubectl wait --for=condition=complete pod/kafka-topic-creator -n so1-p2
kubectl delete pod kafka-topic-creator -n so1-p2
```

# Consumergo
```bash
kubectl apply -f consumergodeploy.yaml -n so1-p2
```
# MongoDB
```bash
kubectl apply -f mongo-deployment.yaml -n so1-p2
```
# Redis
```bash
kubectl apply -f redis-deployment.yaml -n so1-p2
```

# Grafana
```bash
kubectl apply -f grafana.yaml -n so1-p2
kubectl port-forward -n so1-p2 --address 0.0.0.0 svc/grafana 3000:3000
```
35.184.245.209:3000

# Cloud run
App vue: https://vueapp2-sav6cg7sqa-uc.a.run.app/
App api: https://apinode4-sav6cg7sqa-uc.a.run.app/datos

# Comandos
```bash
kubectl get all -n so1-p2
kubectl logs deploymentgrpc-6dbf4d46b9-gd46h -c containserver -f
kubectl logs deploymentgrpc-6dbf4d46b9-gd46h -c containclient -f
kubectl delete deployment kafka-consumer --cascade=true
kubectl delete pod my-cluster-zookeeper-0
kubectl delete service my-cluster-zookeeper-client

kubectl delete deployments --all
kubectl delete services --all
kubectl delete pods --all
kubectl delete hpa kafka-consumer-autoscaler
```