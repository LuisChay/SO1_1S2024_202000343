use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use reqwest::Client;

#[derive(Debug, Deserialize, Serialize)]
struct Data {
    name: String,
    album: String,
    year: String,
    rank: String,
}

async fn recepcion(body: web::Json<Data>) -> impl Responder {
    println!("Recibiendo solicitud... 2");
    let client = Client::new();
    let response = client
        .post("http://localhost:5004/data")
        .header("Content-Type", "application/json")
        .body(serde_json::to_string(&body.into_inner()).unwrap())
        .send()
        .await;

    match response {
        Ok(response) => {
            if response.status().is_success() {
                match response.text().await {
                    Ok(text) => HttpResponse::Ok().body(text),
                    Err(_) => HttpResponse::InternalServerError().finish(),
                }
            } else {
                println!("Error de servidor: {:?}", response.status());
                HttpResponse::InternalServerError().finish()
            }
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Inserting data rust");
    HttpServer::new(|| {
        App::new()
            .route("/insert", web::post().to(recepcion))
    })
    .bind("0.0.0.0:5003")?
    .run()
    .await
}
