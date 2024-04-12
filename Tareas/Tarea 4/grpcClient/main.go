package main

import (
	"context"
	"fmt"
	"log"
	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
	pb "grpcClient/client"
	"google.golang.org/grpc/credentials/insecure"
)

var ctx = context.Background()

type Data struct {
	Name string
	Album  string
	Year   string
	Rank string
}
func insertData(c *fiber.Ctx) error {
	fmt.Println("Inserting data")
	var data map[string]string
	e := c.BodyParser(&data)
	if e != nil {
		fmt.Println("Error parsing data")
		return e
	}

	rank := Data{
		Name: data["name"],
		Album:  data["album"],
		Year:   data["year"],
		Rank: data["rank"],
	}

	conn, err := grpc.Dial("localhost:5001", grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock())
	if err != nil {
		fmt.Println("Error connecting to server")
		log.Fatalln(err)
	}


	cl := pb.NewGetInfoClient(conn)
	defer func(conn *grpc.ClientConn) {
		err := conn.Close()
		if err != nil {
			fmt.Println("Error closing connection")
			log.Fatalln(err)
		}
	}(conn)

	ret, err := cl.ReturnInfo(ctx, &pb.RequestId{
		Name: rank.Name,
		Album:  rank.Album,
		Year:   rank.Year,
		Rank: rank.Rank,
	})
	if err != nil {
		fmt.Println("Error getting response")
		log.Fatalln(err)
	}

	fmt.Println("Respuesta del server " + ret.GetInfo())

	return nil
}

func main() {
	app := fiber.New()
	app.Post("/insert", insertData)

	err := app.Listen(":5000")
	if err != nil {
		return
	}
}