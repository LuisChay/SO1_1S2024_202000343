package main

import (
	"encoding/json"
	"fmt"
	"database/sql"
	"log"
	"net/http"
	"os/exec"
	"time"
    _ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
    "strconv"

)

type Response struct {
    Message string `json:"message"`
    PID     int    `json:"pid,omitempty"`
}

type Ram struct {
	Total      int `json:"Total_Ram"`
	En_uso     int `json:"Ram_en_Uso"`
	Libre      int `json:"Ram_libre"`
	Porcentaje int `json:"Porcentaje_en_uso"`
}

type Process struct {
	Pid     int    `json:"pid"`
	Nombre  string `json:"nombre"`
	Usuario int    `json:"usuario"`
	Estado  int    `json:"estado"`
	Ram     int    `json:"ram"`
	Padre   int    `json:"padre"`
}

type Cpu struct {
	Porcentaje int       `json:"Porcentaje_en_uso"`
	Procesos   []Process `json:"tasks"`
}

const (
    DBUsername = "root"
    DBPassword = "root"
    DBHost     = "mysqlcontain"
    DBPort     = "3306"
    DBName     = "p1_so1"
)

var ramInfo Ram
var cpuInfo Cpu
var process *exec.Cmd 

func connectDB() (*sql.DB, error) {
    db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", DBUsername, DBPassword, DBHost, DBPort, DBName))
    if err != nil {
        return nil, err
    }
    return db, nil
}

// DEBUG
// DROP TABLE IF EXISTS ram_historico;
// DROP TABLE IF EXISTS cpu_historico;  

// SELECT * FROM cpu_historico;
// SELECT * FROM  ram_historico;

func main() {
	fmt.Println("Iniciando el servidor...")
    router := mux.NewRouter()
    enableCORS(router)

    // Inicializar los valores de ramInfo y cpuInfo
    updateRamInfo()
    updateCpuInfo() // Llama a updateCpuInfo sin argumentos

    // Configurar un ticker para enviar los datos cada 2 segundos
    ticker := time.NewTicker(2 * time.Second)
    defer ticker.Stop()

    // Goroutine para actualizar ramInfo y cpuInfo cada 2 segundos
    go func() {
        for {
            select {
            case <-ticker.C:
                updateRamInfo()
                updateCpuInfo() // Llama a updateCpuInfo sin argumentos
            }
        }
    }()

    // Nueva goroutine para insertar datos en la base de datos cada 5 segundos
    go func() {
        insertTicker := time.NewTicker(5 * time.Second)
        defer insertTicker.Stop()

        for {
            select {
            case <-insertTicker.C:
                // Insertar datos en la base de datos
                err := insertRamInfoToDB(ramInfo)
                if err != nil {
                    fmt.Println("Error al insertar datos de RAM en la base de datos:", err)
                }

                err = insertCpuInfoToDB(cpuInfo)
                if err != nil {
                    fmt.Println("Error al insertar datos de CPU en la base de datos:", err)
                }
            }
        }
    }()

    // Rutas para enviar los datos de ramInfo y cpuInfo
    router.HandleFunc("/api/ram", func(writer http.ResponseWriter, req *http.Request) {
        json.NewEncoder(writer).Encode(ramInfo)
    }).Methods("GET")

    router.HandleFunc("/api/cpu", func(writer http.ResponseWriter, req *http.Request) {
        updateCpuInfoHandler(writer, req) // Handler específico para actualizar cpuInfo
    }).Methods("GET")

	router.HandleFunc("/api/ramhistorico", func(writer http.ResponseWriter, req *http.Request) {
		jsonData, err := getRecentRamDataFromDB()
		if err != nil {
			fmt.Println("Error al obtener datos de RAM desde la base de datos:", err)
			http.Error(writer, "Error interno del servidor", http.StatusInternalServerError)
			return
		}
	
		// Imprimir los datos obtenidos de la consulta
		//fmt.Println("Datos de RAM obtenidos de la base de datos:")
		//fmt.Println(string(jsonData))
	
		// Escribir la respuesta JSON en el ResponseWriter
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusOK)
		writer.Write(jsonData)
	}).Methods("GET")
	
	router.HandleFunc("/api/cpuhistorico", func(writer http.ResponseWriter, req *http.Request) {
		jsonData, err := getRecentCpuDataFromDB()
		if err != nil {
			fmt.Println("Error al obtener datos de CPU desde la base de datos:", err)
			http.Error(writer, "Error interno del servidor", http.StatusInternalServerError)
			return
		}
	
		// Imprimir los datos obtenidos de la consulta
		//fmt.Println("Datos de CPU obtenidos de la base de datos:")
		//fmt.Println(string(jsonData))
	
		// Escribir la respuesta JSON en el ResponseWriter
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusOK)
		writer.Write(jsonData)
	}).Methods("GET")

        router.HandleFunc("/api/start", StartProcess).Methods("POST")
        router.HandleFunc("/api/stop", StopProcess).Methods("POST")
        router.HandleFunc("/api/resume", ResumeProcess).Methods("POST")
        router.HandleFunc("/api/kill", KillProcess).Methods("POST")

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
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization,Access-Control-Allow-Origin")
			next.ServeHTTP(w, req)
		})
}

