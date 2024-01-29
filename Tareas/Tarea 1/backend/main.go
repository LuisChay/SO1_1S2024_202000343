package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

type Data struct {
	Nombre    string `json:"nombre"`
	Carnet    string `json:"carnet"`
	FechaHora string `json:"fecha_hora"`
}

func main() {
	fmt.Println("Backend corriendo")
	router := mux.NewRouter()
	enableCORS(router)

	router.HandleFunc("/data", func(writer http.ResponseWriter, req *http.Request) {
		datos := Data{
			Nombre:    "Luis Manuel Chay Marroquin",
			Carnet:    "202000343",
			FechaHora: time.Now().Format("2006-01-02 15:04:05"),
		}
		json.NewEncoder(writer).Encode(datos)
	}).Methods("GET")

	log.Fatal(http.ListenAndServe(":5000", router))
}

func enableCORS(router *mux.Router) {
	router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
	}).Methods(http.MethodOptions)
	router.Use(middlewareCors)
}

func middlewareCors(next http.Handler) http.Handler {
	return http.HandlerFunc(
		func(w http.ResponseWriter, req *http.Request) {
			// Just put some headers to allow CORS...
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization,Access-Control-Allow-Origin")
			// and call next handler!
			next.ServeHTTP(w, req)
		})
}
