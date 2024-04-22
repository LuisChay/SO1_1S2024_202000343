package main

import (
	"context"
	"fmt"
	"log"
	"net"

	"github.com/segmentio/kafka-go"
	"google.golang.org/grpc"
	pb "grpcServer/server"
)

type server struct {
	pb.UnimplementedGetInfoServer
}

type Data struct {
	Name  string
	Album string
	Year  string
	Rank  string
}

const (
    KafkaBroker = "my-cluster-kafka-bootstrap:9092"
	KafkaTopic  = "votes-submitted"
	port        = ":5001"
)

func produceToKafka(data Data) error {
	// Configurar el escritor de Kafka
	writer := kafka.NewWriter(kafka.WriterConfig{
		Brokers: []string{KafkaBroker},
		Topic:   KafkaTopic,
	})

	// Escribir el mensaje en Kafka
	err := writer.WriteMessages(context.Background(), kafka.Message{
		Key:   []byte(data.Name),
		Value: []byte(fmt.Sprintf("Name: %s, Album: %s, Year: %s, Rank: %s", data.Name, data.Album, data.Year, data.Rank)),
	})
	if err != nil {
		return err
	}

	// Cerrar el escritor de Kafka
	writer.Close()
	return nil
}

func (s *server) ReturnInfo(ctx context.Context, in *pb.RequestId) (*pb.ReplyInfo, error) {
	fmt.Println("Recibiendo de cliente")
	data := Data{
		Name:  in.GetName(),
		Album: in.GetAlbum(),
		Year:  in.GetYear(),
		Rank:  in.GetRank(),
	}
	fmt.Println(data)

	// Producir el mensaje en Kafka
	err := produceToKafka(data)
	if err != nil {
		fmt.Println("Error al producir mensaje en Kafka:", err)
		return nil, err
	}

	// Devolver la respuesta al cliente
	return &pb.ReplyInfo{Info: "Hola cliente, recibí el album"}, nil
}

func main() {
	fmt.Println("Server running on port", port)
	listen, err := net.Listen("tcp", port)
	if err != nil {
		fmt.Println("Error listening:", err)
		log.Fatalln(err)
	}
	s := grpc.NewServer()
	pb.RegisterGetInfoServer(s, &server{})

	if err := s.Serve(listen); err != nil {
		fmt.Println("Error serving:", err)
		log.Fatalln(err)
	}
}