func updateRamInfo() {
	cmd := exec.Command("sh", "-c", "cat /proc/ram_so1_1s2024")
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
	//fmt.Println("Datos de RAM actualizados:", ramInfo)
}

func updateCpuInfo() {
	cmdCpu := exec.Command("sh", "-c", "cat /proc/cpu_so1_1s2024")
	outCpu, err := cmdCpu.CombinedOutput()
	if err != nil {
		fmt.Println("Error al obtener la información de CPU:", err)
		return
	}

	var cpuData struct {
		PorcentajeEnUso int       `json:"Porcentaje_en_uso"`
		Tasks           []Process `json:"tasks"`
	}
	err = json.Unmarshal(outCpu, &cpuData)
	if err != nil {
		fmt.Println("Error al analizar la información de CPU:", err)
		return
	}

	// Calcular el porcentaje de uso de la CPU
	var totalCPUUsage int
	for _, process := range cpuData.Tasks {
		totalCPUUsage += process.Ram
	}
	totalCPUTasks := len(cpuData.Tasks)
	if totalCPUTasks > 0 {
		cpuInfo.Porcentaje = totalCPUUsage / totalCPUTasks
	} else {
		cpuInfo.Porcentaje = 0
	}

	cpuInfo.Procesos = cpuData.Tasks

	//fmt.Println("Datos de CPU actualizados:", cpuInfo)
}

func updateCpuInfoHandler(w http.ResponseWriter, req *http.Request) {
	// Actualiza la información de la CPU y escribe la respuesta
	updateCpuInfo()

	// Convertir la estructura cpuInfo a JSON
	cpuJSON, err := json.Marshal(cpuInfo)
	if err != nil {
		fmt.Println("Error al convertir la información de CPU a JSON:", err)
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		return
	}

	// Escribir la respuesta JSON en el ResponseWriter
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(cpuJSON)
}

func insertRamInfoToDB(ram Ram) error {
    db, err := connectDB()
    if err != nil {
        return err
    }
    defer db.Close()

    // Preparar la consulta SQL para insertar los datos de RAM
    query := "INSERT INTO ram_historico (uso, fecha) VALUES (?, ?)"
    _, err = db.Exec(query, ram.Porcentaje, time.Now())
    if err != nil {
        return err
    }

    return nil
}

func insertCpuInfoToDB(cpu Cpu) error {
    db, err := connectDB()
    if err != nil {
        return err
    }
    defer db.Close()

	//fmt.Println("cpu.Porcentaje: ", cpu.Porcentaje)

    // Preparar la consulta SQL para insertar los datos de CPU
    query := "INSERT INTO cpu_historico (uso, fecha) VALUES (?, ?)"
    _, err = db.Exec(query, cpu.Porcentaje, time.Now())
    if err != nil {
        return err
    }
    return nil
}

func getRecentRamDataFromDB() ([]byte, error) {
    db, err := connectDB()
    if err != nil {
        return nil, err
    }
    defer db.Close()

    // Preparar la consulta SQL para obtener los últimos 10 datos de RAM
    query := "SELECT uso, fecha FROM ram_historico ORDER BY fecha DESC LIMIT 10"
    rows, err := db.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    // Crear una estructura para almacenar los resultados
    var ramData []struct {
        Uso   int       `json:"uso"`
        Fecha time.Time `json:"fecha"`
    }

    // Iterar sobre las filas y guardar los datos en la estructura
    for rows.Next() {
        var uso int
        var fecha time.Time
        err := rows.Scan(&uso, &fecha)
        if err != nil {
            return nil, err
        }
        ramData = append(ramData, struct {
            Uso   int       `json:"uso"`
            Fecha time.Time `json:"fecha"`
        }{uso, fecha})
    }

    // Convertir los datos a formato JSON
    jsonData, err := json.Marshal(ramData)
    if err != nil {
        return nil, err
    }

    return jsonData, nil
}

