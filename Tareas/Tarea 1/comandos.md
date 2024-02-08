
## FRONTEND

### Crear imagen
```bash
docker build -t luischay/so1tarea1_frontend .
docker images
```

### Crear contenedor
```bash
docker run --rm -it -p 3000:3000 luischay/so1tarea1_frontend
docker ps
```

## BACKEND

### Crear imagen
```bash
docker build -t luischay/so1tarea1_backend .
docker images
```

### Crear contenedor
```bash
docker run --rm -it -p 5000:5000 luischay/so1tarea1_backend
docker ps
```

### Limpieza cache
```bash
docker builder prune
```


