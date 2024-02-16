package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"time"

	"github.com/gorilla/mux"
)

type Ram struct {
	Total      int `json:"Total_Ram"`
	En_uso     int `json:"Ram_en_Uso"`
	Libre      int `json:"Ram_libre"`
	Porcentaje int `json:"Porcentaje_en_uso"`
}

var ramInfo Ram

func main() {
	// Inicializar el enrutador y habilitar CORS
	router := mux.NewRouter()
	enableCORS(router)

	// Inicializar los valores de ram_info
	updateRamInfo()

	// Configurar un ticker para enviar los datos cada 2 segundos
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	// Goroutine para enviar los datos a la ruta /data
	go func() {
		for {
			select {
			case <-ticker.C:
				updateRamInfo()
			}
		}
	}()

	// Ruta para enviar los datos de ram_info
	router.HandleFunc("/data", func(writer http.ResponseWriter, req *http.Request) {
		json.NewEncoder(writer).Encode(ramInfo)
	}).Methods("GET")

	// Iniciar el servidor HTTP
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
			// Configurar cabeceras para permitir CORS
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization,Access-Control-Allow-Origin")
			// Llamar al siguiente manejador
			next.ServeHTTP(w, req)
		})
}

func updateRamInfo() {
	cmd := exec.Command("sh", "-c", "cat /proc/ram_202000343")
	out, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Println("Error al obtener la información de RAM:", err)
		return
	}

	var ram Ram
	err = json.Unmarshal(out, &ram)
	if err != nil {
		fmt.Println("Error al analizar la información de RAM:", err)
		return
	}

	ramInfo = ram
}