func getRecentCpuDataFromDB() ([]byte, error) {
    db, err := connectDB()
    if err != nil {
        return nil, err
    }
    defer db.Close()

    // Preparar la consulta SQL para obtener los últimos 10 datos de CPU
    query := "SELECT uso, fecha FROM cpu_historico ORDER BY fecha DESC LIMIT 10"
    rows, err := db.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    // Crear una estructura para almacenar los resultados
    var cpuData []struct {
        Uso   int       `json:"uso"`
        Fecha time.Time `json:"fecha"`
    }

    // Iterar sobre las filas y guardar los datos en la estructura
    for rows.Next() {
        var uso int
        var fecha time.Time
        err := rows.Scan(&uso, &fecha)
        if err != nil {
            return nil, err
        }
        cpuData = append(cpuData, struct {
            Uso   int       `json:"uso"`
            Fecha time.Time `json:"fecha"`
        }{uso, fecha})
    }

    // Convertir los datos a formato JSON
    jsonData, err := json.Marshal(cpuData)
    if err != nil {
        return nil, err
    }

    return jsonData, nil
}
// Funciones para el manejo de procesos

// Envia la señal para crear un nuevo proceso
func StartProcess(w http.ResponseWriter, r *http.Request) {
    // Crear un nuevo proceso con un comando de espera
    cmd := exec.Command("sleep", "infinity")
    err := cmd.Start()
    if err != nil {
        fmt.Print(err)
        http.Error(w, "Error al iniciar el proceso", http.StatusInternalServerError)
        return
    }

    // Obtener el comando con PID
    process = cmd

    response := Response{
        Message: fmt.Sprintf("Proceso iniciado con PID: %d y estado en espera", process.Process.Pid),
        PID:     process.Process.Pid,
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// Envia la señal para detener un proceso
func StopProcess(w http.ResponseWriter, r *http.Request) {
    var req struct {
        PID int `json:"pid"`
    }
    err := json.NewDecoder(r.Body).Decode(&req)
    if err != nil {
        http.Error(w, "Error al decodificar la solicitud", http.StatusBadRequest)
        return
    }

    // Enviar señal SIGSTOP al proceso con el PID proporcionado
    cmd := exec.Command("kill", "-SIGSTOP", strconv.Itoa(req.PID))
    err = cmd.Run()
    if err != nil {
        http.Error(w, fmt.Sprintf("Error al detener el proceso con PID %d", req.PID), http.StatusInternalServerError)
        return
    }

    response := Response{
        Message: fmt.Sprintf("Proceso con PID %d detenido", req.PID),
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// Envia la señal para reanudar un proceso
func ResumeProcess(w http.ResponseWriter, r *http.Request) {
    var req struct {
        PID int `json:"pid"`
    }
    err := json.NewDecoder(r.Body).Decode(&req)
    if err != nil {
        http.Error(w, "Error al decodificar la solicitud", http.StatusBadRequest)
        return
    }

    // Enviar señal SIGCONT al proceso con el PID proporcionado
    cmd := exec.Command("kill", "-SIGCONT", strconv.Itoa(req.PID))
    err = cmd.Run()
    if err != nil {
        http.Error(w, fmt.Sprintf("Error al reanudar el proceso con PID %d", req.PID), http.StatusInternalServerError)
        return
    }

    response := Response{
        Message: fmt.Sprintf("Proceso con PID %d reanudado", req.PID),
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// Envia la señal para matar un proceso
func KillProcess(w http.ResponseWriter, r *http.Request) {
    var req struct {
        PID int `json:"pid"`
    }
    err := json.NewDecoder(r.Body).Decode(&req)
    if err != nil {
        http.Error(w, "Error al decodificar la solicitud", http.StatusBadRequest)
        return
    }

    // Enviar señal SIGKILL al proceso con el PID proporcionado
    cmd := exec.Command("kill", "-9", strconv.Itoa(req.PID))
    err = cmd.Run()
    if err != nil {
        http.Error(w, fmt.Sprintf("Error al intentar terminar el proceso con PID %d", req.PID), http.StatusInternalServerError)
        return
    }

    response := Response{
        Message: fmt.Sprintf("Proceso con PID %d ha terminado", req.PID),
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
