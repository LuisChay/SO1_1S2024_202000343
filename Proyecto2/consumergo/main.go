package main

import (
    "context"
    "fmt"
    "os"
    "os/signal"
    "syscall"
    "github.com/segmentio/kafka-go"
)

func main() {
    fmt.Println("Starting Kafka consumer...")
    // Configura la dirección del servidor Kafka
    kafkaBrokers := []string{"my-cluster-kafka-bootstrap:9092"} // Reemplaza con la dirección de tus brokers Kafka

    // Configura el topic del que deseas consumir mensajes
    topic := "votes-submitted"

    // Configura el grupo de consumidores

    // Crea un nuevo lector Kafka
    r := kafka.NewReader(kafka.ReaderConfig{
        Brokers:  kafkaBrokers,
        Topic:    topic,
        MinBytes: 10e3, // 10KB
        MaxBytes: 10e6, // 10MB
        MaxAttempts: 5,
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
            message, err := r.ReadMessage(context.Background())
            if err != nil {
                fmt.Printf("Error reading message: %v\n", err)
                return
            }

            // Muestra el mensaje recibido en la salida estándar
            fmt.Printf("Received message a ver: %s\n", message.Value)
        }
    }
}
