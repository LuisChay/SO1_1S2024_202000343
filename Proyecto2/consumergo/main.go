package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/segmentio/kafka-go"
	"github.com/go-redis/redis/v8"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/bson"
)

var ctx = context.Background()

func main() {
	fmt.Println("Starting Kafka consumer...")

	// Configura la dirección del servidor Kafka
	kafkaBrokers := []string{"my-cluster-kafka-bootstrap:9092"}

	// Configura el topic del que deseas consumir mensajes
	topic := "votes-submitted"

	// Configura la dirección del servidor Redis
	redisAddr := "redis-service:6379"

	// Crea un cliente Redis
	rdb := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: "", // si no hay contraseña
		DB:       0,  // usa el DB predeterminado
	})

	// Cierra la conexión de Redis al finalizar
	defer rdb.Close()

	// Configura la dirección de conexión a MongoDB
	mongoURI := "mongodb://mongodb-service:27017"
	clientOptions := options.Client().ApplyURI(mongoURI)

	// Conecta con MongoDB
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		fmt.Printf("Error connecting to MongoDB: %v\n", err)
		return
	}
	defer client.Disconnect(ctx)

	// Selecciona la base de datos y la colección en MongoDB
	collection := client.Database("mydatabase").Collection("votes")

	// Crea un nuevo lector Kafka
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:      kafkaBrokers,
		Topic:        topic,
		MinBytes:     10e3, // 10KB
		MaxBytes:     10e6, // 10MB
		MaxAttempts:  5,
		GroupID:      "group-id",
		StartOffset:  kafka.LastOffset,
	})

	// Cierra el lector de Kafka al finalizar
	defer r.Close()

	// Configura el canal para capturar las señales de terminación
	sigterm := make(chan os.Signal, 1)
	signal.Notify(sigterm, syscall.SIGINT, syscall.SIGTERM)

	// Inicia un bucle para leer los mensajes de Kafka
	for {
		select {
		case <-sigterm:
			// Señal de terminación recibida, salir del bucle
			fmt.Println("Received termination signal. Exiting...")
			return
		default:
			// Lee un mensaje del topic
			message, err := r.ReadMessage(ctx)
			if err != nil {
				fmt.Printf("Error reading message: %v\n", err)
				return
			}

			// Convertir el mensaje en una cadena
			msgStr := string(message.Value)

			// Dividir el mensaje en sus partes utilizando la coma (`,`) como delimitador
			parts := strings.Split(msgStr, ",")

			// Inicializar variables para almacenar los valores
			var name, album, year, rank string

			// Iterar sobre las partes y extraer los valores de las claves y sus correspondientes valores
			for _, part := range parts {
				keyValue := strings.Split(part, ":")
				key := strings.TrimSpace(keyValue[0])
				value := strings.TrimSpace(keyValue[1])

				switch key {
				case "Name":
					name = value
				case "Album":
					album = value
				case "Year":
					year = value
				case "Rank":
					rank = value
				}
			}

			fmt.Printf("Name: %s\n", name)
			fmt.Printf("Album: %s\n", album)
			fmt.Printf("Year: %s\n", year)
			fmt.Printf("Rank: %s\n", rank)

			// Generar la clave para Redis
			redisKey := name + "_" + album + "_" + year
			fmt.Printf("Redis Key: %s\n", redisKey)

			// Incrementar el contador de votos en Redis
			err = rdb.HIncrBy(ctx,"votes",redisKey, 1).Err()
			if err != nil {
				fmt.Printf("Error incrementing vote count in Redis: %v\n", err)
				return
			}

			fmt.Printf("Successfully incremented vote count for %s in Redis\n", redisKey)

			// Insertar el mensaje completo en MongoDB junto con la fecha y hora de inserción
			document := bson.M{
				"message":  msgStr,
				"inserted": time.Now(),
			}

			// Insertar el documento en la colección de MongoDB
			_, err = collection.InsertOne(ctx, document)
			if err != nil {
				fmt.Printf("Error inserting document into MongoDB: %v\n", err)
				return
			}

			fmt.Println("Successfully inserted document into MongoDB")
		}
	}
}
