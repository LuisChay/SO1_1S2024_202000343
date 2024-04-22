# Puertos
- 5000: grpcClient
- 5001: grpcServer
- 5002: consumergo

# Locust
locust -f traffic.py

# Ingress
kubectl apply -f ingress.app.yaml -n so1-p2
34.133.48.217
https://35.192.158.55.nip.io/grpc
# Conexion
gcloud container clusters get-credentials cluster-so1p2 --zone us-central1-a --project so1-1s2024-202000343

# GRCP Deploy
kubectl apply -f grcpdeploy.yaml -n so1-p2

# Kafka
kubectl apply -f https://strimzi.io/install/latest?namespace=so1-p2 -n so1-p2
kubectl apply -f kafka.yaml -n so1-p2
kubectl apply -f kafkatopic.yaml -n so1-p2
Por medio de consola
kubectl apply -f create-kafka-topic.yaml
kubectl wait --for=condition=complete pod/kafka-topic-creator -n so1-p2
kubectl delete pod kafka-topic-creator -n so1-p2

# Consumergo
kubectl apply -f consumergodeploy.yaml -n so1-p2

# MongoDB
kubectl apply -f mongo-deployment.yaml -n so1-p2

# Comandos
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

