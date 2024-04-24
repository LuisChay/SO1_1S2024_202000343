use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use rdkafka::config::ClientConfig;
use rdkafka::producer::{FutureProducer, FutureRecord};
use serde_json::Value;
use std::time::Duration;

#[post("/data")]
async fn message(data: web::Json<Value>) -> impl Responder {
    let name = data.get("name").and_then(Value::as_str).unwrap_or("");
    let album = data.get("album").and_then(Value::as_str).unwrap_or("");
    let year = data.get("year").and_then(Value::as_str).unwrap_or("");
    let rank = data.get("rank").and_then(Value::as_str).unwrap_or("");

    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", "my-cluster-kafka-bootstrap:9092") 
        .set("message.timeout.ms", "5000")
        .create()
        .expect("Producer creation error");

    
    let message2 = format!(
            "Name: {}, Album: {}, Year: {}, Rank: {}",
            name, album, year, rank
    );

    match     producer
    .send(
        FutureRecord::to("votes-submitted")
            .key(name) 
            .payload(&message2),
        Duration::from_secs(0),
    ).await {
        Ok(_) => {
            actix_web::HttpResponse::Ok().body("message enviado a Kafka")
        }
        Err(err) => {
            eprintln!("Error enviando a kafka: {:?}", err);
            actix_web::HttpResponse::InternalServerError().finish()
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Iniciando servidor Rust");

    HttpServer::new(|| {
        App::new()
            .service(message)
    })
    .bind("0.0.0.0:5004")?
    .run()
    .await
}