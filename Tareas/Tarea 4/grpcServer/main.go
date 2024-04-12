package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net"
	_ "github.com/go-sql-driver/mysql"
	"google.golang.org/grpc"
	pb "grpcServer/server"
)

type server struct {
	pb.UnimplementedGetInfoServer
}
type Data struct {
	Name string
	Album  string
	Year   string
	Rank string
}


const (
	DBUsername = ""
	DBPassword = ""
	DBHost     = ""
	DBPort     = "3306"
	DBName     = ""
	port       = ":5001"
)

func connectDB() (*sql.DB, error) {
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", DBUsername, DBPassword, DBHost, DBPort, DBName))
	if err != nil {
		fmt.Println("Error connecting to the database:", err)
		return nil, err
	}
	return db, nil
}

func (s *server) ReturnInfo(ctx context.Context, in *pb.RequestId) (*pb.ReplyInfo, error) {
	fmt.Println("Recibiendo de cliente")
	fmt.Println("Recibí de cliente: ", in.GetName())
	data := Data{
		Name: in.GetName(),
		Album:  in.GetAlbum(),
		Year:   in.GetYear(),
		Rank: in.GetRank(),
	}
	fmt.Println(data)
	
// Conectar a la base de datos
db, err := connectDB()
if err != nil {
	fmt.Println("Error al conectar a la base de datos:", err)
	return nil, err
}
defer db.Close()

// Preparar la consulta SQL para insertar los datos
query := "INSERT INTO music_data (artist, album, anio, puntuacion) VALUES (?, ?, ?, ?)"
stmt, err := db.Prepare(query)
if err != nil {
	fmt.Println("Error al preparar la consulta:", err)
	return nil, err
}
defer stmt.Close()

// Ejecutar la consulta SQL para insertar los datos
_, err = stmt.Exec(data.Name, data.Album, data.Year, data.Rank)
if err != nil {
	fmt.Println("Error al insertar los datos:", err)
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

	// redisConnect()

	if err := s.Serve(listen); err != nil {
		fmt.Println("Error serving:", err)
		log.Fatalln(err)
	}
}