from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def ph_status(ph):
    if ph < 6.0 or ph > 8.5:
        return "ALARM"
    elif ph < 6.5 or ph > 8.0:
        return "WARNING"
    return "NORMAL"

def temp_status(temp):
    if temp > 32:
        return "ALARM"
    elif temp > 30:
        return "WARNING"
    return "NORMAL"

@app.get("/data")
def get_data():
    kolam = []
    for i in range(1, 13):
        ph = round(random.uniform(5.8, 8.8), 2)
        temp = round(random.uniform(26, 33), 1)

        kolam.append({
            "kolam": i,
            "ph": ph,
            "temp": temp,
            "ph_status": ph_status(ph),
            "temp_status": temp_status(temp)
        })
    return kolam
