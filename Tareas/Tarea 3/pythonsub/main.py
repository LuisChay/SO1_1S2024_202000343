import redis
import time

# Configuración de conexión a Redis Memory Store
client = redis.StrictRedis(host='10.192.83.219', port=6379, decode_responses=True) 

# Suscriptor
def suscribir_canal():
    while True:
        pubsub = client.pubsub()
        pubsub.subscribe('test')  # Suscribirse al canal 'test'
        print("Esperando mensajes...")
        for message in pubsub.listen():
            if message['type'] == 'message':
                print("Mensaje recibido:", message['data'])
                break  # Terminar la escucha después de recibir un mensaje
        time.sleep(3)  # Esperar 3 segundos antes de suscribirse nuevamente

# Suscribirse al canal continuamente
suscribir_canal()